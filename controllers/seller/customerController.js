const User = require("../../models/User");
const { userValidationSchema } = require("../../validations/user");
const { asyncHandler } = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");
const ApiError = require("../../utils/apiError");
const { uploadFileToS3 } = require("../../services/fileUploads3Service");
const Order = require("../../models/Order");
const { status: httpStatus } = require("http-status");

const mongoose = require("mongoose");
const StoreVisit = require("../../models/StoreVisit");

// `Types` is a named export in Mongoose, so it should be destructured properly
const { Types } = mongoose;

const createCustomer = asyncHandler(async (req, res) => {
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

const getCustomers = asyncHandler(async (req, res) => {
  const {
    search,
    page = 1,
    limit = 10,
    startDate = "",
    endDate = "",
    days,
    state,
    city,
    isCustomerPool = false,
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
  if (isCustomerPool === "true" || isCustomerPool === true) {
    const noSalePersonConditions = [
      { salePerson: null },
      { salePerson: { $exists: false } },
    ];
    andConditions.push({ $or: noSalePersonConditions });
  }

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

  console.log("Query Filters:", JSON.stringify(where, null, 2));

  // @ts-ignore
  const users = await User.paginate(where, {
    page: Number(page),
    limit: Number(limit),
    populate: [
      { path: "billingAddress.state", select: "_id name" },
      { path: "billingAddress.city", select: "_id name" },
      { path: "deliveryAddress.state", select: "_id name" },
      { path: "deliveryAddress.city", select: "_id name" },
      { path: "salePerson", select: "_id fullName" },
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
      path: "salePerson",
      select: "_id fullName",
    });

  if (!user) {
    return res.status(404).json(new ApiResponse(404, {}, "User not found"));
  }

  // Fetch order statistics
  const orderStats = await Order.aggregate([
    { $match: { user: user._id } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalOrderAmount: { $sum: "$finalTotal" },
        totalAmountPaid: {
          $sum: {
            $cond: [{ $eq: ["$paymentStatus", "Paid"] }, "$finalTotal", 0],
          },
        },
      },
    },
  ]);

  const stats = orderStats[0] || {
    totalOrders: 0,
    totalOrderAmount: 0,
    totalAmountPaid: 0,
  };

  // Attach stats to user object
  const userWithStats = user.toObject(); // Convert Mongoose document to a plain object
  userWithStats.stats = stats;

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: userWithStats, ...stats },
        "User retrieved successfully"
      )
    );
});

const updateCustomer = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const existingUser = await User.findById(userId);

  if (!existingUser) {
    throw new ApiError(404, "User not found");
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

const deleteCustomerById = asyncHandler(async (req, res) => {
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

const getCustomerOrders = asyncHandler(async (req, res) => {
  try {
    console.log(req.query, "req.query;");

    const { search, page, limit, startDate, endDate, orderStatus, user_id } =
      req.query;

    console.log("Received user_id:", user_id);

    const where = {};

    // Validate user_id before converting
    if (user_id) {
      if (!mongoose.Types.ObjectId.isValid(user_id)) {
        console.error("Invalid user_id:", user_id);
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          `Invalid user ID format: ${user_id}`
        );
      }
      where.user = new mongoose.Types.ObjectId(user_id);
    }

    if (search) {
      where.orderStatus = { $regex: search, $options: "i" };
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.$gte = new Date(startDate);
      if (endDate) where.createdAt.$lte = new Date(endDate);
    }

    if (orderStatus) {
      where.orderStatus = orderStatus;
    }

    const orders = await Order.paginate(where, {
      page,
      limit,
    });

    if (!orders || orders.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, "No orders found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, { orders }, "Rrders retrieved successfully"));
  } catch (err) {
    console.error("Error in getCustomerOrders:", err);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error retrieving orders"
    );
  }
});

const assignSaleUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { salePersonId } = req.body;

  const existingUser = await User.findById(userId);

  if (!existingUser) {
    throw new ApiError(404, "User not found");
  }
  console.log(userId, salePersonId);
  // Handle file uploads
  const updateData = {
    salePerson: salePersonId,
  };

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (!updatedUser) {
    throw new ApiError(500, "Something went wrong while assigning sale person");
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
        "Sale person assign successsfully"
      )
    );
});

