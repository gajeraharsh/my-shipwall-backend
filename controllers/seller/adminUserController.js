const User = require("../../models/User");
const { asyncHandler } = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");
const ApiError = require("../../utils/apiError");
const { uploadFileToS3 } = require("../../services/fileUploads3Service");
const Joi = require("joi");
const Order = require("../../models/Order");

const userValidationSchema = Joi.object({
  userName: Joi.string().when("role", {
    is: Joi.valid("sale_admin", "sale_member"),
    then: Joi.required().messages({
      "string.base": "Username must be a string.",
      "any.required":
        "Username is required for sale_admin or sale_member role.",
    }),
    otherwise: Joi.optional(),
  }),
  logginId: Joi.string().when("role", {
    is: Joi.valid("admin"),
    then: Joi.required().messages({
      "string.base": "Login ID must be a string.",
      "any.required":
        "Login ID is required for sale_admin, sale_member, or admin role.",
    }),
    otherwise: Joi.optional(),
  }),
  email: Joi.string().email().required().messages({
    "string.base": "Email must be a string.",
    "string.email": "Please provide a valid email address.",
    "any.required": "Email is required.",
  }),
  phone: Joi.string().required().messages({
    "string.base": "Phone number must be a string.",
    "any.required": "Phone number is required.",
  }),

  profileImage: Joi.string().optional().messages({
    "string.base": "Profile image must be a string.",
  }),

  role: Joi.string()
    .valid("admin", "user", "sale_admin", "sale_member")
    .required()
    .messages({
      "string.base": "Role must be a string.",
      "any.required": "Role is required.",
      "any.only":
        'Role must be one of "admin", "user", "sale_admin", or "sale_member".',
    }),
  password: Joi.string().required().messages({
    "string.base": "Password must be a string.",
    "any.required": "Password is required.",
  }),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "string.base": "Confirm Password must be a string.",
    "any.required": "Confirm Password is required.",
    "any.only": "Confirm Password must match the Password.",
  }),
  adminRole: Joi.any().required(),
});

const createAdminUser = asyncHandler(async (req, res) => {
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
    throw new ApiError(409, "Admin user already exist.");
  }

  const files = req.files;

  let profileImageUrl = null;

  // Handle file uploads
  if (files?.profileImage?.[0]) {
    profileImageUrl = await uploadFileToS3(
      files.profileImage[0],
      req.user?._id
    );
  }

  const input = {
    ...value,
  };

  if (profileImageUrl) input.profileImage = profileImageUrl;

  const user = await User.create(input);
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(200, createdUser, "Admin user registered Successfully")
    );
});

const getAdminUsers = asyncHandler(async (req, res) => {
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
    role: "sale_admin",
    isSuperSaleAdmin: { $ne: true },
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
  // @ts-ignore
  const users = await User.paginate(where, {
    page,
    limit,
    populate: [
      {
        path: "adminRole",
        select: "name _id",
      },
    ],
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { customerList: users },
        "Admin users retrieved successfully"
      )
    );
});

const getAdminUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req?.params.id).populate({
    path: "adminRole",
    select: "name _id",
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { user: user }, "Admin user retrivied successfully")
    );
});

const updateAdminUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const existingUser = await User.findById(userId);

  if (!existingUser) {
    throw new ApiError(404, "Admin user not found");
  }

  const files = req.files;

  let profileImageUrl = null;

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
    throw new ApiError(
      500,
      "Something went wrong while updating the admin user"
    );
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
        "Admin user updated successfully"
      )
    );
});

const deleteAdminUserById = asyncHandler(async (req, res) => {
  try {
    const id = req?.params.id;

    if (!id) {
      throw new ApiError(400, "Id is required");
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) throw new ApiError(404, "User not found");
    return res
      .status(200)
      .json(new ApiResponse(200, user, "Admin user deleted successfully"));
  } catch (error) {
    throw new ApiError(500, error.message || "deleteAdminUserById  failed");
  }
});

const getAdminUsersDropdown = asyncHandler(async (req, res) => {
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
    role: "sale_admin",
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

  // @ts-ignore
  const data = await User.paginate(where, {
    page,
    limit,
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
        "Admin users dropdown retrieved successfully"
      )
    );
});

