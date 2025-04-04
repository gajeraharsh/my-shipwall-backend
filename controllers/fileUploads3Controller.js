const { uploadFileToS3 } = require("../services/fileUploads3Service");
const { asyncHandler } = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");
const { status: httpStatus } = require("http-status");

const uploadFiles = asyncHandler(async (req, res) => {
  const files = req.files;
  const userId = req.tokenData || "121";
  console.log("Hiiiii");
  if (!files || !files.files || files.files.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No files uploaded");
  }

  const uploadPromises = files.files.map((file) =>
    uploadFileToS3(file, userId)
  );
  const urls = await Promise.all(uploadPromises);

  res
    .status(httpStatus.OK)
    .json(
      new ApiResponse(httpStatus.OK, { urls }, "Files uploaded successfully")
    );
});

module.exports = {
  uploadFiles,
};
