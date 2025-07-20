const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const streamifier = require('streamifier');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer(); // memory storage

const cloudinaryUploadMiddleware = (req, res, next) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const stream = cloudinary.uploader.upload_stream(
    { folder: 'meesho-seller-genius' },
    (error, result) => {
      if (error) return res.status(500).json({ error: 'Cloudinary upload failed', details: error });
      req.fileUrl = result.secure_url;
      next();
    }
  );
  streamifier.createReadStream(req.file.buffer).pipe(stream);
};

module.exports = { upload, cloudinaryUploadMiddleware }; 