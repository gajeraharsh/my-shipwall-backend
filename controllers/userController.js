const User = require("../models/User");
const {
  userValidationSchema,
  userValidationLoginSchema,
  userChangePasswordSchema,
} = require("../validations/user");
const { asyncHandler } = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");
const { generateAccessAndRefereshTokens } = require("../handlers/user");
const { uploadFileToS3 } = require("../services/fileUploads3Service");
const mongoose = require("mongoose");
const CustomerWalletCredit = require("../models/CustomerWalletCredit");
const CustomerRewardCredit = require("../models/CustomerRewardCredit");

const createUser = asyncHandler(async (req, res) => {
  const { error, value } = userValidationSchema.validate(req?.body, {
    abortEarly: false,
  });

  if (error) {
    console.log(error.details);

    throw new ApiError(400, "Validation failed.", error?.details);
  }

  const { phone, userName, logginId, role, email } = value;

  const query = [];

  if (userName) query.push({ userName, role });
  if (phone) query.push({ phone, role });
  if (email) query.push({ email, role });
  if (logginId) query.push({ logginId, role });

  const existedUser = await User.findOne({
    $or: query,
  });

  if (existedUser) {
    throw new ApiError(409, "User already exist.");
  }

  const user = await User.create(value);
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  await createdUser.generateAndSendOtp(); // Assuming this method exists as in previous messages

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        createdUser,
        "User registered successfully. OTP sent to email"
      )
    );
});

const changePassword = asyncHandler(async (req, res) => {
  const { error, value } = userChangePasswordSchema.validate(req?.body, {
    abortEarly: false,
  });

  if (error) {
    throw new ApiError(400, "Validation failed.", error?.details);
  }

  const { currentPassword, newPassword, confirmPassword } = value;

  const user = req.user;

  const existingUser = await User.findById(user?._id);

  const isPasswordValid = await existingUser.isPasswordCorrect(currentPassword);

  if (!isPasswordValid) {
    throw new ApiError(500, "Invalid user current password.");
  }

  existingUser.password = confirmPassword;

  await existingUser.save({ validateBeforeSave: false });

  return res
    .status(201)
    .json(new ApiResponse(200, user, "User password change successfully."));
});

const loginUser = asyncHandler(async (req, res) => {
  const { error, value } = userValidationLoginSchema.validate(req?.body, {
    abortEarly: false,
  });

  if (error) {
    console.log(error.details);

    throw new ApiError(400, "Validation failed.", error?.details);
  }

  const { phone, userName, logginId, password, role } = value;

  const query = [];

  if (userName) query.push({ userName, role });
  if (phone) query.push({ phone, role });
  if (phone) query.push({ email: phone, role });
  if (logginId) query.push({ logginId, role });

  const user = await User.findOne({
    $or: query,
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  if (user?.status != "Verified" && user?.role == "user") {
    await user.generateAndSendOtp(); // Assuming generateAndSendOtp method sends the OTP

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          code: "otp_sent",
          id: user?._id,
        },
        "User not verified. OTP sent to your email/phone. Please verify to login."
      )
    );
  }

  console.log(query, "query");

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(500, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

const forgotPasswordController = asyncHandler(async (req, res) => {
  const { email, role } = req?.body;

  // Find the user by email
  const user = await User.findOne({ email, role });
  if (!user) {
    throw new ApiError(404, "User not found with that email address");
  }

  // Generate and send reset token via email
  await user.generatePasswordResetToken();

  // Success response
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        "Password reset link has been sent to your email address."
      )
    );
});

