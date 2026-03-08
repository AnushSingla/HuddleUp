const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const jwt = require('jsonwebtoken');

// Import models and services
const Video = require('../models/Video');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Playlist = require('../models/Playlist');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const SoftDeleteService = require('../services/softDeleteService');
const AuditLogger = require('../services/auditLogger');
const CleanupScheduler = require('../services/cleanupScheduler');

// Import routes
const userDeleteRoutes = require('../routes/userDelete');
const adminRoutes = require('../routes/admin');
const { verifyToken } = require('../middleware/auth');

// Test app setup
const app = express();
app.use(express.json());
app.use('/api/user', userDeleteRoutes);
app.use('/api/admin', adminRoutes);

describe('Soft Delete System', () => {
  let testUser, testAdmin, testVideo, testPost, testComment, testPlaylist;
  let userToken, adminToken;

  beforeAll(async () => {
    // Connect to test database
    const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/huddleup_test';
    await mongoose.connect(mongoUrl);
  });

  beforeEach(async () => {
    // Clean up test data (skip AuditLog as it's immutable)
    await Promise.all([
      User.deleteMany({}),
      Video.deleteMany({}),
      Post.deleteMany({}),
      Comment.deleteMany({}),
      Playlist.deleteMany({})
    ]);
    
    // Clean up audit logs by dropping and recreating the collection
    try {
      await mongoose.connection.db.collection('audit_logs').drop();
    } catch (error) {
      // Collection might not exist, ignore error
    }

    // Create test user
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword',
      isAdmin: false
    });

    // Create test admin
    testAdmin = await User.create({
      username: 'testadmin',
      email: 'admin@example.com',
      password: 'hashedpassword',
      isAdmin: true,
      role: 'admin'
    });

    // Generate tokens
    userToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET || 'testsecret');
    adminToken = jwt.sign({ id: testAdmin._id }, process.env.JWT_SECRET || 'testsecret');

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

    testPlaylist = await Playlist.create({
      name: 'Test Playlist',
      description: 'Test playlist description',
      userId: testUser._id,
      videos: [testVideo._id]
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('SoftDeleteService', () => {
    test('should soft delete a video with audit logging', async () => {
      const result = await SoftDeleteService.softDelete(
        Video, 
        testVideo._id, 
        testUser._id, 
        'User deleted'
      );

      expect(result.isDeleted).toBe(true);
      expect(result.deletedAt).toBeDefined();
      expect(result.deletedBy.toString()).toBe(testUser._id.toString());
      expect(result.deleteReason).toBe('User deleted');

      // Check audit log was created
      const auditLog = await AuditLog.findOne({
        contentType: 'Video',
        contentId: testVideo._id,
        eventType: 'SOFT_DELETE'
      });
      expect(auditLog).toBeTruthy();
      expect(auditLog.userId.toString()).toBe(testUser._id.toString());
    });

    test('should restore a soft deleted video', async () => {
      // First soft delete
      await SoftDeleteService.softDelete(Video, testVideo._id, testUser._id, 'Test deletion');

      // Then restore
      const result = await SoftDeleteService.restore(Video, testVideo._id, testUser._id);

      expect(result.isDeleted).toBe(false);
      expect(result.deletedAt).toBeUndefined();
      expect(result.restoredAt).toBeDefined();
      expect(result.restoredBy.toString()).toBe(testUser._id.toString());

      // Check audit log for restoration
      const auditLog = await AuditLog.findOne({
        contentType: 'Video',
        contentId: testVideo._id,
        eventType: 'RESTORE'
      });
      expect(auditLog).toBeTruthy();
    });

    test('should handle cascade deletion for video comments', async () => {
      // Soft delete video (should cascade to comments)
      await SoftDeleteService.softDelete(Video, testVideo._id, testUser._id, 'Test cascade');

      // Check that comment was also soft deleted
      const comment = await Comment.findById(testComment._id, null, { includeSoftDeleted: true });
      expect(comment.isDeleted).toBe(true);
      expect(comment.deleteReason).toBe('Parent video deleted');

      // Check cascade audit log
      const cascadeLog = await AuditLog.findOne({
        eventType: 'CASCADE_DELETE',
        contentType: 'Video',
        contentId: testVideo._id
      });
      expect(cascadeLog).toBeTruthy();
      expect(cascadeLog.metadata.cascadeInfo.affectedChildren).toHaveLength(1);
    });

    test('should handle cascade restoration', async () => {
      // First cascade delete
      await SoftDeleteService.softDelete(Video, testVideo._id, testUser._id, 'Test cascade');

      // Then restore (should restore cascaded comments)
      await SoftDeleteService.restore(Video, testVideo._id, testUser._id);

      // Check that comment was restored
      const comment = await Comment.findById(testComment._id);
      expect(comment.isDeleted).toBe(false);
      expect(comment.restoredAt).toBeDefined();

      // Check cascade restoration audit log
      const cascadeLog = await AuditLog.findOne({
        eventType: 'CASCADE_RESTORE',
        contentType: 'Video',
        contentId: testVideo._id
      });
      expect(cascadeLog).toBeTruthy();
    });

    test('should get deleted content with pagination', async () => {
      // Soft delete some content
      await SoftDeleteService.softDelete(Video, testVideo._id, testUser._id, 'Test');
      await SoftDeleteService.softDelete(Post, testPost._id, testUser._id, 'Test');

      const result = await SoftDeleteService.getDeleted(Video, {
        page: 1,
        limit: 10,
        deletedBy: testUser._id
      });

      expect(result.documents).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(result.documents[0]._id.toString()).toBe(testVideo._id.toString());
    });

    test('should permanently delete content', async () => {
      await SoftDeleteService.permanentDelete(Video, testVideo._id, testUser._id);

      const video = await Video.findById(testVideo._id);
      expect(video).toBeNull();
    });
  });

  describe('User Delete API', () => {
    test('should get user deleted content', async () => {
      // Soft delete some content
      await SoftDeleteService.softDelete(Video, testVideo._id, testUser._id, 'User deleted');
      await SoftDeleteService.softDelete(Post, testPost._id, testUser._id, 'User deleted');

      const response = await request(app)
        .get('/api/user/deleted')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.videos).toHaveLength(1);
      expect(response.body.data.posts).toHaveLength(1);
    });

    test('should restore user content', async () => {
      // Soft delete content
      await SoftDeleteService.softDelete(Video, testVideo._id, testUser._id, 'User deleted');

      const response = await request(app)
        .post(`/api/user/deleted/restore/video/${testVideo._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify content is restored
      const video = await Video.findById(testVideo._id);
      expect(video.isDeleted).toBe(false);
    });

    test('should not allow restoring expired content', async () => {
      // Soft delete content and manually set old deletion date
      await SoftDeleteService.softDelete(Video, testVideo._id, testUser._id, 'User deleted');
      
      // Set deletion date to 31 days ago (beyond recovery window)
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 31);
      await Video.findByIdAndUpdate(testVideo._id, { deletedAt: oldDate });

      const response = await request(app)
        .post(`/api/user/deleted/restore/video/${testVideo._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);

      expect(response.body.error.code).toBe('RESTORATION_EXPIRED');
    });

    test('should permanently delete user content', async () => {
      // Soft delete content first
      await SoftDeleteService.softDelete(Video, testVideo._id, testUser._id, 'User deleted');

      const response = await request(app)
        .delete(`/api/user/deleted/permanent/video/${testVideo._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify content is permanently deleted
      const video = await Video.findById(testVideo._id);
      expect(video).toBeNull();
    });

    test('should handle bulk restoration', async () => {
      // Soft delete multiple items
      await SoftDeleteService.softDelete(Video, testVideo._id, testUser._id, 'User deleted');
      await SoftDeleteService.softDelete(Post, testPost._id, testUser._id, 'User deleted');

      const response = await request(app)
        .post('/api/user/deleted/bulk-restore')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          items: [
            { type: 'video', id: testVideo._id },
            { type: 'post', id: testPost._id }
          ]
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.restored).toHaveLength(2);
      expect(response.body.data.errors).toHaveLength(0);

      // Verify content is restored
      const video = await Video.findById(testVideo._id);
      const post = await Post.findById(testPost._id);
      expect(video.isDeleted).toBe(false);
      expect(post.isDeleted).toBe(false);
    });

    test('should get user content statistics', async () => {
      // Soft delete some content
      await SoftDeleteService.softDelete(Video, testVideo._id, testUser._id, 'User deleted');

      const response = await request(app)
        .get('/api/user/deleted/stats')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.videos.total).toBe(1);
      expect(response.body.data.videos.deleted).toBe(1);
      expect(response.body.data.summary.totalDeleted).toBe(1);
    });
  });

  describe('AuditLogger', () => {
    test('should generate audit report with filtering', async () => {
      // Create some audit entries
      await AuditLogger.logDeletion('Video', testVideo._id, testUser._id, 'Test deletion');
      await AuditLogger.logRestoration('Video', testVideo._id, testUser._id);

      const report = await AuditLogger.generateReport({
        contentType: 'Video',
        page: 1,
        limit: 10
      });

      expect(report.totalCount).toBe(2);
      expect(report.data).toHaveLength(2);
      expect(report.data[0].eventType).toMatch(/SOFT_DELETE|RESTORE/);
    });

    test('should export audit trail', async () => {
      // Create audit entry
      await AuditLogger.logDeletion('Video', testVideo._id, testUser._id, 'Test deletion');

      const dateRange = {
        from: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        to: new Date()
      };

      const exportData = await AuditLogger.exportAuditTrail(dateRange, ['Video'], 'json');

      expect(exportData.totalRecords).toBe(1);
      expect(exportData.data).toHaveLength(1);
      expect(exportData.data[0].contentType).toBe('Video');
    });

    test('should get audit statistics', async () => {
      // Create various audit entries
      await AuditLogger.logDeletion('Video', testVideo._id, testUser._id, 'Test deletion');
      await AuditLogger.logRestoration('Video', testVideo._id, testUser._id);
      await AuditLogger.logDeletion('Post', testPost._id, testUser._id, 'Test deletion');

      const stats = await AuditLogger.getAuditStats();

      expect(stats.totalEvents).toBe(3);
      expect(stats.eventTypeStats).toHaveLength(2); // SOFT_DELETE and RESTORE
      expect(stats.contentTypeStats).toHaveLength(2); // Video and Post
    });
  });

  describe('CleanupScheduler', () => {
    test('should perform cleanup of expired content', async () => {
      // Create old soft deleted content
      await SoftDeleteService.softDelete(Video, testVideo._id, testUser._id, 'Test deletion');
      
      // Set deletion date to 31 days ago
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 31);
      await Video.findByIdAndUpdate(testVideo._id, { deletedAt: oldDate });

      const results = await CleanupScheduler.performCleanup({
        retentionDays: 30,
        dryRun: false
      });

      expect(results.Video.deletedCount).toBe(1);

      // Verify content is permanently deleted
      const video = await Video.findById(testVideo._id);
      expect(video).toBeNull();
    });

    test('should perform dry run cleanup', async () => {
      // Create old soft deleted content
      await SoftDeleteService.softDelete(Video, testVideo._id, testUser._id, 'Test deletion');
      
      // Set deletion date to 31 days ago
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 31);
      await Video.findByIdAndUpdate(testVideo._id, { deletedAt: oldDate });

      const results = await CleanupScheduler.performCleanup({
        retentionDays: 30,
        dryRun: true
      });

      expect(results.Video.deletedCount).toBe(1);

      // Verify content still exists (dry run)
      const video = await Video.findById(testVideo._id, null, { includeSoftDeleted: true });
      expect(video).toBeTruthy();
    });

    test('should get cleanup statistics', async () => {
      // Create some content and soft delete it
      await SoftDeleteService.softDelete(Video, testVideo._id, testUser._id, 'Test deletion');
      await SoftDeleteService.softDelete(Post, testPost._id, testUser._id, 'Test deletion');

      const stats = await CleanupScheduler.getCleanupStats(30);

      expect(stats.stats.Video.total).toBe(1);
      expect(stats.stats.Video.deleted).toBe(1);
      expect(stats.stats.Post.total).toBe(1);
      expect(stats.stats.Post.deleted).toBe(1);
      expect(stats.retentionDays).toBe(30);
    });
  });

  describe('Query Middleware', () => {
    test('should exclude soft deleted content from normal queries', async () => {
      // Soft delete content
      await SoftDeleteService.softDelete(Video, testVideo._id, testUser._id, 'Test deletion');

      // Normal query should not return soft deleted content
      const videos = await Video.find({});
      expect(videos).toHaveLength(0);

      // Query with includeSoftDeleted should return soft deleted content
      const videosWithDeleted = await Video.find({}, null, { includeSoftDeleted: true });
      expect(videosWithDeleted).toHaveLength(1);
      expect(videosWithDeleted[0].isDeleted).toBe(true);
    });

    test('should work with findDeleted static method', async () => {
      // Soft delete content
      await SoftDeleteService.softDelete(Video, testVideo._id, testUser._id, 'Test deletion');

      const deletedVideos = await Video.findDeleted();
      expect(deletedVideos).toHaveLength(1);
      expect(deletedVideos[0].isDeleted).toBe(true);
    });

    test('should work with findWithDeleted static method', async () => {
      // Create another video
      const anotherVideo = await Video.create({
        title: 'Another Video',
        description: 'Another Description',
        videoUrl: 'http://example.com/video2.mp4',
        thumbnailUrl: 'http://example.com/thumb2.jpg',
        postedBy: testUser._id,
        category: 'Entertainment'
      });

      // Soft delete one video
      await SoftDeleteService.softDelete(Video, testVideo._id, testUser._id, 'Test deletion');

      const allVideos = await Video.findWithDeleted();
      expect(allVideos).toHaveLength(2); // Both active and deleted
    });
  });

  describe('Error Handling', () => {
    test('should handle non-existent content gracefully', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      await expect(
        SoftDeleteService.softDelete(Video, fakeId, testUser._id, 'Test')
      ).rejects.toThrow('Document not found');
    });

    test('should handle restoration of non-deleted content', async () => {
      await expect(
        SoftDeleteService.restore(Video, testVideo._id, testUser._id)
      ).rejects.toThrow('Document is not deleted');
    });

    test('should prevent unauthorized access to other users content', async () => {
      // Create another user
      const otherUser = await User.create({
        username: 'otheruser',
        email: 'other@example.com',
        password: 'hashedpassword'
      });
      const otherToken = jwt.sign({ id: otherUser._id }, process.env.JWT_SECRET || 'testsecret');

      // Soft delete content as original user
      await SoftDeleteService.softDelete(Video, testVideo._id, testUser._id, 'User deleted');

      // Try to restore as different user
      const response = await request(app)
        .post(`/api/user/deleted/restore/video/${testVideo._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);

      expect(response.body.error.message).toContain('your own content');
    });
  });

  describe('Performance', () => {
    test('should handle large datasets efficiently', async () => {
      // Create multiple videos
      const videos = [];
      for (let i = 0; i < 100; i++) {
        const video = await Video.create({
          title: `Test Video ${i}`,
          description: `Test Description ${i}`,
          videoUrl: `http://example.com/video${i}.mp4`,
          thumbnailUrl: `http://example.com/thumb${i}.jpg`,
          postedBy: testUser._id,
          category: 'Entertainment'
        });
        videos.push(video);
      }

      // Soft delete first 50 of them (not including the original testVideo)
      const startTime = Date.now();
      for (let i = 0; i < 50; i++) {
        await SoftDeleteService.softDelete(Video, videos[i]._id, testUser._id, 'Bulk test');
      }
      const endTime = Date.now();

      // Should complete within reasonable time (adjust threshold as needed)
      expect(endTime - startTime).toBeLessThan(10000); // 10 seconds

      // Verify correct counts (50 active + 1 original testVideo = 51 active, 50 deleted)
      const activeVideos = await Video.find({});
      const deletedVideos = await Video.findDeleted();
      
      expect(activeVideos).toHaveLength(51); // 50 remaining + original testVideo
      expect(deletedVideos).toHaveLength(50);
    });
  });
});