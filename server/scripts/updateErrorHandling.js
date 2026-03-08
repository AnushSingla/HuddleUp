#!/usr/bin/env node
/**
 * Script to Update Error Handling Patterns
 * Automatically updates controllers to use centralized logging and response handling
 */

const fs = require('fs');
const path = require('path');

const controllersDir = path.join(__dirname, '..', 'controllers');

// Controllers to update (excluding auth which we already updated)
const controllersToUpdate = [
  'commentController.js',
  'playlistController.js',
  'postController.js',
  'savedController.js',
  'userController.js',
  'friendController.js',
  'notificationController.js',
  'searchController.js',
  'analyticsController.js',
  'adminController.js',
  'moderationController.js'
];

// Common imports to add
const importsToAdd = `const logger = require("../utils/logger");
const { ResponseHandler, ERROR_CODES } = require("../utils/responseHandler");`;

// Patterns to replace
const replacementPatterns = [
  // Replace console.log/console.error with logger
  {
    pattern: /console\.log\((.*)\);?/g,
    replacement: '// Removed console.log - use logger instead'
  },
  {
    pattern: /console\.error\((.*)\);?/g,
    replacement: '// Removed console.error - use logger instead'
  },
  
  // Replace basic error responses
  {
    pattern: /res\.status\(500\)\.json\(\{\s*message:\s*["']([^"']+)["'],?\s*error:\s*err\.message\s*\}\);?/g,
    replacement: 'return ResponseHandler.handleError(err, req, res, "$1");'
  },
  {
    pattern: /res\.status\(404\)\.json\(\{\s*message:\s*["']([^"']+)["']\s*\}\);?/g,
    replacement: 'return ResponseHandler.notFound(res, "$1");'
  },
  {
    pattern: /res\.status\(401\)\.json\(\{\s*message:\s*["']([^"']+)["']\s*\}\);?/g,
    replacement: 'return ResponseHandler.unauthorized(res, "$1");'
  },
  {
    pattern: /res\.status\(403\)\.json\(\{\s*message:\s*["']([^"']+)["']\s*\}\);?/g,
    replacement: 'return ResponseHandler.forbidden(res, "$1");'
  }
];

function updateController(filePath) {
  console.log(`Updating ${path.basename(filePath)}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add imports if not already present
  if (!content.includes('require("../utils/logger")')) {
    // Find the last require statement
    const requireRegex = /const .+ = require\(.+\);/g;
    const matches = [...content.matchAll(requireRegex)];
    
    if (matches.length > 0) {
      const lastRequire = matches[matches.length - 1];
      const insertIndex = lastRequire.index + lastRequire[0].length;
      content = content.slice(0, insertIndex) + '\n' + importsToAdd + content.slice(insertIndex);
    } else {
      // If no requires found, add at the top
      content = importsToAdd + '\n\n' + content;
    }
  }
  
  // Apply replacement patterns
  replacementPatterns.forEach(({ pattern, replacement }) => {
    content = content.replace(pattern, replacement);
  });
  
  // Write back to file
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Updated ${path.basename(filePath)}`);
}

function main() {
  console.log('🔄 Updating error handling patterns in controllers...\n');
  
  controllersToUpdate.forEach(controllerFile => {
    const filePath = path.join(controllersDir, controllerFile);
    
    if (fs.existsSync(filePath)) {
      try {
        updateController(filePath);
      } catch (error) {
        console.error(`❌ Error updating ${controllerFile}:`, error.message);
      }
    } else {
      console.warn(`⚠️  Controller not found: ${controllerFile}`);
    }
  });
  
  console.log('\n🎉 Error handling update completed!');
  console.log('\n📋 Manual steps required:');
  console.log('1. Review updated controllers for any missed patterns');
  console.log('2. Replace try-catch blocks with ResponseHandler.asyncHandler');
  console.log('3. Add proper logging for business logic events');
  console.log('4. Test all endpoints to ensure proper error responses');
}

if (require.main === module) {
  main();
}

module.exports = { updateController, replacementPatterns };