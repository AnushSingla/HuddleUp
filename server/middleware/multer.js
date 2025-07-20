const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
fs.mkdirSync(uploadDir);
}

// Storage configuration
const storage = multer.diskStorage({
destination: (req, file, cb) => {
cb(null, uploadDir);
},
filename: (req, file, cb) => {
  const uniqueName = `${Date.now()}-${file.originalname}`;
  cb(null, uniqueName);
},

});

// File filter: allow only video files
function fileFilter(req, file, cb) {
    if (file.mimetype.startsWith("video/")) {
        cb(null, true);
    } else {
        cb(new Error("Only video files are allowed!"), false);
    }
}

// Create the multer instance
const upload = multer({ storage, fileFilter });

module.exports = upload;