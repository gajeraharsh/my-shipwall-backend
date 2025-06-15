const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|gif|mp4|mkv|avi|pdf|doc|docx|xlsx|webp|jfif/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = fileTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Only images, videos, and document files are allowed!'
      )
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 600 * 1024 * 1024 }, // 600 MB in bytes
});

module.exports = upload;
