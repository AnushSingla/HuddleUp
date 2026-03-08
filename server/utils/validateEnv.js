/**
 * Environment Variable Validation Utility
 * Validates required environment variables on server startup
 */

const crypto = require('crypto');
const logger = require('./logger');

/**
 * Required environment variables with their validation rules
 */
const REQUIRED_ENV_VARS = {
  JWT_SECRET: {
    required: true,
    minLength: 32,
    description: 'JWT secret key for token signing and verification',
    example: 'your-super-secret-jwt-key-here-make-it-long-and-random'
  },
  MONGO_URL: {
    required: true,
    pattern: /^mongodb(\+srv)?:\/\/.+/,
    description: 'MongoDB connection string',
    example: 'mongodb://localhost:27017/huddleup or mongodb+srv://user:pass@cluster.mongodb.net/huddleup'
  }
};

/**
 * Optional environment variables with defaults
 */
const OPTIONAL_ENV_VARS = {
  NODE_ENV: {
    default: 'development',
    description: 'Node.js environment'
  },
  PORT: {
    default: '5000',
    description: 'Server port number'
  },
  CLIENT_URL: {
    default: 'http://localhost:5173',
    description: 'Frontend URL for CORS and password reset links'
  }
};

/**
 * Generate a secure JWT secret
 */
function generateJWTSecret() {
  return crypto.randomBytes(64).toString('hex');
}

/**
 * Validate a single environment variable
 */
function validateEnvVar(name, config, value) {
  const errors = [];

  if (!value) {
    if (config.required) {
      errors.push(`${name} is required but not set`);
    }
    return errors;
  }

  if (config.minLength && value.length < config.minLength) {
    errors.push(`${name} must be at least ${config.minLength} characters long`);
  }

  if (config.pattern && !config.pattern.test(value)) {
    errors.push(`${name} format is invalid`);
  }

  return errors;
}

/**
 * Validate all environment variables
 */
function validateEnvironment() {
  const errors = [];
  const warnings = [];
  const suggestions = [];

  logger.info('🔍 Validating environment variables...\n');

  // Validate required variables
  for (const [name, config] of Object.entries(REQUIRED_ENV_VARS)) {
    const value = process.env[name];
    const varErrors = validateEnvVar(name, config, value);
    
    if (varErrors.length > 0) {
      errors.push(...varErrors);
      logger.error(`❌ ${name}: ${varErrors.join(', ')}`);
      logger.error(`   Description: ${config.description}`);
      logger.error(`   Example: ${config.example}\n`);
      
      // Special handling for JWT_SECRET
      if (name === 'JWT_SECRET') {
        const generatedSecret = generateJWTSecret();
        suggestions.push(`Add this to your .env file:\nJWT_SECRET=${generatedSecret}`);
      }
    } else {
      logger.info(`✅ ${name}: Set and valid`);
    }
  }

  // Check optional variables and set defaults
  for (const [name, config] of Object.entries(OPTIONAL_ENV_VARS)) {
    const value = process.env[name];
    
    if (!value && config.default) {
      process.env[name] = config.default;
      warnings.push(`${name} not set, using default: ${config.default}`);
      logger.warn(`⚠️  ${name}: Using default value (${config.default})`);
    } else if (value) {
      logger.info(`✅ ${name}: ${value}`);
    }
  }

  // Security warnings
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    warnings.push('JWT_SECRET is too short. Use at least 32 characters for security.');
  }

  if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET === 'your-super-secret-jwt-key-here-make-it-long-and-random') {
    errors.push('JWT_SECRET must be changed from the default value in production');
  }

  // Print results
  logger.info('\n📋 Environment Validation Summary:');
  logger.info(`✅ Valid: ${Object.keys(REQUIRED_ENV_VARS).length - errors.length}/${Object.keys(REQUIRED_ENV_VARS).length} required variables`);
  
  if (warnings.length > 0) {
    logger.warn(`⚠️  Warnings: ${warnings.length}`);
    warnings.forEach(warning => logger.warn(`   - ${warning}`));
  }

  if (errors.length > 0) {
    logger.error(`❌ Errors: ${errors.length}`);
    logger.info('\n🔧 Quick Fix:');
    
    if (suggestions.length > 0) {
      suggestions.forEach(suggestion => logger.info(suggestion));
    }
    
    logger.info('\n📖 For more help, see: HuddleUp/SETUP_GUIDE.md');
    return false;
  }

  logger.info('✅ All environment variables are valid!\n');
  return true;
}

/**
 * Get a safe JWT secret with fallback
 */
function getJWTSecret() {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required but not set. Please check your .env file.');
  }
  
  if (secret.length < 32) {
    logger.warn('⚠️  WARNING: JWT_SECRET is shorter than recommended (32+ characters)');
  }
  
  return secret;
}

module.exports = {
  validateEnvironment,
  getJWTSecret,
  generateJWTSecret,
  REQUIRED_ENV_VARS,
  OPTIONAL_ENV_VARS
};