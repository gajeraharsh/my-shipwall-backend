import { Request, Response } from "express";
import { uploadFileToS3 } from "../services/fileUploads3Service";
import { asyncHandler } from "../utils/asyncHandler";
import ApiResponse from "../utils/apiResponse";
import ApiError from "../utils/apiError";
import { UploadedFile } from "express-fileupload";

interface CustomRequest extends Request {
  files?: { files: UploadedFile[] }; 
}

export const uploadFiles = asyncHandler(async (req: CustomRequest, res: Response) => {
  try {

    console.log("hiiii",req.files)
    
    if (!req.files || !req.files.files) {
      throw new ApiError(400, "No files provided");
    }
    const files = req.files?.files;
    const userId = "679de136d1180612dea4b6e4"; 

    const file = req.files

    console.log("files", files)
    console.log("file", file)
    console.log("userId", userId)

    if (!files || files.length === 0) {
      throw new ApiError(400, "No files uploaded");
    }

    const uploadPromises = files.map((file) => uploadFileToS3(file, userId));
    const urls = await Promise.all(uploadPromises);

    return res.status(200).json(new ApiResponse(200, { urls }, "Files uploaded successfully"));
  } catch (err: any) {
    console.error("Error uploading files:", err);
    throw new ApiError(500, err.message || "Error uploading files");
  }
});