const adminDashboardMatrix = asyncHandler(async (req, res) => {
  const saleMemberCount = await User.countDocuments({ role: "sale_member" });

  const saleReqCount = await User.countDocuments({
    role: "sale_member",
    saleUserStatus: { $in: ["Pending"] },
  });

  const totalCustomers = await User.countDocuments({
    role: "user",
  });

  const customerByState = await User.aggregate([
    {
      $match: {
        role: "user",
        "deliveryAddress.state": { $ne: null }, // skip users with no state info
      },
    },
    {
      $group: {
        _id: "$deliveryAddress.state",
        totalCustomers: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "states",
        localField: "_id",
        foreignField: "_id",
        as: "stateDetails",
      },
    },
    {
      $unwind: {
        path: "$stateDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        stateId: "$_id",
        stateName: "$stateDetails.name",
        totalCustomers: 1,
        _id: 0,
      },
    },
  ]);

  const matrix = {
    saleMemberCount,
    saleReqCount,
    totalCustomers,
    customerByState,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, matrix, "admin matrix successfully"));
});

const getTopSellingProducts = async (req, res) => {
  try {
    const { filter } = req.query;

    // Calculate the date range based on filter
    let startDate, endDate;
    const now = new Date();

    switch (filter) {
      case "1": // Today
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(now.setHours(23, 59, 59, 999));
        break;
      case "2": // Yesterday
        const yesterday = new Date(now.setDate(now.getDate() - 1));
        startDate = new Date(yesterday.setHours(0, 0, 0, 0));
        endDate = new Date(yesterday.setHours(23, 59, 59, 999));
        break;
      case "3": // Last 7 days
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        endDate = new Date();
        break;
      case "4": // Last 30 days
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        endDate = new Date();
        break;
      default: // No filter
        startDate = null;
        endDate = null;
    }

    // Match orders in the date range
    const matchStage = {
      ...(startDate &&
        endDate && {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        }),
    };

    const topProducts = await Order.aggregate([
      { $match: matchStage },
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.product",
          totalAmount: { $sum: "$products.subtotal" },
          totalOrders: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $project: {
          _id: 0,
          productId: "$_id",
          productName: "$productInfo.productName",
          bodyColor:"$productInfo.bodyColor",
          modelNo:"$productInfo.modelNo",
          watt:"$productInfo.watt",
          totalAmount: 1,
          totalOrders: 1,
        },
      },
      { $sort: { totalAmount: -1 } },
      { $limit: 10 },
    ]);

    res.status(200).json({ success: true, data: topProducts });
  } catch (err) {
    console.error("Error in getTopSellingProducts:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getTopSalesPersons = async (req, res) => {
  try {
    const result = await Order.aggregate([
      // 1. Join with users to get customer info
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "customer",
        },
      },
      { $unwind: "$customer" },

      // 2. Filter orders where customer has a salePerson
      {
        $match: {
          "customer.salePerson": { $ne: null },
        },
      },

      // 3. Group by salePerson and calculate total and count
      {
        $group: {
          _id: "$customer.salePerson",
          totalOrderAmount: {
            $sum: { $ifNull: ["$finalTotal", 0] },
          },
          orderCount: { $sum: 1 },
        },
      },

      // 4. Sort descending by totalOrderAmount
      { $sort: { totalOrderAmount: -1 } },

      // 5. Limit to top 10
      { $limit: 10 },

      // 6. Get salePerson info
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "salePersonInfo",
        },
      },
      { $unwind: "$salePersonInfo" },

      // 7. Format output
      {
        $project: {
          salePersonId: "$_id",
          salePersonName: "$salePersonInfo.fullName",
          totalOrderAmount: 1,
          orderCount: 1,
          _id: 0,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error in getTopSalesPersons:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



module.exports = {
  createAdminUser,
  getAdminUsers,
  getAdminUserById,
  updateAdminUser,
  deleteAdminUserById,
  getAdminUsersDropdown,
  adminDashboardMatrix,
  getTopSellingProducts,
  getTopSalesPersons,
  getTopSalesPersons
};
