#!/usr/bin/env node
/**
 * Environment Variable Test Script
 * Tests the JWT_SECRET validation and error handling
 */

const { validateEnvironment, getJWTSecret, generateJWTSecret } = require('./utils/validateEnv');
const logger = require('./utils/logger');

logger.info('🧪 Testing Environment Variable Validation\n');

// Test 1: Save current JWT_SECRET
const originalJWTSecret = process.env.JWT_SECRET;
logger.info('1️⃣ Testing with missing JWT_SECRET...');

// Temporarily remove JWT_SECRET
delete process.env.JWT_SECRET;

try {
  const result = validateEnvironment();
  logger.info('Validation result:', result ? '✅ Passed' : '❌ Failed (expected)');
} catch (error) {
  logger.error('❌ Validation threw error:', { error: error.message });
}

// Test 2: Test getJWTSecret with missing secret
logger.info('\n2️⃣ Testing getJWTSecret with missing JWT_SECRET...');
try {
  getJWTSecret();
  logger.error('❌ Should have thrown an error');
} catch (error) {
  logger.info('✅ Correctly threw error:', error.message);
}

// Test 3: Test with short JWT_SECRET
logger.info('\n3️⃣ Testing with short JWT_SECRET...');
process.env.JWT_SECRET = 'short';
try {
  const result = validateEnvironment();
  logger.info('Validation result:', result ? '✅ Passed' : '❌ Failed (expected)');
} catch (error) {
  logger.error('❌ Validation threw error:', { error: error.message });
}

// Test 4: Test with valid JWT_SECRET
logger.info('\n4️⃣ Testing with valid JWT_SECRET...');
const generatedSecret = generateJWTSecret();
process.env.JWT_SECRET = generatedSecret;
try {
  const result = validateEnvironment();
  logger.info('Validation result:', result ? '✅ Passed (expected)' : '❌ Failed');
  
  const secret = getJWTSecret();
  logger.info('✅ getJWTSecret() returned valid secret (length:', secret.length, ')');
} catch (error) {
  logger.error('❌ Unexpected error:', { error: error.message });
}

// Test 5: Generate new JWT secret
logger.info('\n5️⃣ Testing JWT secret generation...');
const newSecret = generateJWTSecret();
logger.info('✅ Generated JWT secret (length:', newSecret.length, ')');
logger.info('Sample:', newSecret.substring(0, 20) + '...');

// Restore original JWT_SECRET
if (originalJWTSecret) {
  process.env.JWT_SECRET = originalJWTSecret;
} else {
  delete process.env.JWT_SECRET;
}

logger.info('\n🎉 Environment validation tests completed!');
logger.info('\n💡 To generate a secure JWT_SECRET for your .env file:');
logger.info(`JWT_SECRET=${generateJWTSecret()}`);