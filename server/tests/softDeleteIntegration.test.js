const mongoose = require('mongoose');
const Video = require('../models/Video');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const SoftDeleteService = require('../services/softDeleteService');
const AuditLogger = require('../services/auditLogger');
const CleanupScheduler = require('../services/cleanupScheduler');

describe('Soft Delete Integration Tests', () => {
  let testUser, testVideo, testPost, testComment;

  beforeAll(async () => {
    // Connect to test database
    const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/huddleup_test';
    await mongoose.connect(mongoUrl);
  });

  beforeEach(async () => {
    // Clean up test data
    await Promise.all([
      User.deleteMany({}),
      Video.deleteMany({}),
      Post.deleteMany({}),
      Comment.deleteMany({})
    ]);
    
    // Clean up audit logs
    try {
      await mongoose.connection.db.collection('audit_logs').drop();
    } catch (error) {
      // Collection might not exist, ignore error
    }

    // Create test user
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword'
    });

    // Create test content
    testVideo = await Video.create({
      title: 'Test Video',
      description: 'Test Description',
      videoUrl: 'http://example.com/video.mp4',
      thumbnailUrl: 'http://example.com/thumb.jpg',
      postedBy: testUser._id,
      category: 'Entertainment'
    });

    testPost = await Post.create({
      title: 'Test Post',
      content: 'Test post content',
      category: 'General',
      postedBy: testUser._id
    });

    testComment = await Comment.create({
      text: 'Test comment',
      userId: testUser._id,
      videoId: testVideo._id
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('Complete soft delete workflow', async () => {
    // 1. Verify content exists initially
    let videos = await Video.find({});
    let posts = await Post.find({});
    let comments = await Comment.find({});
    
    expect(videos).toHaveLength(1);
    expect(posts).toHaveLength(1);
    expect(comments).toHaveLength(1);

    // 2. Soft delete video (should cascade to comment)
    const deletedVideo = await SoftDeleteService.softDelete(
      Video, 
      testVideo._id, 
      testUser._id, 
      'Integration test deletion'
    );

    expect(deletedVideo.isDeleted).toBe(true);
    expect(deletedVideo.deletedAt).toBeDefined();
    expect(deletedVideo.deletedBy.toString()).toBe(testUser._id.toString());

    // 3. Verify content is hidden from normal queries
    videos = await Video.find({});
    comments = await Comment.find({});
    
    expect(videos).toHaveLength(0); // Hidden by middleware
    expect(comments).toHaveLength(0); // Cascade deleted

    // 4. Verify content exists with includeSoftDeleted
    const videosWithDeleted = await Video.find({}, null, { includeSoftDeleted: true });
    const commentsWithDeleted = await Comment.find({}, null, { includeSoftDeleted: true });
    
    expect(videosWithDeleted).toHaveLength(1);
    expect(commentsWithDeleted).toHaveLength(1);
    expect(commentsWithDeleted[0].isDeleted).toBe(true);

    // 5. Verify audit logs were created
    const auditLogs = await AuditLog.find({}).sort({ timestamp: 1 });
    expect(auditLogs.length).toBeGreaterThanOrEqual(2); // Deletion + cascade

    const deletionLog = auditLogs.find(log => log.eventType === 'SOFT_DELETE');
    const cascadeLog = auditLogs.find(log => log.eventType === 'CASCADE_DELETE');
    
    expect(deletionLog).toBeTruthy();
    expect(deletionLog.contentType).toBe('Video');
    expect(deletionLog.contentId.toString()).toBe(testVideo._id.toString());
    
    expect(cascadeLog).toBeTruthy();
    expect(cascadeLog.metadata.cascadeInfo.affectedChildren).toHaveLength(1);

    // 6. Restore the video (should restore comment too)
    const restoredVideo = await SoftDeleteService.restore(
      Video, 
      testVideo._id, 
      testUser._id
    );

    expect(restoredVideo.isDeleted).toBe(false);
    expect(restoredVideo.restoredAt).toBeDefined();
    expect(restoredVideo.restoredBy.toString()).toBe(testUser._id.toString());

    // 7. Verify content is visible again
    videos = await Video.find({});
    comments = await Comment.find({});
    
    expect(videos).toHaveLength(1);
    expect(comments).toHaveLength(1);
    expect(comments[0].isDeleted).toBe(false);

    // 8. Verify restoration audit logs
    const restorationLogs = await AuditLog.find({ eventType: 'RESTORE' });
    expect(restorationLogs).toHaveLength(1);
    expect(restorationLogs[0].contentType).toBe('Video');
  });

  test('Cleanup scheduler workflow', async () => {
    // 1. Soft delete content
    await SoftDeleteService.softDelete(Video, testVideo._id, testUser._id, 'Test cleanup');
    
    // 2. Manually set old deletion date (31 days ago)
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 31);
    await Video.findByIdAndUpdate(testVideo._id, { deletedAt: oldDate }, { includeSoftDeleted: true });

    // Verify the date was set correctly
    const updatedVideo = await Video.findById(testVideo._id, null, { includeSoftDeleted: true });
    expect(updatedVideo.deletedAt.getTime()).toBeLessThan(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // 3. Run cleanup (dry run first)
    const dryRunResults = await CleanupScheduler.performCleanup({
      retentionDays: 30,
      dryRun: true
    });

    expect(dryRunResults.Video.deletedCount).toBe(1);

    // Verify content still exists after dry run
    const videoAfterDryRun = await Video.findById(testVideo._id, null, { includeSoftDeleted: true });
    expect(videoAfterDryRun).toBeTruthy();

    // 4. Run actual cleanup
    const actualResults = await CleanupScheduler.performCleanup({
      retentionDays: 30,
      dryRun: false
    });

    expect(actualResults.Video.deletedCount).toBe(1);

    // Verify content is permanently deleted
    const videoAfterCleanup = await Video.findById(testVideo._id, null, { includeSoftDeleted: true });
    expect(videoAfterCleanup).toBeNull();

    // 5. Verify cleanup audit log
    const cleanupLogs = await AuditLog.find({ eventType: 'CLEANUP' });
    expect(cleanupLogs).toHaveLength(2); // Dry run + actual cleanup
  });

  test('Query middleware behavior', async () => {
    // Create additional content
    const video2 = await Video.create({
      title: 'Video 2',
      description: 'Description 2',
      videoUrl: 'http://example.com/video2.mp4',
      thumbnailUrl: 'http://example.com/thumb2.jpg',
      postedBy: testUser._id,
      category: 'Entertainment'
    });

    // Soft delete one video
    await SoftDeleteService.softDelete(Video, testVideo._id, testUser._id, 'Test middleware');

    // Test normal queries exclude soft deleted
    const activeVideos = await Video.find({});
    expect(activeVideos).toHaveLength(1);
    expect(activeVideos[0]._id.toString()).toBe(video2._id.toString());

    // Test findWithDeleted includes all
    const allVideos = await Video.findWithDeleted();
    expect(allVideos).toHaveLength(2);

    // Test findDeleted returns only deleted
    const deletedVideos = await Video.findDeleted();
    expect(deletedVideos).toHaveLength(1);
    expect(deletedVideos[0]._id.toString()).toBe(testVideo._id.toString());
  });

  test('Audit logger functionality', async () => {
    // Create some audit entries
    await AuditLogger.logDeletion('Video', testVideo._id, testUser._id, 'Test audit');
    await AuditLogger.logRestoration('Video', testVideo._id, testUser._id);
    await AuditLogger.logPermanentDeletion('Post', testPost._id, testUser._id);

    // Test report generation
    const report = await AuditLogger.generateReport({
      contentType: 'Video',
      page: 1,
      limit: 10
    });

    expect(report.totalCount).toBe(2); // Deletion + restoration
    expect(report.data).toHaveLength(2);

    // Test statistics
    const stats = await AuditLogger.getAuditStats();
    expect(stats.totalEvents).toBe(3);
    expect(stats.eventTypeStats).toHaveLength(3); // SOFT_DELETE, RESTORE, PERMANENT_DELETE
  });

  test('Error handling', async () => {
    const fakeId = new mongoose.Types.ObjectId();

    // Test soft delete non-existent content
    await expect(
      SoftDeleteService.softDelete(Video, fakeId, testUser._id, 'Test')
    ).rejects.toThrow('Document not found');

    // Test restore non-deleted content
    await expect(
      SoftDeleteService.restore(Video, testVideo._id, testUser._id)
    ).rejects.toThrow('Document is not deleted');

    // Test restore non-existent content
    await expect(
      SoftDeleteService.restore(Video, fakeId, testUser._id)
    ).rejects.toThrow('Document not found');
  });
});