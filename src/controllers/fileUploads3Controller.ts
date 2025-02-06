import { Request, Response } from 'express';
import { uploadFileToS3 } from '../services/fileUploads3Service';
import { asyncHandler } from '../utils/asyncHandler';
import ApiResponse from '../utils/apiResponse';
import ApiError from '../utils/apiError';
import httpStatus from 'http-status';

export const uploadFiles = asyncHandler(async (req: Request, res: Response) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  const userId = (req as any).tokenData || "121";
  console.log("Hiiiii")
  if (!files || !files.files || files.files.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No files uploaded');
  }

  const uploadPromises = files.files.map(file => uploadFileToS3(file, userId));
  const urls = await Promise.all(uploadPromises);

  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, { urls }, 'Files uploaded successfully'));
});
