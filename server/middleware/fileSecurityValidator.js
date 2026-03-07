const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Advanced File Security Validator
 * 
 * This middleware provides additional security checks beyond basic file validation:
 * - Virus-like pattern detection
 * - Embedded executable detection
 * - Suspicious content analysis
 * - File entropy analysis
 * - Advanced malware signatures
 */

// Suspicious byte patterns that might indicate malicious content
const SUSPICIOUS_PATTERNS = [
  // PE executable headers
  Buffer.from([0x4D, 0x5A]), // MZ header (DOS/Windows executable)
  Buffer.from([0x50, 0x45, 0x00, 0x00]), // PE header
  
  // ELF executable headers
  Buffer.from([0x7F, 0x45, 0x4C, 0x46]), // ELF header (Linux executable)
  
  // Mach-O executable headers
  Buffer.from([0xFE, 0xED, 0xFA, 0xCE]), // Mach-O 32-bit
  Buffer.from([0xFE, 0xED, 0xFA, 0xCF]), // Mach-O 64-bit
  
  // Script signatures
  Buffer.from('#!/bin/sh'), // Shell script
  Buffer.from('#!/bin/bash'), // Bash script
  Buffer.from('<?php'), // PHP script
  Buffer.from('<script'), // JavaScript/HTML script
  
  // Archive signatures that might contain executables
  Buffer.from([0x50, 0x4B, 0x03, 0x04]), // ZIP file
  Buffer.from([0x52, 0x61, 0x72, 0x21]), // RAR file
  
  // Suspicious strings
  Buffer.from('eval('), // Code evaluation
  Buffer.from('exec('), // Code execution
  Buffer.from('system('), // System command execution
];

// Calculate file entropy to detect encrypted/compressed malicious content
function calculateEntropy(buffer) {
  const frequencies = new Array(256).fill(0);
  
  // Count byte frequencies
  for (let i = 0; i < buffer.length; i++) {
    frequencies[buffer[i]]++;
  }
  
  // Calculate entropy
  let entropy = 0;
  for (let i = 0; i < 256; i++) {
    if (frequencies[i] > 0) {
      const probability = frequencies[i] / buffer.length;
      entropy -= probability * Math.log2(probability);
    }
  }
  
  return entropy;
}

// Check for suspicious patterns in file content
function scanForSuspiciousPatterns(buffer) {
  const suspiciousFindings = [];
  
  for (const pattern of SUSPICIOUS_PATTERNS) {
    let index = 0;
    while ((index = buffer.indexOf(pattern, index)) !== -1) {
      suspiciousFindings.push({
        pattern: pattern.toString('hex'),
        offset: index,
        description: getSuspiciousPatternDescription(pattern)
      });
      index += pattern.length;
    }
  }
  
  return suspiciousFindings;
}

// Get description for suspicious patterns
function getSuspiciousPatternDescription(pattern) {
  const patternHex = pattern.toString('hex');
  
  if (patternHex.startsWith('4d5a')) return 'Windows executable header detected';
  if (patternHex.startsWith('50450000')) return 'PE executable header detected';
  if (patternHex.startsWith('7f454c46')) return 'Linux executable header detected';
  if (patternHex.startsWith('feedface') || patternHex.startsWith('feedfacf')) return 'macOS executable header detected';
  if (pattern.toString().includes('#!/bin/')) return 'Shell script header detected';
  if (pattern.toString().includes('<?php')) return 'PHP script detected';
  if (pattern.toString().includes('<script')) return 'JavaScript/HTML script detected';
  if (patternHex.startsWith('504b0304')) return 'ZIP archive detected';
  if (patternHex.startsWith('52617221')) return 'RAR archive detected';
  if (pattern.toString().includes('eval(')) return 'Code evaluation function detected';
  if (pattern.toString().includes('exec(')) return 'Code execution function detected';
  if (pattern.toString().includes('system(')) return 'System command function detected';
  
  return 'Suspicious pattern detected';
}

// Advanced file content analysis
function analyzeFileContent(filepath) {
  return new Promise((resolve, reject) => {
    try {
      // Read first 64KB for analysis (sufficient for most malware signatures)
      const analysisSize = Math.min(64 * 1024, fs.statSync(filepath).size);
      const buffer = Buffer.alloc(analysisSize);
      
      const fd = fs.openSync(filepath, 'r');
      fs.readSync(fd, buffer, 0, analysisSize, 0);
      fs.closeSync(fd);
      
      // Calculate entropy
      const entropy = calculateEntropy(buffer);
      
      // Scan for suspicious patterns
      const suspiciousPatterns = scanForSuspiciousPatterns(buffer);
      
      // Check for polyglot files (files that are valid in multiple formats)
      const isPolyglot = checkForPolyglot(buffer);
      
      // Analyze file structure consistency
      const structureAnalysis = analyzeFileStructure(buffer, filepath);
      
      const analysis = {
        entropy,
        suspiciousPatterns,
        isPolyglot,
        structureAnalysis,
        fileSize: fs.statSync(filepath).size,
        analysisSize
      };
      
      resolve(analysis);
      
    } catch (error) {
      reject(error);
    }
  });
}