const resetPasswordController = asyncHandler(async (req, res) => {
  const { token, newPassword } = req?.body;

  // Find the user by reset password token and check if it's not expired
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordTokenExpiresAt: { $gt: Date.now() }, // Ensure token is not expired
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired token");
  }

  // Update the user's password
  user.password = newPassword;
  user.resetPasswordToken = undefined; // Clear reset token
  user.resetPasswordTokenExpiresAt = undefined; // Clear expiration time
  await user.save();

  // Success response
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Password has been successfully reset"));
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { otp, userId } = req.body;

  // Validate OTP and User ID
  if (!otp || !userId) {
    throw new ApiError(400, "OTP and User ID are required");
  }

  // Find the user by ID
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Check if OTP exists and is valid
  if (!user.otp || user.otp !== otp) {
    throw new ApiError(400, "Invalid OTP");
  }

  // OTP is valid, verify the user and clear OTP
  user.isVerified = true;
  user.otp = undefined; // Remove OTP once it's verified
  user.status = "Verified";

  // Save the user with updated verification status
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User verified successfully"));
});

const resendOtp = asyncHandler(async (req, res) => {
  const { phone, userName, logginId, role } = req.body;

  // Validate incoming request body
  const { error, value } = userValidationLoginSchema.validate(req?.body, {
    abortEarly: false,
  });
  if (error) {
    console.log(error.details);
    throw new ApiError(400, "Validation failed.", error?.details);
  }

  const query = [];

  if (userName) query.push({ userName, role });
  if (phone) query.push({ phone, role });
  if (logginId) query.push({ logginId, role });

  // Find user by query parameters (phone, username, loginId)
  const user = await User.findOne({
    $or: query,
  });

  // Check if user exists
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  // If the user is already verified, no need to resend OTP
  if (user.status == "Verified") {
    throw new ApiError(
      400,
      "User is already verified. You can log in directly."
    );
  }

  // Generate and send the OTP again
  await user.generateAndSendOtp();

  // Send response to user
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "OTP has been resent. Please check your phone/email."
      )
    );
});

const logoutUser = asyncHandler(async (req, res, next) => {
  if (!req.user || !req.user._id) {
    return res.status(400).json(new ApiResponse(400, {}, "User not logged in"));
  }

  // Remove refreshToken field from the user's document
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // This removes the field from the document
      },
    },
    {
      new: true,
    }
  );

  // Clear cookies
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Ensure this is set to true in production
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

const getUsers = asyncHandler(async (req, res) => {
  const {
    search,
    page = 1,
    limit = 10,
    startDate = "",
    endDate = "",
    days,
    state,
    city,
    salePerson,
  } = req.query;

  const andConditions = [{ role: "user" }];

  // Search across multiple fields
  if (search) {
    const searchOrConditions = [
      { userName: { $regex: search, $options: "i" } },
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
    andConditions.push({ $or: searchOrConditions });
  }

  // isCustomerPool = true => user has no salePerson

  // Date range filter
  if (startDate || endDate) {
    const createdAt = {};
    if (startDate) createdAt.$gte = new Date(startDate);
    if (endDate) createdAt.$lte = new Date(endDate);
    andConditions.push({ createdAt });
  }

  // Filter by "last X days"
  if (days) {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - Number(days));
    andConditions.push({ createdAt: { $gte: daysAgo } });
  }

  if (salePerson) {
    andConditions.push({
      salePerson: salePerson,
    });
  }

  // State filter
  if (state) {
    andConditions.push({ "currentAddress.state": state });
  }

  // City filter
  if (city) {
    andConditions.push({ "currentAddress.city": city });
  }

  // Final query object
  const where =
    andConditions.length > 1 ? { $and: andConditions } : andConditions[0];

  // @ts-ignore
  const users = await User.paginate(where, {
    page,
    limit,
    populate: [
      { path: "billingAddress.state", select: "_id name" },
      { path: "billingAddress.city", select: "_id name" },
    ],
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { customerList: users },
        "customers retrieved successfully"
      )
    );
});

