const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const ffprobe = require('fluent-ffmpeg').ffprobe;

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true, mode: 0o755 });
}

// Enhanced configuration with stricter limits
const ALLOWED_EXTENSIONS = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v'];

// Comprehensive MIME type validation
const ALLOWED_MIME_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska',
  'video/webm',
  'video/x-m4v'
];

// File magic numbers (signatures) for enhanced video validation
const FILE_SIGNATURES = {
  mp4: [
    [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70], // ftyp (MP4)
    [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70], // ftyp variant
    [0x00, 0x00, 0x00, 0x1C, 0x66, 0x74, 0x79, 0x70]  // ftyp variant
  ],
  mov: [
    [0x00, 0x00, 0x00, 0x14, 0x66, 0x74, 0x79, 0x70], // ftyp (MOV)
    [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70]  // ftyp variant
  ],
  avi: [[0x52, 0x49, 0x46, 0x46]], // RIFF
  mkv: [[0x1A, 0x45, 0xDF, 0xA3]], // Matroska
  webm: [[0x1A, 0x45, 0xDF, 0xA3]], // WebM (same as Matroska)
  m4v: [
    [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70], // ftyp (M4V)
    [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70]  // ftyp variant
  ]
};

// Enhanced file size limits with different tiers
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB default
const MAX_FILE_SIZE_PREMIUM = 500 * 1024 * 1024; // 500MB for premium users
const MIN_FILE_SIZE = 1024; // 1KB minimum

// Video duration limits (in seconds)
const MAX_DURATION = 3600; // 1 hour
const MIN_DURATION = 1; // 1 second

// Resolution limits
const MAX_RESOLUTION = {
  width: 3840, // 4K
  height: 2160
};

const MIN_RESOLUTION = {
  width: 240,
  height: 180
};

// Check available disk space with enhanced logic
function checkDiskSpace() {
  try {
    const stats = fs.statSync(uploadDir);
    // For Windows, we'll use a different approach
    if (process.platform === 'win32') {
      // On Windows, we'll check if we can write a test file
      const testFile = path.join(uploadDir, 'disk_test_' + Date.now());
      try {
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile);
        return true;
      } catch (error) {
        console.warn('Disk space check failed on Windows:', error.message);
        return false;
      }
    }
    
    // For Unix-like systems
    const statfs = fs.statfsSync ? fs.statfsSync(uploadDir) : null;
    if (statfs) {
      const availableSpace = statfs.bavail * statfs.bsize;
      const requiredSpace = MAX_FILE_SIZE_PREMIUM * 2; // Require 2x max file size
      return availableSpace > requiredSpace;
    }
    return true; // Skip check if statfs not available
  } catch (error) {
    console.warn('Could not check disk space:', error.message);
    return true; // Allow upload if check fails
  }
}

function generateSecureFilename(originalname) {
  const ext = path.extname(originalname).toLowerCase();
  const randomString = crypto.randomBytes(20).toString('hex');
  const timestamp = Date.now();
  const sanitizedName = path.basename(originalname, ext).replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
  return `video_${timestamp}_${randomString}_${sanitizedName}${ext}`;
}

function isValidExtension(filename) {
  const ext = path.extname(filename).toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext);
}

// Enhanced MIME type validation
function isValidMimeType(mimetype) {
  return ALLOWED_MIME_TYPES.includes(mimetype);
}

// Enhanced file signature validation with multiple patterns
function validateFileSignature(filepath) {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filepath, { start: 0, end: 31 }); // Read more bytes
    const chunks = [];

    stream.on('data', (chunk) => {
      chunks.push(chunk);
    });

    stream.on('end', () => {
      const buffer = Buffer.concat(chunks);
      const header = Array.from(buffer.slice(0, 32));

      let isValid = false;
      
      // Check against all known video signatures
      for (const [format, signatures] of Object.entries(FILE_SIGNATURES)) {
        for (const signature of signatures) {
          let matches = true;
          for (let i = 0; i < signature.length && i < header.length; i++) {
            if (header[i] !== signature[i]) {
              matches = false;
              break;
            }
          }
          if (matches) {
            console.log(`✅ File signature matched: ${format}`);
            isValid = true;
            break;
          }
        }
        if (isValid) break;
      }

      resolve(isValid);
    });

    stream.on('error', (error) => {
      reject(error);
    });
  });
}

