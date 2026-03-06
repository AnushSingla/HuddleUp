const cloudinary = require("../config/cloudinary");
const fs = require("fs").promises;

const uploadVideo = async (filePath, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "video",
      folder: "huddleup/videos",
      ...options,
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      duration: result.duration,
      format: result.format,
    };
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

const uploadImage = async (filePath, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "image",
      folder: "huddleup/thumbnails",
      ...options,
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    throw new Error(`Cloudinary image upload failed: ${error.message}`);
  }
};

const deleteResource = async (publicId, resourceType = "video") => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error("Cloudinary delete error:", error.message);
  }
};

const cleanupLocalFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error(`Failed to delete local file ${filePath}:`, error.message);
  }
};

module.exports = {
  uploadVideo,
  uploadImage,
  deleteResource,
  cleanupLocalFile,
};
