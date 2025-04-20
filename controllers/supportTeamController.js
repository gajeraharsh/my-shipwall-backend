const User = require("../models/User");
const { supportTeamValidation } = require("../validations/supportteam");
const { asyncHandler } = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");
const { uploadFileToS3 } = require("../services/fileUploads3Service");

const createSupportTeam = asyncHandler(async (req, res) => {
  const { error, value } = supportTeamValidation.validate(req?.body, {
    abortEarly: false,
  });

  if (error) {
    console.log(error.details);

    throw new ApiError(400, "Validation failed.", error?.details);
  }

  const existedUser = await User.findOne({
    userName: req?.body?.userName,
    role: "admin_support",
  });

  if (existedUser) {
    throw new ApiError(409, "User already exist.");
  }

  const files = req.files;

  let profileImageUrl;

  // Handle file uploads
  if (files?.profileImage?.[0]) {
    profileImageUrl = await uploadFileToS3(
      files.profileImage[0],
      req.user?._id
    );
  }

  const user = await User.create({
    ...value,
    profileImage: profileImageUrl,
    saleUserStatus: "Active",
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

const getSupportUsers = asyncHandler(async (req, res) => {
  const { search, page, limit } = req.query;

  let where = {
    role: "admin_support",
  };

  if (search) {
    where.$or = [
      { userName: { $regex: search, $options: "i" } },
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  // Filter by date range

  // @ts-ignore
  const users = await User.paginate(where, {
    page,
    limit,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { users: users }, "Customers retrieved successfully")
    );
});

const getSupportUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req?.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, { user: user }, "User retrivied successfully"));
});

const updateSupportUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const existingUser = await User.findById(userId);

  const isUseNameExist = await User.findOne({
    userName: req?.body?.userName,
    _id: { $ne: userId },
    // role: "admin_support",
    role: { $in: ["admin_rejection", "admin", "admin_support"] },
  });
  if (isUseNameExist) {
    throw new ApiError(409, "User name already exist.");
    return;
  }

  if (!existingUser) {
    throw new ApiError(404, "User not found");
  }

  const files = req.files;

  let profileImageUrl;

  // Handle file uploads
  if (files?.profileImage?.[0]) {
    profileImageUrl = await uploadFileToS3(
      files.profileImage[0],
      req.user?._id
    );
  }

  const updateData = {
    ...req?.body,
  };

  if (profileImageUrl) updateData.profileImage = profileImageUrl;

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (!updatedUser) {
    throw new ApiError(500, "Something went wrong while updating the user");
  }

  const userWithoutSensitiveInfo = await User.findById(updatedUser._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        userWithoutSensitiveInfo,
        "User updated successfully"
      )
    );
});

const deleteSupportUserById = asyncHandler(async (req, res) => {
  try {
    const id = req?.params.id;

    if (!id) {
      throw new ApiError(400, "Id is required");
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) throw new ApiError(404, "User not found");
    return res
      .status(200)
      .json(new ApiResponse(200, user, "User deleted successfully"));
  } catch (error) {
    throw new ApiError(500, error.message || "deleteUserById  failed");
  }
});

module.exports = {
  createSupportTeam,
  getSupportUsers,
  getSupportUserById,
  updateSupportUser,
  deleteSupportUserById,
};
