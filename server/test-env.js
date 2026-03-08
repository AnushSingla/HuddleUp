#!/usr/bin/env node
/**
 * Environment Variable Test Script
 * Tests the JWT_SECRET validation and error handling
 */

const { validateEnvironment, getJWTSecret, generateJWTSecret } = require('./utils/validateEnv');

console.log('🧪 Testing Environment Variable Validation\n');

// Test 1: Save current JWT_SECRET
const originalJWTSecret = process.env.JWT_SECRET;
console.log('1️⃣ Testing with missing JWT_SECRET...');

// Temporarily remove JWT_SECRET
delete process.env.JWT_SECRET;

try {
  const result = validateEnvironment();
  console.log('Validation result:', result ? '✅ Passed' : '❌ Failed (expected)');
} catch (error) {
  console.log('❌ Validation threw error:', error.message);
}

// Test 2: Test getJWTSecret with missing secret
console.log('\n2️⃣ Testing getJWTSecret with missing JWT_SECRET...');
try {
  getJWTSecret();
  console.log('❌ Should have thrown an error');
} catch (error) {
  console.log('✅ Correctly threw error:', error.message);
}

// Test 3: Test with short JWT_SECRET
console.log('\n3️⃣ Testing with short JWT_SECRET...');
process.env.JWT_SECRET = 'short';
try {
  const result = validateEnvironment();
  console.log('Validation result:', result ? '✅ Passed' : '❌ Failed (expected)');
} catch (error) {
  console.log('❌ Validation threw error:', error.message);
}

// Test 4: Test with valid JWT_SECRET
console.log('\n4️⃣ Testing with valid JWT_SECRET...');
const generatedSecret = generateJWTSecret();
process.env.JWT_SECRET = generatedSecret;
try {
  const result = validateEnvironment();
  console.log('Validation result:', result ? '✅ Passed (expected)' : '❌ Failed');
  
  const secret = getJWTSecret();
  console.log('✅ getJWTSecret() returned valid secret (length:', secret.length, ')');
} catch (error) {
  console.log('❌ Unexpected error:', error.message);
}

// Test 5: Generate new JWT secret
console.log('\n5️⃣ Testing JWT secret generation...');
const newSecret = generateJWTSecret();
console.log('✅ Generated JWT secret (length:', newSecret.length, ')');
console.log('Sample:', newSecret.substring(0, 20) + '...');

// Restore original JWT_SECRET
if (originalJWTSecret) {
  process.env.JWT_SECRET = originalJWTSecret;
} else {
  delete process.env.JWT_SECRET;
}

console.log('\n🎉 Environment validation tests completed!');
console.log('\n💡 To generate a secure JWT_SECRET for your .env file:');
console.log(`JWT_SECRET=${generateJWTSecret()}`);