const getStoreVisits = asyncHandler(async (req, res) => {
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

  const matchConditions = {};

  // 🌟 Search user by fullName or user ID
  if (search) {
    matchConditions["$or"] = [
      { "user.fullName": { $regex: search, $options: "i" } }, // Search by name
      { "user.id": search }, // Search by user ID (exact match)
    ];
  }

  // Date range filter
  if (startDate || endDate) {
    matchConditions["fromDate"] = {};
    if (startDate) matchConditions["fromDate"].$gte = new Date(startDate);
    if (endDate) matchConditions["fromDate"].$lte = new Date(endDate);
  }

  // Filter by last X days
  if (days) {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - Number(days));
    matchConditions["fromDate"] = { $gte: daysAgo };
  }

  // State filter
  if (state) {
    matchConditions["user.currentAddress.state"] = state;
  }

  // City filter
  if (city) {
    matchConditions["user.currentAddress.city"] = city;
  }

  // SalePerson filter
  if (salePerson) {
    if (!Types.ObjectId.isValid(salePerson)) {
      return res.status(400).json({ message: "Invalid salePerson ID" });
    }
    matchConditions["user.salePerson"] = new Types.ObjectId(salePerson);
  }

  const pipeline = [
    // Step 1: Join StoreVisit with User
    {
      $lookup: {
        from: "users", // 👈 Ensure this matches your MongoDB collection name
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" }, // Flatten the user array

    // Step 2: Apply filters
    { $match: matchConditions },

    // Step 3: Join SalePerson data
    {
      $lookup: {
        from: "users",
        localField: "user.salePerson",
        foreignField: "_id",
        as: "user.salePerson",
      },
    },
    { $unwind: { path: "$user.salePerson", preserveNullAndEmptyArrays: true } },

    // Step 4: Pagination using $facet
    {
      $facet: {
        metadata: [{ $count: "total" }],
        data: [
          { $skip: (Number(page) - 1) * Number(limit) },
          { $limit: Number(limit) },
        ],
      },
    },
  ];

  const result = await StoreVisit.aggregate(pipeline).exec();

  const storeVisits = result[0]?.data || [];
  const totalResults = result[0]?.metadata[0]?.total || 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        storeVisitList: storeVisits,
        totalResults,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalResults / Number(limit)),
      },
      "Store visits retrieved successfully"
    )
  );
});

