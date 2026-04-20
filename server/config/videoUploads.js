const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "edusphere/videos",
        resource_type: "video",
        allowed_formats: ["mp4", "mkv", "avi", "webm"],
    },
});

module.exports = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 },
});