// Enhanced video metadata validation using ffprobe
function validateVideoMetadata(filepath) {
  return new Promise((resolve, reject) => {
    ffprobe(filepath, (err, metadata) => {
      if (err) {
        console.error('FFprobe error:', err);
        return reject(new Error('Unable to analyze video file. File may be corrupted or invalid.'));
      }

      try {
        const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
        
        if (!videoStream) {
          return reject(new Error('No video stream found in file'));
        }

        // Check duration
        const duration = parseFloat(metadata.format.duration);
        if (duration < MIN_DURATION || duration > MAX_DURATION) {
          return reject(new Error(`Video duration must be between ${MIN_DURATION} and ${MAX_DURATION} seconds`));
        }

        // Check resolution
        const width = videoStream.width;
        const height = videoStream.height;
        
        if (width < MIN_RESOLUTION.width || height < MIN_RESOLUTION.height) {
          return reject(new Error(`Video resolution too low. Minimum: ${MIN_RESOLUTION.width}x${MIN_RESOLUTION.height}`));
        }
        
        if (width > MAX_RESOLUTION.width || height > MAX_RESOLUTION.height) {
          return reject(new Error(`Video resolution too high. Maximum: ${MAX_RESOLUTION.width}x${MAX_RESOLUTION.height}`));
        }

        // Check for valid codec
        const validCodecs = ['h264', 'h265', 'vp8', 'vp9', 'av1'];
        if (!validCodecs.includes(videoStream.codec_name.toLowerCase())) {
          console.warn(`Unusual codec detected: ${videoStream.codec_name}`);
        }

        // Check bitrate (if available)
        const bitrate = parseInt(videoStream.bit_rate || metadata.format.bit_rate);
        if (bitrate && bitrate > 50000000) { // 50 Mbps max
          return reject(new Error('Video bitrate too high. Maximum: 50 Mbps'));
        }

        console.log(`✅ Video metadata validated: ${width}x${height}, ${duration}s, ${videoStream.codec_name}`);
        
        resolve({
          duration,
          width,
          height,
          codec: videoStream.codec_name,
          bitrate: bitrate || 0,
          fps: eval(videoStream.r_frame_rate) || 0
        });

      } catch (error) {
        reject(new Error('Error parsing video metadata: ' + error.message));
      }
    });
  });
}

// Get file size limit based on user type
function getFileSizeLimit(req) {
  // Check if user has premium status (you can implement this logic)
  const isPremium = req.user && req.user.isPremium;
  return isPremium ? MAX_FILE_SIZE_PREMIUM : MAX_FILE_SIZE;
}

// Storage configuration with enhanced security
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
    
    // Log upload attempt with more details
    console.log(`📤 Upload attempt: ${file.originalname} -> ${secureFilename}`);
    console.log(`   MIME: ${file.mimetype}, Size: ${file.size || 'unknown'} bytes`);
    
    cb(null, secureFilename);
  }
});

// Enhanced file filter with comprehensive validation
function fileFilter(req, file, cb) {
  console.log(`🔍 Validating file: ${file.originalname}`);
  
  // Layer 1: Check file extension
  if (!isValidExtension(file.originalname)) {
    const ext = path.extname(file.originalname).toLowerCase();
    console.warn(`❌ Invalid file extension: ${ext}`);
    return cb(new Error(`Invalid file type. Allowed extensions: ${ALLOWED_EXTENSIONS.join(', ')}`), false);
  }

  // Layer 2: Check MIME type
  if (!isValidMimeType(file.mimetype)) {
    console.warn(`❌ Invalid MIME type: ${file.mimetype}`);
    return cb(new Error(`Invalid MIME type. Only video files are allowed.`), false);
  }

  // Layer 3: Additional filename security checks
  const filename = file.originalname;
  
  // Check for suspicious patterns
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    console.warn(`❌ Suspicious filename pattern: ${filename}`);
    return cb(new Error('Invalid filename. Path traversal attempts are not allowed.'), false);
  }

  // Check filename length
  if (filename.length > 255) {
    console.warn(`❌ Filename too long: ${filename.length} characters`);
    return cb(new Error('Filename is too long. Maximum 255 characters allowed.'), false);
  }

  // Check for executable extensions (double extension attack)
  const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com'];
  if (suspiciousExtensions.some(ext => filename.toLowerCase().includes(ext))) {
    console.warn(`❌ Suspicious executable extension in filename: ${filename}`);
    return cb(new Error('Filename contains suspicious executable extensions.'), false);
  }

  console.log(`✅ File passed initial validation: ${file.originalname}`);
  cb(null, true);
}

// Create the multer instance with enhanced security configurations
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_PREMIUM, // Use max limit, will be checked per user later
    files: 1, // Only 1 file per upload
    fields: 15, // Limit number of fields
    parts: 25, // Limit total parts
    fieldNameSize: 100, // Limit field name size
    fieldSize: 1024 // Limit field value size
  }
});