const getCustomerPotentialReport = asyncHandler(async (req, res) => {
  const {
    month,
    year,
    page = 1,
    limit = 10,
    search,
    state,
    city,
    salePerson,
  } = req.query;

  // Validate if month and year are provided
  if (!month || !year) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Month and Year are required"));
  }

  // Ensure valid month and year
  if (isNaN(Number(month)) || isNaN(Number(year))) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Invalid month or year"));
  }

  // Get the first and last date of the month in UTC format
  const startDate = new Date(Date.UTC(Number(year), Number(month) - 1, 1)); // First day of the month
  const endDate = new Date(
    Date.UTC(Number(year), Number(month), 0, 23, 59, 59, 999)
  ); // Last day of the month

  // Match conditions for filtering orders by createdAt and orderStatus
  const matchConditions = {
    createdAt: { $gte: startDate, $lte: endDate },
    orderStatus: { $nin: ["Cancelled", "Returned"] },
  };

  // User match conditions for search, state, city, salePerson
  const userMatchConditions = {};

  // Handle search query
  if (search) {
    userMatchConditions.$or = [
      { "userInfo.firstName": { $regex: search, $options: "i" } }, // Add firstName search (case-insensitive)
      { "userInfo.email": { $regex: search, $options: "i" } }, // Add firstName search (case-insensitive)
      { "userInfo.phone": { $regex: search, $options: "i" } }, // Add firstName search (case-insensitive)
      { "userInfo.id": { $regex: search, $options: "i" } }, // Add firstName search (case-insensitive)
    ];
  }

  // Handle state filter
  if (state) {
    userMatchConditions["userInfo.billingAddress.state"] =
      new mongoose.Types.ObjectId(state); // Exact match for state
  }

  // Handle city filter
  if (city) {
    userMatchConditions["userInfo.billingAddress.city"] =
      new mongoose.Types.ObjectId(city); // Exact match for city
  }

  // Handle salePerson filter
  if (salePerson) {
    userMatchConditions["userInfo.salePerson"] = new mongoose.Types.ObjectId(
      salePerson
    ); // ; // Exact match for salePerson
  }

  console.log(userMatchConditions, "userMatchConditions");

  // Aggregation pipeline to generate customer potential report
  const aggregationPipeline = [
    { $match: matchConditions }, // Filter orders by date and status
    {
      $group: {
        _id: "$user", // Group by user
        totalPurchaseAmount: { $sum: "$finalTotal" },
        orderCount: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "userInfo",
      },
    },
    { $unwind: "$userInfo" },

    // Apply user match conditions (search, state, city, salePerson filters)
    { $match: userMatchConditions },

    // Lookup city information
    {
      $lookup: {
        from: "cities",
        localField: "userInfo.billingAddress.city",
        foreignField: "_id",
        as: "cityInfo",
      },
    },
    { $unwind: { path: "$cityInfo", preserveNullAndEmptyArrays: true } },

    // Lookup state information
    {
      $lookup: {
        from: "states",
        localField: "userInfo.billingAddress.state",
        foreignField: "_id",
        as: "stateInfo",
      },
    },
    { $unwind: { path: "$stateInfo", preserveNullAndEmptyArrays: true } },

    // Lookup salePerson information
    {
      $lookup: {
        from: "users",
        localField: "userInfo.salePerson",
        foreignField: "_id",
        as: "salePersonInfo",
      },
    },
    { $unwind: { path: "$salePersonInfo", preserveNullAndEmptyArrays: true } },

    {
      $project: {
        _id: 0,
        userId: "$userInfo._id",
        userName: "$userInfo.fullName",
        email: "$userInfo.email",
        phone: "$userInfo.phone",
        state: "$stateInfo.name",
        city: "$cityInfo.name",
        salePerson: "$salePersonInfo.fullName",
        salePersonEmail: "$salePersonInfo.email",
        salePersonPhone: "$salePersonInfo.phone",
        potential: "$userInfo.potential",
        businessName: "$userInfo.businessName",
        id: "$userInfo.id",
        totalPurchaseAmount: 1,
        orderCount: 1,
        completionPercentage: {
          $cond: {
            if: { $eq: ["$userInfo.potential", 0] },
            then: 0,
            else: {
              $round: [
                {
                  $multiply: [
                    {
                      $divide: ["$totalPurchaseAmount", "$userInfo.potential"],
                    },
                    100,
                  ],
                },
                2,
              ],
            },
          },
        },
      },
    },
    { $sort: { totalPurchaseAmount: -1 } },
    { $skip: (Number(page) - 1) * Number(limit) },
    { $limit: Number(limit) },
  ];

  // Total count query to determine totalResults and totalPages
  const totalCountQuery = [
    { $match: matchConditions },
    { $group: { _id: "$user" } },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "userInfo",
      },
    },
    { $unwind: "$userInfo" },
    { $match: userMatchConditions },
    { $count: "totalResults" },
  ];

  // Execute both the report aggregation and total count query in parallel
  try {
    const [customerReport, totalCountResult] = await Promise.all([
      Order.aggregate(aggregationPipeline),
      Order.aggregate(totalCountQuery),
    ]);

    const totalResults =
      totalCountResult.length > 0 ? totalCountResult[0].totalResults : 0;
    const totalPages = Math.ceil(totalResults / limit);

    const monthName = new Date(
      Date.UTC(Number(year), Number(month) - 1, 1)
    ).toLocaleString("default", { month: "short", year: "numeric" });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          report: customerReport,
          monthYear: monthName,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            totalResults,
            totalPages,
          },
        },
        "Customer potential report generated successfully"
      )
    );
  } catch (error) {
    console.error("Error generating report:", error);
    return res
      .status(500)
      .json(
        new ApiResponse(500, {}, "Error generating customer potential report")
      );
  }
});

const createUserByAdmin = asyncHandler(async (req, res) => {
  const { error, value } = userValidationSchema.validate(req?.body, {
    abortEarly: false,
  });

  if (error) {
    console.log(error.details);

    throw new ApiError(400, "Validation failed.", error?.details);
  }

  const { phone, userName, logginId, role, email } = value;

  const query = [];

  if (phone) query.push({ phone, role: "user" });
  if (email) query.push({ email, role: "user" });

  const existedUser = await User.findOne({
    $or: query,
  });

  if (existedUser) {
    throw new ApiError(409, "User already exist with email or phone number.");
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
    .json(new ApiResponse(200, createdUser, "User created successfully."));
});

const updateSaleMember = asyncHandler(async (req, res) => {
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
    role,
    dob,
    lenguage,
    gender,
    altContactNumber,
  } = req.body;

  const files = req.files;

  let profileImageUrl = null;

  // Handle file uploads
  if (files?.profileImage?.[0]) {
    profileImageUrl = await uploadFileToS3(
      files.profileImage[0],
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
  if (role) updateData.role = role;
  if (dob) updateData.dob = dob;
  if (lenguage) updateData.lenguage = lenguage;
  if (gender) updateData.gender = gender;
  if (altContactNumber) updateData.altContactNumber;

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

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomerById,
  getCustomerOrders,
  assignSaleUser,
  getStoreVisits,
  getCustomerPotentialReport,
  createUserByAdmin,
};
