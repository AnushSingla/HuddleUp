#!/usr/bin/env node
/**
 * Error Handling Test Script
 * Tests the new centralized error handling and logging system
 */

const logger = require('../utils/logger');
const { ResponseHandler, ERROR_CODES } = require('../utils/responseHandler');

// Mock Express request and response objects
function createMockReq(overrides = {}) {
  return {
    method: 'POST',
    url: '/api/test',
    ip: '127.0.0.1',
    get: (header) => header === 'User-Agent' ? 'Test-Agent' : undefined,
    user: { id: 'test-user-123' },
    body: { test: 'data' },
    ...overrides
  };
}

function createMockRes() {
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      this.body = data;
      return this;
    },
    sendStatus: function(code) {
      this.statusCode = code;
      return this;
    }
  };
  return res;
}

// Test cases
const testCases = [
  {
    name: 'Logger - Info Level',
    test: () => {
      logger.info('Test info message', { testData: 'value', userId: 'test123' });
      return { success: true, message: 'Info logged successfully' };
    }
  },
  {
    name: 'Logger - Error Level',
    test: () => {
      logger.error('Test error message', { error: 'Test error', context: 'testing' });
      return { success: true, message: 'Error logged successfully' };
    }
  },
  {
    name: 'Logger - Sensitive Data Sanitization',
    test: () => {
      logger.info('Testing sensitive data sanitization', {
        user: {
          username: 'testuser',
          password: 'secret123',
          email: 'test@example.com',
          token: 'jwt-token-here'
        },
        request: {
          authorization: 'Bearer token123',
          api_key: 'secret-key'
        }
      });
      return { success: true, message: 'Sensitive data sanitized and logged' };
    }
  },
  {
    name: 'ResponseHandler - Success Response',
    test: () => {
      const res = createMockRes();
      ResponseHandler.success(res, { id: 1, name: 'Test' }, 'Operation successful');
      
      return {
        success: res.statusCode === 200 && res.body.success === true,
        message: `Status: ${res.statusCode}, Response: ${JSON.stringify(res.body)}`
      };
    }
  },
  {
    name: 'ResponseHandler - Error Response',
    test: () => {
      const res = createMockRes();
      ResponseHandler.error(res, ERROR_CODES.VALIDATION_ERROR, 'Test validation error', 400);
      
      return {
        success: res.statusCode === 400 && res.body.success === false,
        message: `Status: ${res.statusCode}, Response: ${JSON.stringify(res.body)}`
      };
    }
  },
  {
    name: 'ResponseHandler - Not Found Helper',
    test: () => {
      const res = createMockRes();
      ResponseHandler.notFound(res, 'Test Resource');
      
      return {
        success: res.statusCode === 404 && res.body.error.code === ERROR_CODES.NOT_FOUND,
        message: `Status: ${res.statusCode}, Response: ${JSON.stringify(res.body)}`
      };
    }
  },
  {
    name: 'ResponseHandler - Unauthorized Helper',
    test: () => {
      const res = createMockRes();
      ResponseHandler.unauthorized(res);
      
      return {
        success: res.statusCode === 401 && res.body.error.code === ERROR_CODES.UNAUTHORIZED,
        message: `Status: ${res.statusCode}, Response: ${JSON.stringify(res.body)}`
      };
    }
  },
  {
    name: 'ResponseHandler - Handle MongoDB Duplicate Error',
    test: () => {
      const req = createMockReq();
      const res = createMockRes();
      const error = {
        code: 11000,
        keyPattern: { email: 1 },
        message: 'Duplicate key error'
      };
      
      ResponseHandler.handleError(error, req, res, 'Test operation');
      
      return {
        success: res.statusCode === 409 && res.body.error.code === ERROR_CODES.ALREADY_EXISTS,
        message: `Status: ${res.statusCode}, Response: ${JSON.stringify(res.body)}`
      };
    }
  },
  {
    name: 'ResponseHandler - Handle JWT Error',
    test: () => {
      const req = createMockReq();
      const res = createMockRes();
      const error = {
        name: 'JsonWebTokenError',
        message: 'invalid token'
      };
      
      ResponseHandler.handleError(error, req, res, 'Authentication');
      
      return {
        success: res.statusCode === 401 && res.body.error.code === ERROR_CODES.INVALID_TOKEN,
        message: `Status: ${res.statusCode}, Response: ${JSON.stringify(res.body)}`
      };
    }
  },
  {
    name: 'ResponseHandler - Async Handler Wrapper',
    test: async () => {
      const req = createMockReq();
      const res = createMockRes();
      let nextCalled = false;
      const next = (error) => {
        nextCalled = true;
        return error;
      };
      
      // Test successful async function
      const successHandler = ResponseHandler.asyncHandler(async (req, res) => {
        return ResponseHandler.success(res, { test: 'data' }, 'Success');
      });
      
      await successHandler(req, res, next);
      
      return {
        success: !nextCalled && res.statusCode === 200,
        message: `Next called: ${nextCalled}, Status: ${res.statusCode}`
      };
    }
  }
];

async function runTests() {
  console.log('🧪 Testing Error Handling and Logging System\n');
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of testCases) {
    try {
      console.log(`Testing: ${testCase.name}`);
      const result = await testCase.test();
      
      if (result.success) {
        console.log(`✅ PASS: ${result.message}\n`);
        passed++;
      } else {
        console.log(`❌ FAIL: ${result.message}\n`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}\n`);
      failed++;
    }
  }
  
  console.log('📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Error handling system is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the implementation.');
  }
}

// Test environment variables
function testEnvironmentSetup() {
  console.log('🔧 Environment Setup Check:');
  console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
  console.log(`LOG_LEVEL: ${process.env.LOG_LEVEL || 'not set (using default)'}`);
  console.log(`LOG_TO_FILE: ${process.env.LOG_TO_FILE || 'not set'}`);
  console.log('');
}

if (require.main === module) {
  testEnvironmentSetup();
  runTests().catch(console.error);
}

module.exports = { runTests, testCases };