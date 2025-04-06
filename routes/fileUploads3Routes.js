const express = require('express');
const { uploadFiles } = require('../controllers/fileUploads3Controller');
const upload = require('../middlewares/upload');

const router = express.Router();

const uploadFields = upload.fields([
  { name: 'files', maxCount: 10 },  
]);

router
  .route('/')
  .post(
    uploadFields, 
    uploadFiles
  );

module.exports = router;
