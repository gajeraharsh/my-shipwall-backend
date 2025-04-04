const User = require("../../models/User");
const { userValidationSchema } = require("../../validations/user");
const { asyncHandler } = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");
const ApiError = require("../../utils/apiError");
const { uploadFileToS3 } = require("../../services/fileUploads3Service");
const Order = require("../../models/Order");
const mongoose = require("mongoose");


const createUser = asyncHandler(async (req, res) => {
  const { error, value } = userValidationSchema.validate(req?.body, {
    abortEarly: false,
  });

  if (error) {
    console.log(error.details);

    throw new ApiError(400, "Validation failed.", error?.details);
  }

  const existedUser = await User.findOne({
    userName: req?.body?.userName,
    role: req?.body?.role,
  });

  if (existedUser) {
    throw new ApiError(409, "User already exist.");
  }

  const user = await User.create(value);
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

const getUsers = asyncHandler(async (req, res) => {
  const {
    search,
    page,
    limit,
    startDate = "",
    endDate = "",
    days,
    state,
    city,
  } = req.query;

  let where = {
    role: "sale_member",
  };

  // Search by userName (case-insensitive)
  if (search) {
    where.userName = { $regex: search, $options: "i" };
    where.fullName = { $regex: search, $options: "i" };
    where.email = { $regex: search, $options: "i" };
    where.phone = { $regex: search, $options: "i" };
  }

  // Filter by date range
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.$gte = new Date(startDate);
    if (endDate) where.createdAt.$lte = new Date(endDate);
  }

  // Filter by predefined day ranges (Last 7 days, Last 30 days)
  if (days) {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - Number(days));
    where.createdAt = { $gte: daysAgo };
  }

  // Filter by state
  if (state) {
    where["currentAddress.state"] = state;
  }

  // Filter by city
  if (city) {
    where["currentAddress.city"] = city;
  }

  // @ts-ignore
  const users = await User.paginate(where, {
    page,
    limit,
    populate: [
      { path: "currentAddress.state", select: "_id name" },
      { path: "currentAddress.city", select: "_id name" },
      { path: "permenentAddress.state", select: "_id name" },
      { path: "permenentAddress.city", select: "_id name" },
    ],
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { customerList: users },
        "Customers retrieved successfully"
      )
    );
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req?.params.id)
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
    });

  return res
    .status(200)
    .json(new ApiResponse(200, { user: user }, "User retrivied successfully"));
});

const getSaleUserDetailsById = asyncHandler(async (req, res) => {
  const userId = req?.params?.id;

  // 1. Fetch User with address details
  const user = await User.findById(userId)
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
    });

  if (!user) {
    return res.status(404).json(new ApiResponse(404, {}, "User not found"));
  }

  const totalCustomers = await User.countDocuments({ salePerson: userId });

  // 3. Find users (customers) assigned to this salesperson
  const totalOrders = await Order.aggregate([
    {
      $lookup: {
        from: "users", // collection name in lowercase & plural
        localField: "user",
        foreignField: "_id",
        as: "userDetails",
      },
    },
    { $unwind: "$userDetails" },
    {
      $match: {
        "userDetails.salePerson": new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $count: "totalOrders",
    },
  ]);

  // 5. Count pending orders (not delivered) for these customers
  const pendingOrdersResult = await Order.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userDetails",
      },
    },
    { $unwind: "$userDetails" },
    {
      $match: {
        "userDetails.salePerson": new mongoose.Types.ObjectId(userId),
        orderStatus: { $ne: "delivered" }, // or use $nin if there are multiple statuses to exclude
      },
    },
    {
      $count: "pendingOrders",
    },
  ]);

  const pendingOrderCount = pendingOrdersResult[0]?.pendingOrders || 0;
  const totalOrderCount = totalOrders[0]?.totalOrders || 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user,
        stats: {
          totalCustomers,
          totalOrders: totalOrderCount,
          pendingOrders: pendingOrderCount,
        },
      },
      "User retrieved successfully"
    )
  );
});

const updateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const existingUser = await User.findById(userId);

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

const getSaleUserDropdown = asyncHandler(async (req, res) => {
  const {
    search,
    page,
    limit,
    startDate = "",
    endDate = "",
    days,
    state,
    city,
  } = req.query;

  let where = {
    role: "sale_member",
  };

  // Search by userName (case-insensitive)
  if (search) {
    where.userName = { $regex: search, $options: "i" };
    where.fullName = { $regex: search, $options: "i" };
    where.email = { $regex: search, $options: "i" };
    where.phone = { $regex: search, $options: "i" };
  }

  // Filter by date range
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.$gte = new Date(startDate);
    if (endDate) where.createdAt.$lte = new Date(endDate);
  }

  // Filter by predefined day ranges (Last 7 days, Last 30 days)
  if (days) {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - Number(days));
    where.createdAt = { $gte: daysAgo };
  }

  // Filter by state
  if (state) {
    where["currentAddress.state"] = state;
  }

  // Filter by city
  if (city) {
    where["currentAddress.city"] = city;
  }

  // @ts-ignore
  const data = await User.paginate(where, {
    page,
    limit,
    populate: [
      { path: "currentAddress.state", select: "_id name" },
      { path: "currentAddress.city", select: "_id name" },
      { path: "permenentAddress.state", select: "_id name" },
      { path: "permenentAddress.city", select: "_id name" },
    ],
  });

  const options = data?.results?.map((item) => {
    return {
      label: item?.fullName,
      value: item?._id,
    };
  });
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { options: options },
        "Sale user dropdown retrieved successfully"
      )
    );
});

module.exports = {
  createUser,
  getUsers,
  getUserById,
  getSaleUserDetailsById,
  updateUser,
  deleteUserById,
  getSaleUserDropdown,
};