// Enhanced middleware to validate file after upload
const validateUploadedFile = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const filepath = req.file.path;
  const userFileLimit = getFileSizeLimit(req);

  try {
    console.log(`🔍 Post-upload validation for: ${req.file.filename}`);

    // Check file size against user's limit
    if (req.file.size > userFileLimit) {
      fs.unlinkSync(filepath);
      console.warn(`❌ File too large for user: ${req.file.size} > ${userFileLimit}`);
      return res.status(413).json({
        message: 'File too large',
        error: `Maximum file size is ${userFileLimit / (1024 * 1024)}MB for your account type`,
        maxSize: `${userFileLimit / (1024 * 1024)}MB`
      });
    }

    // Check minimum file size
    if (req.file.size < MIN_FILE_SIZE) {
      fs.unlinkSync(filepath);
      console.warn(`❌ File too small: ${req.file.size} bytes`);
      return res.status(400).json({
        message: 'File too small',
        error: `Minimum file size is ${MIN_FILE_SIZE} bytes`
      });
    }

    // Validate file signature (magic numbers)
    const isValidSignature = await validateFileSignature(filepath);
    if (!isValidSignature) {
      fs.unlinkSync(filepath);
      console.warn(`❌ Invalid file signature detected: ${req.file.filename}`);
      return res.status(400).json({
        message: 'Invalid video file',
        error: 'File signature validation failed. The uploaded file does not appear to be a valid video file.'
      });
    }

    // Validate video metadata using ffprobe
    try {
      const metadata = await validateVideoMetadata(filepath);
      
      // Add metadata to request for later use
      req.videoMetadata = metadata;
      
      console.log(`✅ Complete validation passed: ${req.file.filename}`);
      console.log(`   Duration: ${metadata.duration}s, Resolution: ${metadata.width}x${metadata.height}`);
      
    } catch (metadataError) {
      fs.unlinkSync(filepath);
      console.warn(`❌ Video metadata validation failed: ${metadataError.message}`);
      return res.status(400).json({
        message: 'Invalid video file',
        error: metadataError.message
      });
    }

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

// Enhanced cleanup middleware for failed uploads
const cleanupOnError = (err, req, res, next) => {
  if (err && req.file) {
    const filepath = req.file.path;
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      console.log(`🗑️ Cleaned up failed upload: ${req.file.filename}`);
    }
  }

  // Handle multer-specific errors with detailed messages
  if (err instanceof multer.MulterError) {
    console.warn(`❌ Multer error: ${err.code} - ${err.message}`);
    
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        message: 'File too large',
        error: `Maximum file size is ${MAX_FILE_SIZE_PREMIUM / (1024 * 1024)}MB`,
        maxSize: `${MAX_FILE_SIZE_PREMIUM / (1024 * 1024)}MB`,
        code: 'FILE_TOO_LARGE'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        message: 'Too many files',
        error: 'Only one file can be uploaded at a time',
        code: 'TOO_MANY_FILES'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        message: 'Unexpected field',
        error: 'Invalid file field name. Use "video" as the field name.',
        code: 'INVALID_FIELD'
      });
    }
    if (err.code === 'LIMIT_PART_COUNT') {
      return res.status(400).json({
        message: 'Too many parts',
        error: 'Request has too many parts',
        code: 'TOO_MANY_PARTS'
      });
    }
    if (err.code === 'LIMIT_FIELD_KEY') {
      return res.status(400).json({
        message: 'Field name too long',
        error: 'Field name exceeds maximum length',
        code: 'FIELD_NAME_TOO_LONG'
      });
    }
    if (err.code === 'LIMIT_FIELD_VALUE') {
      return res.status(400).json({
        message: 'Field value too long',
        error: 'Field value exceeds maximum length',
        code: 'FIELD_VALUE_TOO_LONG'
      });
    }
  }

  // Handle custom errors
  if (err) {
    console.warn(`❌ Upload error: ${err.message}`);
    return res.status(400).json({
      message: 'Upload failed',
      error: err.message,
      code: 'UPLOAD_FAILED'
    });
  }

  next();
};

// Utility function to get upload limits info
const getUploadLimits = (req) => {
  const userFileLimit = getFileSizeLimit(req);
  return {
    maxFileSize: userFileLimit,
    maxFileSizeMB: userFileLimit / (1024 * 1024),
    minFileSize: MIN_FILE_SIZE,
    allowedExtensions: ALLOWED_EXTENSIONS,
    allowedMimeTypes: ALLOWED_MIME_TYPES,
    maxDuration: MAX_DURATION,
    minDuration: MIN_DURATION,
    maxResolution: MAX_RESOLUTION,
    minResolution: MIN_RESOLUTION
  };
};

module.exports = {
  upload,
  validateUploadedFile,
  cleanupOnError,
  getUploadLimits,
  MAX_FILE_SIZE,
  MAX_FILE_SIZE_PREMIUM,
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES
};