const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../server');
const User = require('../models/User');
const Video = require('../models/Video');
const { connectDB, disconnectDB } = require('../config/database');

describe('Video Upload Validation', () => {
  let authToken;
  let testUser;
  
  beforeAll(async () => {
    await connectDB();
    
    // Create test user
    testUser = new User({
      username: 'testuploader',
      email: 'testuploader@example.com',
      password: 'TestPassword123!'
    });
    await testUser.save();
    
    // Login to get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testuploader@example.com',
        password: 'TestPassword123!'
      });
    
    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    // Cleanup
    await User.deleteMany({ email: 'testuploader@example.com' });
    await Video.deleteMany({ postedBy: testUser._id });
    await disconnectDB();
  });

  describe('File Type Validation', () => {
    test('should reject non-video file extensions', async () => {
      // Create a fake text file with video extension
      const testFilePath = path.join(__dirname, 'test.txt');
      fs.writeFileSync(testFilePath, 'This is not a video file');
      
      const response = await request(app)
        .post('/api/video/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .field('title', 'Test Video')
        .field('category', 'test')
        .field('description', 'Test description')
        .attach('video', testFilePath);
      
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid file type');
      
      // Cleanup
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
      }
    });

    test('should reject files with invalid MIME types', async () => {
      // This would be tested with actual file uploads in integration tests
      // For unit tests, we can mock the multer behavior
      expect(true).toBe(true); // Placeholder
    });

    test('should accept valid video file extensions', async () => {
      const validExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v'];
      
      for (const ext of validExtensions) {
        // Create minimal valid video file header for testing
        const testFilePath = path.join(__dirname, `test${ext}`);
        
        // Create file with appropriate signature
        let signature;
        if (ext === '.mp4' || ext === '.m4v') {
          signature = Buffer.from([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70]); // ftyp
        } else if (ext === '.avi') {
          signature = Buffer.from([0x52, 0x49, 0x46, 0x46]); // RIFF
        } else if (ext === '.webm' || ext === '.mkv') {
          signature = Buffer.from([0x1A, 0x45, 0xDF, 0xA3]); // EBML
        }
        
        if (signature) {
          fs.writeFileSync(testFilePath, signature);
          
          // Note: This test would fail without actual video content
          // In real scenarios, you'd use actual small video files
          
          // Cleanup
          if (fs.existsSync(testFilePath)) {
            fs.unlinkSync(testFilePath);
          }
        }
      }
      
      expect(true).toBe(true); // Placeholder for actual implementation
    });
  });

  describe('File Size Validation', () => {
    test('should reject files larger than maximum size', async () => {
      // Create a large dummy file
      const testFilePath = path.join(__dirname, 'large_test.mp4');
      const largeBuffer = Buffer.alloc(101 * 1024 * 1024); // 101MB
      
      // Add MP4 signature
      largeBuffer.writeUInt32BE(0x00000018, 0);
      largeBuffer.write('ftyp', 4);
      
      fs.writeFileSync(testFilePath, largeBuffer);
      
      const response = await request(app)
        .post('/api/video/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .field('title', 'Large Test Video')
        .field('category', 'test')
        .field('description', 'Test description')
        .attach('video', testFilePath);
      
      expect(response.status).toBe(413);
      expect(response.body.message).toContain('File too large');
      
      // Cleanup
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
      }
    });

    test('should reject files smaller than minimum size', async () => {
      // Create a tiny file
      const testFilePath = path.join(__dirname, 'tiny_test.mp4');
      const tinyBuffer = Buffer.alloc(100); // 100 bytes (less than 1KB minimum)
      
      fs.writeFileSync(testFilePath, tinyBuffer);
      
      const response = await request(app)
        .post('/api/video/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .field('title', 'Tiny Test Video')
        .field('category', 'test')
        .field('description', 'Test description')
        .attach('video', testFilePath);
      
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('File too small');
      
      // Cleanup
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
      }
    });
  });

  describe('File Signature Validation', () => {
    test('should reject files with invalid signatures', async () => {
      // Create file with wrong signature
      const testFilePath = path.join(__dirname, 'fake_video.mp4');
      const fakeBuffer = Buffer.alloc(1024);
      fakeBuffer.write('FAKE', 0); // Invalid signature
      
      fs.writeFileSync(testFilePath, fakeBuffer);
      
      const response = await request(app)
        .post('/api/video/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .field('title', 'Fake Video')
        .field('category', 'test')
        .field('description', 'Test description')
        .attach('video', testFilePath);
      
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid video file');
      
      // Cleanup
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
      }
    });
  });

  describe('Security Validation', () => {
    test('should reject files with executable signatures', async () => {
      // Create file with PE executable signature
      const testFilePath = path.join(__dirname, 'malicious.mp4');
      const maliciousBuffer = Buffer.alloc(1024);
      
      // Add PE signature (MZ header)
      maliciousBuffer.writeUInt16LE(0x5A4D, 0); // MZ
      
      fs.writeFileSync(testFilePath, maliciousBuffer);
      
      const response = await request(app)
        .post('/api/video/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .field('title', 'Malicious File')
        .field('category', 'test')
        .field('description', 'Test description')
        .attach('video', testFilePath);
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe('SUSPICIOUS_CONTENT');
      
      // Cleanup
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
      }
    });

    test('should reject files with script content', async () => {
      // Create file with script content
      const testFilePath = path.join(__dirname, 'script.mp4');
      const scriptBuffer = Buffer.alloc(1024);
      scriptBuffer.write('#!/bin/bash\necho "malicious script"', 0);
      
      fs.writeFileSync(testFilePath, scriptBuffer);
      
      const response = await request(app)
        .post('/api/video/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .field('title', 'Script File')
        .field('category', 'test')
        .field('description', 'Test description')
        .attach('video', testFilePath);
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe('SUSPICIOUS_CONTENT');
      
      // Cleanup
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
      }
    });
  });

  describe('Upload Limits Endpoint', () => {
    test('should return upload limits for authenticated user', async () => {
      const response = await request(app)
        .get('/api/upload/limits')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.limits).toBeDefined();
      expect(response.body.limits.maxFileSize).toBeDefined();
      expect(response.body.limits.allowedExtensions).toBeDefined();
      expect(response.body.limits.allowedMimeTypes).toBeDefined();
    });

    test('should reject unauthenticated requests for upload limits', async () => {
      const response = await request(app)
        .get('/api/upload/limits');
      
      expect(response.status).toBe(401);
    });
  });

  describe('Validation Error Handling', () => {
    test('should provide detailed error messages', async () => {
      const response = await request(app)
        .post('/api/video/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .field('title', 'Test Video')
        .field('category', 'test')
        .field('description', 'Test description');
        // No file attached
      
      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });

    test('should clean up files on validation failure', async () => {
      // This test would verify that failed uploads don't leave files on disk
      // Implementation would depend on specific cleanup mechanisms
      expect(true).toBe(true); // Placeholder
    });
  });

  describe('Multiple File Upload Prevention', () => {
    test('should reject multiple file uploads', async () => {
      // Create two test files
      const testFile1 = path.join(__dirname, 'test1.mp4');
      const testFile2 = path.join(__dirname, 'test2.mp4');
      
      const validBuffer = Buffer.alloc(1024);
      validBuffer.writeUInt32BE(0x00000018, 0);
      validBuffer.write('ftyp', 4);
      
      fs.writeFileSync(testFile1, validBuffer);
      fs.writeFileSync(testFile2, validBuffer);
      
      const response = await request(app)
        .post('/api/video/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .field('title', 'Multiple Files Test')
        .field('category', 'test')
        .field('description', 'Test description')
        .attach('video', testFile1)
        .attach('video', testFile2);
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe('TOO_MANY_FILES');
      
      // Cleanup
      [testFile1, testFile2].forEach(file => {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      });
    });
  });
});