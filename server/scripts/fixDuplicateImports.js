#!/usr/bin/env node
/**
 * Fix Duplicate Imports Script
 * Removes duplicate import statements from controller files
 */

const fs = require('fs');
const path = require('path');

const controllersDir = path.join(__dirname, '..', 'controllers');

function removeDuplicateImports(filePath) {
  console.log(`Checking ${path.basename(filePath)}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  const seenImports = new Set();
  const cleanedLines = [];
  let hasChanges = false;
  
  for (const line of lines) {
    // Check if line is a require statement
    const requireMatch = line.match(/^const\s+(.+?)\s*=\s*require\(.+\);?\s*$/);
    
    if (requireMatch) {
      const importKey = line.trim();
      
      if (seenImports.has(importKey)) {
        console.log(`  Removing duplicate: ${line.trim()}`);
        hasChanges = true;
        continue; // Skip this duplicate line
      }
      
      seenImports.add(importKey);
    }
    
    cleanedLines.push(line);
  }
  
  if (hasChanges) {
    const cleanedContent = cleanedLines.join('\n');
    fs.writeFileSync(filePath, cleanedContent, 'utf8');
    console.log(`  ✅ Fixed duplicates in ${path.basename(filePath)}`);
  } else {
    console.log(`  ✅ No duplicates found in ${path.basename(filePath)}`);
  }
}

function main() {
  console.log('🔄 Fixing duplicate imports in controllers...\n');
  
  const files = fs.readdirSync(controllersDir);
  
  files.forEach(file => {
    if (file.endsWith('.js')) {
      const filePath = path.join(controllersDir, file);
      try {
        removeDuplicateImports(filePath);
      } catch (error) {
        console.error(`❌ Error processing ${file}:`, error.message);
      }
    }
  });
  
  console.log('\n🎉 Duplicate import cleanup completed!');
}

if (require.main === module) {
  main();
}

module.exports = { removeDuplicateImports };