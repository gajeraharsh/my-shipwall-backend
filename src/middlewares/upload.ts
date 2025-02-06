import multer, { FileFilterCallback } from 'multer';
import path from 'path';

const storage = multer.memoryStorage();

const fileFilter = (
  req: Express.Request, 
  file: Express.Multer.File, 
  cb: FileFilterCallback
) => {
  const fileTypes = /jpeg|jpg|png|gif|mp4|mkv|avi|pdf/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = fileTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only images and video files are allowed!'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 50 }, // 50MB
});

export default upload;