const getUsersV2 = asyncHandler(async (req, res) => {
  const {
    search,
    page = 1,
    limit = 10,
    startDate = "",
    endDate = "",
    days,
    state,
    city,
    salePerson,
  } = req.query;

  const matchStage = {
    role: "user",
  };

  // Search filter
  if (search) {
    matchStage.$or = [
      { userName: { $regex: search, $options: "i" } },
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { id: { $regex: search, $options: "i" } },
    ];
  }

  // CreatedAt date filter
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }

  // "Last X days" filter
  if (days) {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - Number(days));
    matchStage.createdAt = { ...(matchStage.createdAt || {}), $gte: daysAgo };
  }

  if (salePerson) {
    // @ts-ignore
    matchStage.salePerson = new mongoose.Types.ObjectId(salePerson);
  }

  if (state) {
    matchStage["currentAddress.state"] = state;
  }

  if (city) {
    matchStage["currentAddress.city"] = city;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const usersWithOrders = await User.aggregate([
    { $match: matchStage },

    // Join orders
    {
      $lookup: {
        from: "orders",
        localField: "_id",
        foreignField: "user",
        as: "orders",
      },
    },

    // Calculate totalSpent and orderCount
    {
      $addFields: {
        totalSpent: { $sum: "$orders.finalTotal" },
        orderCount: { $size: "$orders" },
      },
    },

    // Optional: populate billingAddress.state and billingAddress.city (needs $lookup if needed)

    // Sort by creation (or customize as needed)
    { $sort: { createdAt: -1 } },

    // Pagination
    { $skip: skip },
    { $limit: Number(limit) },
  ]);

  // Count total for pagination
  const totalCount = await User.countDocuments(matchStage);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        customerList: {
          docs: usersWithOrders,
          page: Number(page),
          limit: Number(limit),
          totalDocs: totalCount,
          totalPages: Math.ceil(totalCount / Number(limit)),
        },
      },
      "customers retrieved successfully"
    )
  );
});

const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate({
      path: "billingAddress.city",
      model: "City",
    })
    .populate({
      path: "billingAddress.state",
      model: "State",
    })
    .populate({
      path: "deliveryAddress.city",
      model: "City",
    })
    .populate({
      path: "deliveryAddress.state",
      model: "State",
    })
    .populate({
      path: "adminRole",
      select: "name  permissions",
      populate: {
        path: "permissions.page", // Assuming the reference to Page is in `permissions.page`
        select: "pageGroup pageName pageLink", // You can adjust the fields you want to select from the Page model
      },
    });

  if (!user) {
    return res.status(404).json(new ApiResponse(404, {}, "User not found"));
  }
  return res
    .status(200)
    .json(new ApiResponse(200, { user: user }, "User retrivied successfully"));
});

const getAdminUserInfo = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json(new ApiResponse(404, {}, "User not found"));
  }
  return res
    .status(200)
    .json(new ApiResponse(200, { user: user }, "User retrivied successfully"));
});

const updateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const existingUser = await User.findById(userId);

  if (!existingUser) {
    throw new ApiError(404, "User not found");
  }

  const {
    userName,
    fullName,
    logginId,
    email,
    phone,
    businessName,
    businessType,
    gstNumber,
    role,
    password,
    panNumber,
    billingAddress,
    deliveryAddress,
    sameAsBilling,
  } = req.body;

  const files = req.files;

  let profileImageUrl = null;
  let businessFrontPremisesPhotoUrl = null;
  let businessStockWithOwnerPhotoUrl = null;
  let ownerPhotoUrl = null;
  let visitingCardPhotoUrl = null;
  let gstCertificateUrl = null;
  let businessAddressProofUrl = null;

  // Handle file uploads
  if (files?.profileImage?.[0]) {
    profileImageUrl = await uploadFileToS3(
      files.profileImage[0],
      req.user?._id
    );
  }

  if (files?.businessFrontPremisesPhoto?.[0]) {
    businessFrontPremisesPhotoUrl = await uploadFileToS3(
      files.businessFrontPremisesPhoto[0],
      req.user?._id
    );
  }

  if (files?.businessStockWithOwnerPhoto?.[0]) {
    businessStockWithOwnerPhotoUrl = await uploadFileToS3(
      files.businessStockWithOwnerPhoto[0],
      req.user?._id
    );
  }

  if (files?.ownerPhoto?.[0]) {
    ownerPhotoUrl = await uploadFileToS3(files.ownerPhoto[0], req.user?._id);
  }

  if (files?.visitingCardPhoto?.[0]) {
    visitingCardPhotoUrl = await uploadFileToS3(
      files.visitingCardPhoto[0],
      req.user?._id
    );
  }

  if (files?.gstCertificate?.[0]) {
    gstCertificateUrl = await uploadFileToS3(
      files.gstCertificate[0],
      req.user?._id
    );
  }

  if (files?.businessAddressProof?.[0]) {
    businessAddressProofUrl = await uploadFileToS3(
      files.businessAddressProof[0],
      req.user?._id
    );
  }

  const updateData = {};

  if (userName) updateData.userName = userName;
  if (fullName) updateData.fullName = fullName;
  if (logginId) updateData.logginId = logginId;
  if (email) updateData.email = email;
  if (phone) updateData.phone = phone;
  if (profileImageUrl) updateData.profileImage = profileImageUrl;
  if (businessName) updateData.businessName = businessName;
  if (businessType) updateData.businessType = businessType;
  updateData.gstNumber = gstNumber;
  if (role) updateData.role = role;
  if (password) updateData.password = password;
  if (panNumber) updateData.panNumber = panNumber;
  if (sameAsBilling) updateData.sameAsBilling = sameAsBilling;

  if (billingAddress) updateData.billingAddress = billingAddress;

  if (!updateData.documents) {
    updateData.documents = {};
  }

  updateData.documents.businessFrontPremisesPhoto =
    businessFrontPremisesPhotoUrl ||
    existingUser.documents?.businessFrontPremisesPhoto;
  updateData.documents.businessStockWithOwnerPhoto =
    businessStockWithOwnerPhotoUrl ||
    existingUser.documents?.businessStockWithOwnerPhoto;
  updateData.documents.ownerPhoto =
    ownerPhotoUrl || existingUser.documents?.ownerPhoto;
  updateData.documents.visitingCardPhoto =
    visitingCardPhotoUrl || existingUser.documents?.visitingCardPhoto;
  updateData.documents.gstCertificate =
    gstCertificateUrl || existingUser.documents?.gstCertificate;
  updateData.documents.businessAddressProof =
    businessAddressProofUrl || existingUser.documents?.businessAddressProof;

  let parsedDeliveryAddress = null;
  if (typeof deliveryAddress === "string") {
    try {
      parsedDeliveryAddress = JSON.parse(deliveryAddress);
    } catch (error) {
      throw new ApiError(400, "Invalid delivery address format");
    }
  } else {
    parsedDeliveryAddress = deliveryAddress;
  }

  let parsedBillingAddress = null;
  if (typeof billingAddress === "string") {
    try {
      parsedBillingAddress = JSON.parse(billingAddress);
    } catch (error) {
      throw new ApiError(400, "Invalid billing address format");
    }
  } else {
    parsedBillingAddress = billingAddress;
  }

  if (parsedBillingAddress) {
    updateData.billingAddress = {
      line1: parsedBillingAddress.line1,
      line2: parsedBillingAddress.line2,
      pincode: parsedBillingAddress.pincode,
      state: parsedBillingAddress.state,
      city: parsedBillingAddress.city,
      country: parsedBillingAddress.country,
      landmark: parsedBillingAddress.landmark,
    };
  }

  if (sameAsBilling != "false" && parsedBillingAddress) {
    updateData.deliveryAddress = { ...updateData.billingAddress };
  } else if (parsedDeliveryAddress) {
    updateData.deliveryAddress = {
      line1: parsedDeliveryAddress.line1,
      line2: parsedDeliveryAddress.line2,
      pincode: parsedDeliveryAddress.pincode,
      state: parsedDeliveryAddress.state,
      city: parsedDeliveryAddress.city,
      country: parsedDeliveryAddress.country,
      landmark: parsedDeliveryAddress.landmark,
    };
  }

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

