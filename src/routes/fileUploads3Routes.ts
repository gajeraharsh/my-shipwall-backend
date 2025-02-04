import express from "express"; 
import {uploadFiles} from '../controllers/fileUploads3Controller';
import upload from "../middlewares/upload"

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

  export default router;