// Check for polyglot files (files valid in multiple formats)
function checkForPolyglot(buffer) {
  const signatures = [
    { format: 'PDF', signature: Buffer.from('%PDF') },
    { format: 'HTML', signature: Buffer.from('<html') },
    { format: 'XML', signature: Buffer.from('<?xml') },
    { format: 'JPEG', signature: Buffer.from([0xFF, 0xD8, 0xFF]) },
    { format: 'PNG', signature: Buffer.from([0x89, 0x50, 0x4E, 0x47]) },
    { format: 'GIF', signature: Buffer.from('GIF8') }
  ];
  
  const detectedFormats = [];
  
  for (const sig of signatures) {
    if (buffer.indexOf(sig.signature) !== -1) {
      detectedFormats.push(sig.format);
    }
  }
  
  return detectedFormats.length > 1 ? detectedFormats : false;
}

// Analyze file structure for consistency
function analyzeFileStructure(buffer, filepath) {
  const ext = path.extname(filepath).toLowerCase();
  const analysis = {
    consistent: true,
    issues: []
  };
  
  // Check if file extension matches content
  if (ext === '.mp4' || ext === '.m4v') {
    // MP4 files should have 'ftyp' box early in the file
    const ftypIndex = buffer.indexOf(Buffer.from('ftyp'));
    if (ftypIndex === -1 || ftypIndex > 32) {
      analysis.consistent = false;
      analysis.issues.push('MP4 file missing or misplaced ftyp box');
    }
  } else if (ext === '.avi') {
    // AVI files should start with RIFF header
    if (!buffer.slice(0, 4).equals(Buffer.from('RIFF'))) {
      analysis.consistent = false;
      analysis.issues.push('AVI file missing RIFF header');
    }
  } else if (ext === '.webm' || ext === '.mkv') {
    // WebM/MKV files should start with EBML header
    if (buffer[0] !== 0x1A || buffer[1] !== 0x45 || buffer[2] !== 0xDF || buffer[3] !== 0xA3) {
      analysis.consistent = false;
      analysis.issues.push('WebM/MKV file missing EBML header');
    }
  }
  
  return analysis;
}

// Main security validation middleware
const advancedFileSecurityValidator = async (req, res, next) => {
  if (!req.file) {
    return next();
  }
  
  const filepath = req.file.path;
  
  try {
    console.log(`🔒 Running advanced security analysis on: ${req.file.filename}`);
    
    const analysis = await analyzeFileContent(filepath);
    
    // Check entropy (very high entropy might indicate encryption/compression)
    if (analysis.entropy > 7.5) {
      console.warn(`⚠️ High entropy detected: ${analysis.entropy.toFixed(2)}`);
      // Don't reject, but log for monitoring
    }
    
    // Check for suspicious patterns
    if (analysis.suspiciousPatterns.length > 0) {
      // Clean up file
      fs.unlinkSync(filepath);
      
      console.error(`❌ Suspicious patterns detected in ${req.file.filename}:`);
      analysis.suspiciousPatterns.forEach(pattern => {
        console.error(`   - ${pattern.description} at offset ${pattern.offset}`);
      });
      
      return res.status(400).json({
        message: 'File rejected due to security concerns',
        error: 'The uploaded file contains suspicious patterns that may indicate malicious content.',
        code: 'SUSPICIOUS_CONTENT',
        details: analysis.suspiciousPatterns.map(p => p.description)
      });
    }
    
    // Check for polyglot files
    if (analysis.isPolyglot) {
      console.warn(`⚠️ Polyglot file detected: ${analysis.isPolyglot.join(', ')}`);
      // Log but don't reject - might be legitimate
    }
    
    // Check file structure consistency
    if (!analysis.structureAnalysis.consistent) {
      console.warn(`⚠️ File structure issues: ${analysis.structureAnalysis.issues.join(', ')}`);
      // Log but don't reject - might be recoverable
    }
    
    // Add analysis results to request for logging
    req.securityAnalysis = analysis;
    
    console.log(`✅ Advanced security validation passed: ${req.file.filename}`);
    console.log(`   Entropy: ${analysis.entropy.toFixed(2)}, Patterns: ${analysis.suspiciousPatterns.length}`);
    
    next();
    
  } catch (error) {
    // Clean up file on error
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
    
    console.error(`❌ Security analysis failed: ${error.message}`);
    return res.status(500).json({
      message: 'Security analysis failed',
      error: 'Unable to complete security validation of uploaded file',
      code: 'SECURITY_ANALYSIS_FAILED'
    });
  }
};

// Middleware to log security analysis results
const logSecurityAnalysis = (req, res, next) => {
  if (req.securityAnalysis && req.file) {
    const analysis = req.securityAnalysis;
    
    // Log security metrics for monitoring
    console.log(`📊 Security Analysis Summary for ${req.file.filename}:`);
    console.log(`   File Size: ${analysis.fileSize} bytes`);
    console.log(`   Entropy: ${analysis.entropy.toFixed(2)}`);
    console.log(`   Suspicious Patterns: ${analysis.suspiciousPatterns.length}`);
    console.log(`   Polyglot: ${analysis.isPolyglot ? 'Yes (' + analysis.isPolyglot.join(', ') + ')' : 'No'}`);
    console.log(`   Structure Consistent: ${analysis.structureAnalysis.consistent}`);
    
    // You could send this data to a security monitoring service here
    // Example: await securityMonitoringService.logFileAnalysis(analysis);
  }
  
  next();
};

module.exports = {
  advancedFileSecurityValidator,
  logSecurityAnalysis,
  analyzeFileContent,
  calculateEntropy
};