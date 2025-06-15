const User = require("../models/User");
const { supportTeamValidation } = require("../validations/supportteam");
const { asyncHandler } = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");
const { uploadFileToS3 } = require("../services/fileUploads3Service");

const createRejectionTeam = asyncHandler(async (req, res) => {
  const { error, value } = supportTeamValidation.validate(req?.body, {
    abortEarly: false,
  });

  if (error) {
    console.log(error.details);

    throw new ApiError(400, "Validation failed.", error?.details);
  }

  const existedUser = await User.findOne({
    userName: req?.body?.userName,
    // role: "admin_rejection",
    role: { $in: ["admin_rejection", "admin", "admin_support"] },
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

const getRejectionUsers = asyncHandler(async (req, res) => {
  const { search, page, limit } = req.query;
  const sortField = req?.query?.sortField || "createdAt";
  const sortOrder = req?.query?.sortOrder === "desc" ? "desc" : "asc";

  let where = {
    role: "admin_rejection",
    isDeleted: false,
  };

  if (search) {
    where.$or = [
      { userName: { $regex: search, $options: "i" } },
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  const sortOptions = {};
  sortOptions[sortField] = sortOrder;

  // Convert sortOptions object to string for aggregation paginate
  const sortByString = Object.entries(sortOptions)
    .map(([key, val]) => `${key}:${val}`)
    .join(",");

  // @ts-ignore
  const users = await User.paginate(where, {
    page,
    limit,
    sortBy: sortByString,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { users: users }, "Customers retrieved successfully")
    );
});

const getRejectionUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req?.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, { user: user }, "User retrivied successfully"));
});

const updateRejectionUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const existingUser = await User.findById(userId);

  if (!existingUser) {
    throw new ApiError(404, "User not found");
  }

  const isUseNameExist = await User.findOne({
    userName: req?.body?.userName,
    _id: { $ne: userId },
    role: "admin_rejection",
  });
  if (isUseNameExist) {
    throw new ApiError(409, "User name already exist.");
    return;
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

const deleteRejectionUserById = asyncHandler(async (req, res) => {
  try {
    const id = req?.params.id;

    if (!id) {
      throw new ApiError(400, "Id is required");
    }

    const user = await User.findById(id);
    if (!user) throw new ApiError(404, "User not found");

    await user.softDelete();
    
    return res
      .status(200)
      .json(new ApiResponse(200, user, "User deleted successfully"));
  } catch (error) {
    throw new ApiError(500, error.message || "deleteUserById  failed");
  }
});

module.exports = {
  createRejectionTeam,
  getRejectionUsers,
  getRejectionUserById,
  updateRejectionUser,
  deleteRejectionUserById,
};