const deleteUserById = asyncHandler(async (req, res) => {
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

const getCustomerById = asyncHandler(async (req, res) => {
  const user = await User.findById(req?.params.id)
    .populate({
      path: "billingAddress.city",
      model: "City",
    })
    .populate({
      path: "billingAddress.state",
      model: "State",
    })
    .populate({
      path: "deliveryAddress.city",
      model: "City",
    })
    .populate({
      path: "deliveryAddress.state",
      model: "State",
    })
    .populate({
      path: "currentAddress.city",
      model: "City",
    })
    .populate({
      path: "currentAddress.state",
      model: "State",
    })
    .populate({
      path: "permenentAddress.city",
      model: "City",
    })
    .populate({
      path: "permenentAddress.state",
      model: "State",
    })
    .populate({
      path: "salePerson",
      select: "fullName _id",
      model: "User",
    });

  if (!user) {
    return res.status(404).json(new ApiResponse(404, {}, "User not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { user: user }, "User retrieved successfully"));
});

const updateVerification = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const existingUser = await User.findById(userId);

  if (!existingUser) {
    throw new ApiError(404, "User not found");
  }

  const { status, docStatus, sap_customer_code } = req.body;

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        status,
        docStatus,
        sap_customer_code,
      },
    },
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

const adminLogin = asyncHandler(async (req, res) => {
  const { error, value } = userValidationLoginSchema.validate(req?.body, {
    abortEarly: false,
  });

  if (error) {
    console.log(error.details);

    throw new ApiError(400, "Validation failed.", error?.details);
  }

  const { userName, password } = value;

  const allowedRoles = ["admin", "admin_support", "admin_rejection"];
  const query = [];

  if (userName) query.push({ userName, role: { $in: allowedRoles } });
  // if (logginId) query.push({ logginId, role: { $in: allowedRoles } });

  const user = await User.findOne({
    $or: query,
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  if (user?.isBlock) {
    return res
      .status(400)
      .json(
        new ApiResponse(
          400,
          {},
          "User is blocked. Please contact admin for more details."
        )
      );
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(500, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

const getCreditHistory = asyncHandler(async (req, res) => {
  try {
    const page = req?.query?.page;
    const limit = req?.query?.limit;
    const query = req?.query?.search || "";
    const userId = req.user?._id;

    const creditHistory = await CustomerWalletCredit.paginate(
      {
        user: userId,
      },
      {
        page,
        limit,
        sortBy: "createdAt:desc",
      }
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { creditHistory },
          "creditHistory retrieved successfully"
        )
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Could not retrieve creditHistory");
  }
});

const getRewardCreditHistory = asyncHandler(async (req, res) => {
  try {
    const page = req?.query?.page;
    const limit = req?.query?.limit;
    const query = req?.query?.search || "";
    const userId = req.user?._id;

    const creditHistory = await CustomerRewardCredit.paginate(
      {
        user: userId,
      },
      {
        page,
        limit,
        sortBy: "createdAt:desc",
      }
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { creditHistory },
          "creditHistory retrieved successfully"
        )
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Could not retrieve creditHistory");
  }
});

const forgotPasswordSellerController = asyncHandler(async (req, res) => {
  const { email } = req?.body;
  // Find the user by email
  const user = await User.findOne({
    email,
    role: {
      $in: ["sale_member", "sale_admin", "super_sale_admin"],
    },
  });
  if (!user) {
    throw new ApiError(404, "User not found with that email address");
  }

  // Generate and send reset token via email
  await user.generatePasswordResetToken(true);

  // Success response
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        "Password reset link has been sent to your email address."
      )
    );
});

module.exports = {
  createUser,
  changePassword,
  loginUser,
  forgotPasswordController,
  resetPasswordController,
  verifyOtp,
  resendOtp,
  logoutUser,
  getUsers,
  getUsersV2,
  getUser,
  updateUser,
  deleteUserById,
  getCustomerById,
  updateVerification,
  getAdminUserInfo,
  adminLogin,
  getCreditHistory,
  forgotPasswordSellerController,
  getRewardCreditHistory,
};
