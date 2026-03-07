const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true, mode: 0o755 });
}

// Allowed video file extensions
const ALLOWED_EXTENSIONS = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska',
  'video/webm'
];

// File magic numbers (signatures) for video validation
const FILE_SIGNATURES = {
  mp4: [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70], // ftyp
  mov: [0x00, 0x00, 0x00, 0x14, 0x66, 0x74, 0x79, 0x70], // ftyp
  avi: [0x52, 0x49, 0x46, 0x46], // RIFF
  mkv: [0x1A, 0x45, 0xDF, 0xA3], // Matroska
  webm: [0x1A, 0x45, 0xDF, 0xA3] // WebM (same as Matroska)
};

// Maximum file size: 100MB
const MAX_FILE_SIZE = 100 * 1024 * 1024;

// Check available disk space
function checkDiskSpace() {
  try {
    const stats = fs.statfsSync ? fs.statfsSync(uploadDir) : null;
    if (stats) {
      const availableSpace = stats.bavail * stats.bsize;
      const requiredSpace = MAX_FILE_SIZE * 2; // Require 2x max file size
      return availableSpace > requiredSpace;
    }
    return true; // Skip check if statfs not available
  } catch (error) {
    console.warn('Could not check disk space:', error.message);
    return true; // Allow upload if check fails
  }
}

// Generate secure unique filename
function generateSecureFilename(originalname) {
  const ext = path.extname(originalname).toLowerCase();
  const randomString = crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now();
  return `video_${timestamp}_${randomString}${ext}`;
}

// Validate file extension
function isValidExtension(filename) {
  const ext = path.extname(filename).toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext);
}

// Validate MIME type
function isValidMimeType(mimetype) {
  return ALLOWED_MIME_TYPES.includes(mimetype);
}

// Validate file signature (magic numbers)
function validateFileSignature(filepath) {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filepath, { start: 0, end: 11 });
    const chunks = [];

    stream.on('data', (chunk) => {
      chunks.push(chunk);
    });

    stream.on('end', () => {
      const buffer = Buffer.concat(chunks);
      const header = Array.from(buffer.slice(0, 8));

      // Check against known video signatures
      let isValid = false;
      
      // Check MP4/MOV (ftyp signature)
      if (header[4] === 0x66 && header[5] === 0x74 && header[6] === 0x79 && header[7] === 0x70) {
        isValid = true;
      }
      // Check AVI (RIFF signature)
      else if (header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46) {
        isValid = true;
      }
      // Check MKV/WebM
      else if (header[0] === 0x1A && header[1] === 0x45 && header[2] === 0xDF && header[3] === 0xA3) {
        isValid = true;
      }

      resolve(isValid);
    });

    stream.on('error', (error) => {
      reject(error);
    });
  });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Check disk space before accepting upload
    if (!checkDiskSpace()) {
      return cb(new Error('Insufficient disk space for upload'));
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate secure unique filename
    const secureFilename = generateSecureFilename(file.originalname);
    
    // Log upload attempt
    console.log(`📤 Upload attempt: ${file.originalname} -> ${secureFilename} (${file.mimetype})`);
    
    cb(null, secureFilename);
  }
});

// Enhanced file filter with multiple validation layers
function fileFilter(req, file, cb) {
  // Layer 1: Check file extension
  if (!isValidExtension(file.originalname)) {
    const ext = path.extname(file.originalname).toLowerCase();
    console.warn(`❌ Invalid file extension: ${ext}`);
    return cb(new Error(`Invalid file type. Allowed extensions: ${ALLOWED_EXTENSIONS.join(', ')}`), false);
  }

  // Layer 2: Check MIME type
  if (!isValidMimeType(file.mimetype)) {
    console.warn(`❌ Invalid MIME type: ${file.mimetype}`);
    return cb(new Error(`Invalid file type. Only video files are allowed.`), false);
  }

  // Layer 3: File size will be checked by multer limits
  console.log(`✅ File passed initial validation: ${file.originalname}`);
  cb(null, true);
}

// Create the multer instance with security configurations
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE, // 100MB max
    files: 1, // Only 1 file per upload
    fields: 10, // Limit number of fields
    parts: 20 // Limit total parts
  }
});

// Middleware to validate file signature after upload
const validateUploadedFile = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const filepath = req.file.path;

  try {
    // Validate file signature (magic numbers)
    const isValidSignature = await validateFileSignature(filepath);

    if (!isValidSignature) {
      // Delete invalid file
      fs.unlinkSync(filepath);
      console.warn(`❌ Invalid file signature detected and file deleted: ${req.file.filename}`);
      return res.status(400).json({
        message: 'Invalid video file. File signature validation failed.',
        error: 'The uploaded file does not appear to be a valid video file.'
      });
    }

    console.log(`✅ File signature validated: ${req.file.filename}`);
    next();
  } catch (error) {
    // Cleanup on error
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
    console.error(`❌ Error validating file: ${error.message}`);
    return res.status(500).json({
      message: 'Error validating uploaded file',
      error: error.message
    });
  }
};

// Cleanup middleware for failed uploads
const cleanupOnError = (err, req, res, next) => {
  if (err && req.file) {
    const filepath = req.file.path;
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      console.log(`🗑️ Cleaned up failed upload: ${req.file.filename}`);
    }
  }

  // Handle multer-specific errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        message: 'File too large',
        error: `Maximum file size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        maxSize: `${MAX_FILE_SIZE / (1024 * 1024)}MB`
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        message: 'Too many files',
        error: 'Only one file can be uploaded at a time'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        message: 'Unexpected field',
        error: 'Invalid file field name'
      });
    }
  }

  // Handle custom errors
  if (err) {
    return res.status(400).json({
      message: 'Upload failed',
      error: err.message
    });
  }

  next();
};

module.exports = {
  upload,
  validateUploadedFile,
  cleanupOnError,
  MAX_FILE_SIZE,
  ALLOWED_EXTENSIONS
};