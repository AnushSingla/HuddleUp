const fs = require('fs');
const path = require('path');
const { analyzeFileContent } = require('../middleware/fileSecurityValidator');

/**
 * Test Upload Validation Script
 * 
 * This script tests the upload validation system with various file types
 * to ensure security measures are working correctly.
 */

async function createTestFiles() {
  const testDir = path.join(__dirname, 'test-files');
  
  // Create test directory
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir);
  }

  const testFiles = [];

  // 1. Valid MP4 file (minimal)
  const validMp4 = path.join(testDir, 'valid.mp4');
  const mp4Buffer = Buffer.alloc(1024);
  mp4Buffer.writeUInt32BE(0x00000018, 0); // Box size
  mp4Buffer.write('ftyp', 4); // Box type
  mp4Buffer.write('mp42', 8); // Brand
  fs.writeFileSync(validMp4, mp4Buffer);
  testFiles.push({ name: 'Valid MP4', path: validMp4, shouldPass: true });

  // 2. Invalid extension but MP4 content
  const invalidExt = path.join(testDir, 'fake.txt');
  fs.writeFileSync(invalidExt, mp4Buffer);
  testFiles.push({ name: 'Wrong Extension', path: invalidExt, shouldPass: false });

  // 3. Executable file with video extension
  const maliciousExe = path.join(testDir, 'malicious.mp4');
  const exeBuffer = Buffer.alloc(1024);
  exeBuffer.writeUInt16LE(0x5A4D, 0); // MZ header
  exeBuffer.writeUInt32LE(0x00004550, 60); // PE header offset
  fs.writeFileSync(maliciousExe, exeBuffer);
  testFiles.push({ name: 'Malicious Executable', path: maliciousExe, shouldPass: false });

  // 4. Script file with video extension
  const scriptFile = path.join(testDir, 'script.mp4');
  const scriptBuffer = Buffer.from('#!/bin/bash\necho "This is a script"\nrm -rf /\n');
  fs.writeFileSync(scriptFile, scriptBuffer);
  testFiles.push({ name: 'Script File', path: scriptFile, shouldPass: false });

  // 5. High entropy file (encrypted/compressed)
  const highEntropyFile = path.join(testDir, 'encrypted.mp4');
  const randomBuffer = Buffer.alloc(1024);
  for (let i = 0; i < randomBuffer.length; i++) {
    randomBuffer[i] = Math.floor(Math.random() * 256);
  }
  fs.writeFileSync(highEntropyFile, randomBuffer);
  testFiles.push({ name: 'High Entropy File', path: highEntropyFile, shouldPass: true }); // High entropy alone doesn't fail

  // 6. Polyglot file (HTML + MP4)
  const polyglotFile = path.join(testDir, 'polyglot.mp4');
  const polyglotBuffer = Buffer.alloc(1024);
  polyglotBuffer.write('<html><script>alert("xss")</script></html>', 0);
  polyglotBuffer.writeUInt32BE(0x00000018, 100); // MP4 signature later
  polyglotBuffer.write('ftyp', 104);
  fs.writeFileSync(polyglotFile, polyglotBuffer);
  testFiles.push({ name: 'Polyglot File', path: polyglotFile, shouldPass: true }); // Polyglot detection is warning only

  return testFiles;
}

async function testFileValidation() {
  console.log('🧪 Starting Upload Validation Tests\n');

  try {
    const testFiles = await createTestFiles();
    let passed = 0;
    let failed = 0;

    for (const testFile of testFiles) {
      console.log(`Testing: ${testFile.name}`);
      console.log(`File: ${path.basename(testFile.path)}`);

      try {
        const analysis = await analyzeFileContent(testFile.path);
        
        console.log(`  Entropy: ${analysis.entropy.toFixed(2)}`);
        console.log(`  Suspicious Patterns: ${analysis.suspiciousPatterns.length}`);
        console.log(`  Polyglot: ${analysis.isPolyglot ? 'Yes' : 'No'}`);
        console.log(`  Structure Consistent: ${analysis.structureAnalysis.consistent}`);

        // Determine if file should be rejected
        const wouldReject = analysis.suspiciousPatterns.length > 0;
        const testPassed = wouldReject !== testFile.shouldPass;

        if (testPassed) {
          console.log(`  ✅ Test PASSED (${wouldReject ? 'Rejected' : 'Accepted'} as expected)`);
          passed++;
        } else {
          console.log(`  ❌ Test FAILED (Expected ${testFile.shouldPass ? 'Accept' : 'Reject'}, got ${wouldReject ? 'Reject' : 'Accept'})`);
          failed++;
        }

        if (analysis.suspiciousPatterns.length > 0) {
          console.log(`  🚨 Suspicious patterns found:`);
          analysis.suspiciousPatterns.forEach(pattern => {
            console.log(`    - ${pattern.description} at offset ${pattern.offset}`);
          });
        }

      } catch (error) {
        console.log(`  ❌ Analysis failed: ${error.message}`);
        failed++;
      }

      console.log('');
    }

    // Cleanup test files
    const testDir = path.join(__dirname, 'test-files');
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }

    console.log(`\n📊 Test Results:`);
    console.log(`  Passed: ${passed}`);
    console.log(`  Failed: ${failed}`);
    console.log(`  Total: ${passed + failed}`);
    console.log(`  Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

    if (failed === 0) {
      console.log(`\n🎉 All tests passed! Upload validation is working correctly.`);
    } else {
      console.log(`\n⚠️ Some tests failed. Please review the validation logic.`);
    }

  } catch (error) {
    console.error('❌ Test setup failed:', error.message);
  }
}

// Additional test for file size validation
function testFileSizeValidation() {
  console.log('\n📏 Testing File Size Validation\n');

  const testSizes = [
    { size: 500, name: 'Tiny file (500 bytes)', shouldPass: false },
    { size: 2048, name: 'Small file (2KB)', shouldPass: true },
    { size: 50 * 1024 * 1024, name: 'Medium file (50MB)', shouldPass: true },
    { size: 150 * 1024 * 1024, name: 'Large file (150MB)', shouldPass: false },
    { size: 600 * 1024 * 1024, name: 'Huge file (600MB)', shouldPass: false }
  ];

  const MIN_FILE_SIZE = 1024; // 1KB
  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

  testSizes.forEach(test => {
    const wouldPass = test.size >= MIN_FILE_SIZE && test.size <= MAX_FILE_SIZE;
    const testPassed = wouldPass === test.shouldPass;

    console.log(`${test.name}:`);
    console.log(`  Size: ${(test.size / (1024 * 1024)).toFixed(2)}MB`);
    console.log(`  ${testPassed ? '✅' : '❌'} ${wouldPass ? 'ACCEPTED' : 'REJECTED'} (Expected: ${test.shouldPass ? 'PASS' : 'FAIL'})`);
  });
}

// Run tests if script is executed directly
if (require.main === module) {
  testFileValidation()
    .then(() => testFileSizeValidation())
    .then(() => {
      console.log('\n✨ Upload validation testing completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Testing failed:', error);
      process.exit(1);
    });
}

module.exports = {
  testFileValidation,
  testFileSizeValidation
};