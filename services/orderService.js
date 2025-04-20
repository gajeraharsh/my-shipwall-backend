const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const ApiError = require("../utils/apiError");
const { status: httpStatus } = require("http-status");

const mongoose = require("mongoose");
const moment = require("moment");
const GeneralSettingModel = require("../models/generalSetting");
const ReturnOrder = require("../models/ReturnOrder");
const { uploadFileToS3 } = require("./fileUploads3Service");
const IncentiveModel = require("../models/Incentive");
const IncentivePayoutModel = require("../models/IncentivePayout");
const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");

const createOrderService = async (userId) => {
  const cart = await Cart.findOne({ user: userId }).populate(
    "products.product"
  );

  if (!cart || cart.products.length === 0) {
    throw new ApiError(400, "Cart is empty. Cannot place an order.");
  }

  const lastOrder = await Order.findOne().sort({ orderId: -1 });
  const newOrderNumber = lastOrder ? lastOrder.orderId + 1 : 1;

  // Validate stock availability
  for (const item of cart.products) {
    if (item.quantity > item.product.stock) {
      throw new ApiError(
        400,
        `Insufficient stock for ${item.product.productName}`
      );
    }
  }

  const newOrder = new Order({
    user: userId,
    orderId: newOrderNumber,
    products: cart.products.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      boxQuantity: item.boxQuantity,
      boxPrice: item?.boxPrice,
      price: item.price,
      subtotal: item.subtotal,
      taxAmount: item?.taxAmount,
      taxPercent: item?.taxPercent,
      hsnTx: item?.hsnTx,
    })),
    finalTotal: cart.totalAmount,
    subtotal: cart.subtotal,
    shippingFee: cart.shippingFee,
    taxAmount: cart.taxAmount,
    subTotalIncTax: cart?.subTotalIncTax,
    shippingDetails: {
      address: "User Address",
      city: "User City",
      state: "User State",
      postalCode: "User Postal Code",
      country: "User Country",
      phone: "User Phone",
    },
    orderStatus: "initiated",
    paymentStatus: "Awaiting Payment",
  });

  await newOrder.save();

  for (const item of cart.products) {
    const productCurrentStock = parseInt(item?.product?.stock);
    await Product.findByIdAndUpdate(item.product._id, {
      stock: productCurrentStock - item.quantity,
    });
  }

  cart.products = [];
  cart.totalAmount = 0;
  cart.subtotal = 0;
  cart.shippingFee = 0;
  cart.subTotalIncTax = 0;
  cart.taxAmount = 0;
  await cart.save();

  return newOrder;
};

const fetchOrders = async (req) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      fromDate,
      toDate,
      days,
      orderStatus,
      paymentStatus,
    } = req.query;

    let query = { user: req?.user?._id };

    if (search) {
      query.$or = [
        { id: { $regex: search, $options: "i" } },
        { "user.email": { $regex: search, $options: "i" } },
        { "user.fullName": { $regex: search, $options: "i" } },
      ];
    }

    if (days) {
      const today = new Date();
      const pastDate = new Date();
      pastDate.setDate(today.getDate() - parseInt(days));
      query.createdAt = { $gte: pastDate, $lte: today };
    } else if (fromDate && toDate) {
      query.createdAt = { $gte: new Date(fromDate), $lte: new Date(toDate) };
    } else if (fromDate) {
      query.createdAt = { $gte: new Date(fromDate) };
    } else if (toDate) {
      query.createdAt = { $lte: new Date(toDate) };
    }

    // Order status filter
    if (orderStatus) {
      query.orderStatus = orderStatus;
    }

    // Payment status filter
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    // Fetch orders with returnOrder virtual
    const orders = await Order.paginate(query, {
      page,
      limit,
      populate: [
        {
          path: "user",
          select: "fullName id phone email",
        },
        {
          path: "returnOrder",
          select: "_id returnStatus refundStatus createdAt",
        },
      ],
      sortBy: "createdAt:desc",
    });

    return orders;
  } catch (err) {
    console.error(err);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error retrieving orders"
    );
  }
};

const fetchAllOrders = async (req) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      fromDate,
      toDate,
      days,
      orderStatus,
      paymentStatus,
    } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        { id: { $regex: search, $options: "i" } },
        { "user.email": { $regex: search, $options: "i" } },
        { "user.fullName": { $regex: search, $options: "i" } },
      ];
    }

    if (days) {
      const today = new Date();
      const pastDate = new Date();
      pastDate.setDate(today.getDate() - parseInt(days));
      query.createdAt = { $gte: pastDate, $lte: today };
    } else if (fromDate && toDate) {
      query.createdAt = { $gte: new Date(fromDate), $lte: new Date(toDate) };
    } else if (fromDate) {
      query.createdAt = { $gte: new Date(fromDate) };
    } else if (toDate) {
      query.createdAt = { $lte: new Date(toDate) };
    }

    // Order status filter
    if (orderStatus) {
      query.orderStatus = orderStatus;
    }

    // Payment status filter
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    // Fetch orders with returnOrder virtual
    const orders = await Order.paginate(query, {
      page,
      limit,
      populate: [
        {
          path: "user",
          select: "fullName id phone email",
        },
        {
          path: "returnOrder",
          select: "_id returnStatus refundStatus createdAt",
        },
      ],
      sortBy: "createdAt:desc",
    });

    return orders;
  } catch (err) {
    console.error(err);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error retrieving orders"
    );
  }
};

const fetchOrdersBySalePerson = async (req) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    startDate,
    endDate,
    orderStatus,
    salePersonId,
    days, // Today, Yesterday, 7days, 30days
    state, // Filter by user state
    city, // Filter by user city
  } = req.query;

  const matchStage = {};

  // Filter by salePersonId
  if (salePersonId) {
    matchStage["userInfo.salePerson"] = new mongoose.Types.ObjectId(
      salePersonId
    );
  }

  if (search) {
    matchStage.$or = [
      { id: search }, // Search by orderId (if number)
      { "userInfo.fullName": { $regex: search, $options: "i" } }, // Search by user name
      { "salePersonInfo.fullName": { $regex: search, $options: "i" } }, // Search by salesperson namete
      { trackingId: { $regex: search, $options: "i" } }, // Search by tracking ID
      { transportName: { $regex: search, $options: "i" } }, // Search by transport name
      { paymentId: { $regex: search, $options: "i" } }, // Search by payment ID
      { "products.hsnTx.hsnCode": { $regex: search, $options: "i" } }, // Search by HSN code
    ];
  }

  // Filter by orderStatus or search query
  if (orderStatus) {
    matchStage.orderStatus = orderStatus;
  }

  // Filter by days (today, yesterday, 7days, 30days)
  const andConditions = [];

  if (days) {
    const now = new Date();
    let daysCondition = {};

    switch (days) {
      case "7":
        daysCondition.$gte = new Date(now.setDate(now.getDate() - 7));
        break;
      case "30":
        daysCondition.$gte = new Date(now.setDate(now.getDate() - 30));
        break;
      case "yesterday":
        const yStart = new Date();
        yStart.setDate(yStart.getDate() - 1);
        yStart.setHours(0, 0, 0, 0);

        const yEnd = new Date();
        yEnd.setDate(yEnd.getDate() - 1);
        yEnd.setHours(23, 59, 59, 999);

        daysCondition.$gte = yStart;
        daysCondition.$lte = yEnd;
        break;
      case "today":
        const tStart = new Date();
        tStart.setHours(0, 0, 0, 0);

        const tEnd = new Date();
        tEnd.setHours(23, 59, 59, 999);

        daysCondition.$gte = tStart;
        daysCondition.$lte = tEnd;
        break;
    }

    if (Object.keys(daysCondition).length) {
      andConditions.push({ createdAt: daysCondition });
    }
  }

  if (startDate || endDate) {
    const manualDateCondition = {};
    if (startDate) manualDateCondition.$gte = new Date(startDate);
    if (endDate) manualDateCondition.$lte = new Date(endDate);

    if (Object.keys(manualDateCondition).length) {
      andConditions.push({ createdAt: manualDateCondition });
    }
  }

  if (andConditions.length > 0) {
    matchStage.$and = andConditions;
  }

  // Filter by state (user billing address state)
  if (state) {
    matchStage["userInfo.billingAddress.state"] = new mongoose.Types.ObjectId(
      state
    );
  }

  // Filter by city (user billing address city)
  if (city) {
    matchStage["userInfo.billingAddress.city"] = new mongoose.Types.ObjectId(
      city
    );
  }

  const skip = (Number(page) - 1) * Number(limit);

  const pipeline = [
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userInfo",
      },
    },
    { $unwind: "$userInfo" },

    // Join with City model (assuming billing address structure is userInfo.billingAddress.city)
    {
      $lookup: {
        from: "cities",
        localField: "userInfo.billingAddress.city",
        foreignField: "_id",
        as: "userInfo.billingAddress.city",
      },
    },
    {
      $unwind: {
        path: "$userInfo.billingAddress.city",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "states",
        localField: "userInfo.billingAddress.state",
        foreignField: "_id",
        as: "userInfo.billingAddress.state",
      },
    },
    {
      $unwind: {
        path: "$userInfo.billingAddress.state",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "users", // You want to join the 'users' collection again for the salePerson
        localField: "userInfo.salePerson",
        foreignField: "_id",
        as: "salePersonInfo",
      },
    },
    {
      $unwind: {
        path: "$salePersonInfo",
        preserveNullAndEmptyArrays: true, // Include orders without a salePerson if needed
      },
    },

    // Apply the match stage for filtering orders
    { $match: matchStage },

    {
      $project: {
        _id: 1,
        id: 1,
        orderId: 1,
        products: 1,
        finalTotal: 1,
        subtotal: 1,
        subTotalIncTax: 1,
        shippingFee: 1,
        taxAmount: 1,
        orderStatus: 1,
        paymentStatus: 1,
        shippingDetails: 1,
        deliveredAt: 1,
        createdAt: 1,
        updatedAt: 1,
        hsnTx: 1,
        user: "$userInfo",
        salePerson: "$salePersonInfo", // Add the salePerson info to the projection
      },
    },
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: Number(limit) },
  ];

  const orders = await Order.aggregate(pipeline);

  // Total count pipeline
  const totalPipeline = [...pipeline];

  // Remove skip, limit, and project for count
  const countPipeline = totalPipeline.filter((stage) => {
    return !(
      "$skip" in stage ||
      "$limit" in stage ||
      "$project" in stage ||
      "$sort" in stage
    );
  });

  countPipeline.push({ $count: "total" });

  const totalResult = await Order.aggregate(countPipeline);
  const totalDocs = totalResult[0]?.total || 0;

  return {
    docs: orders,
    totalDocs,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(totalDocs / limit),
  };
};

const getOrderByIdService = async (orderId) => {
  try {
    const order = await Order.findOne({ _id: orderId })
      .populate({
        path: "products.product",
        model: "Product",
        select:
          "productName modelNo color watt price boxQuantity productThumbImageUrl productThumbImage bodyColor stock",
        populate: {
          path: "color",
          model: "ColorMaster",
          select: "colorName",
        },
      })
      .populate({
        path: "user",
        select:
          "fullName email phone billingAddress deliveryAddress id _id businessName phone email gstNumber",
        populate: [
          {
            path: "billingAddress.city",
            model: "City", // Replace with your actual city model name
            select: "name",
          },
          {
            path: "billingAddress.state",
            model: "State", // Replace with your actual state model name
            select: "name",
          },
          {
            path: "salePerson",
            model: "User", // Replace with your actual state model name
            select: "fullName",
          },
          {
            path: "deliveryAddress.city",
            model: "City", // Replace with your actual city model name
            select: "name",
          },
          {
            path: "deliveryAddress.state",
            model: "State", // Replace with your actual state model name
            select: "name",
          },
        ],
      })
      .populate({
        path: "returnOrder",
        select: "_id returnStatus refundStatus createdAt",
      });

    if (!order) {
      throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
    }

    const returnOrder = await ReturnOrder.countDocuments({
      order: order?._id,
      returnStatus: { $ne: "Cancelled" },
    });

    const generalSetting = await GeneralSettingModel.findOne({});
    const returnDaysLimit = generalSetting?.returnDays || 0;

    const orderDate = moment(order.createdAt);
    const today = moment();
    const daysPassed = today.diff(orderDate, "days");
    const returnDaysLeft = Math.max(returnDaysLimit - daysPassed, 0);
    const isReturnExpired = daysPassed > returnDaysLimit;
    const isCanReturn = order?.orderStatus == "delevered";

    const isReturnedOrder = returnOrder > 0;

    const orderObject = order.toObject();

    return {
      ...orderObject,
      returnDaysLeft,
      isReturnExpired,
      isReturnedOrder,
      isCanReturn,
    };
  } catch (err) {
    console.log(err);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error retrieving order details"
    );
  }
};

const getIncentivePercentage = async (salePerson, finalTotal) => {
  // Check salesperson-specific incentive
  let incentive = await IncentiveModel.findOne({
    user: salePerson,
    minAmount: { $lte: finalTotal },
    maxAmount: { $gte: finalTotal },
  });

  // If no salesperson-specific incentive, check global incentive
  if (!incentive) {
    incentive = await IncentiveModel.findOne({
      minAmount: { $lte: finalTotal },
      maxAmount: { $gte: finalTotal },
    });
  }

  // Return percentage if incentive found, otherwise return false
  return incentive ? incentive.incentivePercentage : false;
};

const updateOrderStatusService = async (orderId, newStatus, changedBy) => {
  const order = await Order.findById(orderId).populate({
    path: "user",
    select: "_id id salePerson",
  });
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, "Rejection Order not found");
  }

  const validStatuses = [
    "packing",
    "dispatch",
    "delevered",
    "InLogistic",
    "Cancelled",
  ];

  if (!validStatuses.includes(newStatus)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid order status");
  }

  if (order?.orderStatus == "delevered") {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Order is delivered you can not change it again."
    );
  }

  order.orderStatus = newStatus;

  // Usage
  if (newStatus === "delevered") {
    const salePerson = order?.user?.salePerson;
    const finalTotal = order.finalTotal;

    if (salePerson) {
      const incentivePercentage = await getIncentivePercentage(
        salePerson,
        finalTotal
      );

      if (incentivePercentage !== false) {
        const incentiveAmount = Number(
          ((incentivePercentage / 100) * finalTotal).toFixed(2)
        );

        await IncentivePayoutModel.create({
          salePerson: salePerson,
          user: order.user._id,
          order: order?._id,
          totalOrderAmount: finalTotal,
          percentageIncentive: incentivePercentage,
          totalIncentiveAmount: incentiveAmount,
        });
      }
    }
  }

  await order.save();

  return order;
};

const changeOrder = async (orderId, data, changedBy) => {
  const {
    trackingId = null,
    trackingLink = null,
    transportName = null,
    sapInvoideNumber = null,
    eWayBillNo = null,
  } = data;

  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, "Rejection Order not found");
  }

  if (trackingId) {
    order.trackingId = trackingId;
  }

  if (trackingLink) {
    order.trackingLink = trackingLink;
  }

  if (transportName) {
    order.transportName = transportName;
  }

  if (sapInvoideNumber) {
    order.sapInvoideNumber = sapInvoideNumber;
  }

  if (eWayBillNo) {
    order.eWayBillNo = eWayBillNo;
  }

  await order.save();

  return order;
};

const changePaymentStatus = async (orderId, data, changedBy) => {
  const { paymentRemark, paymentMode } = data;

  if (!paymentRemark || !paymentMode) {
    throw new ApiError(httpStatus[400], "Invalid input.");
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, "Rejection Order not found");
  }

  order.paymentRemark = paymentRemark;
  order.paymentMode = paymentMode;

  await order.save();

  return order;
};

const UploadLr = async (orderId, file, changedBy) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, "Rejection Order not found");
  }

  let uploadlrUrl = null;

  if (file) {
    uploadlrUrl = await uploadFileToS3(file, changedBy);
  }

  order.uploadlr = uploadlrUrl;

  await order.save();

  return order;
};

const fetchOrderExcelFileExport = async (req) => {
  const matchStage = {};

  const pipeline = [
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userInfo",
      },
    },
    { $unwind: "$userInfo" },

    // Join with City model (assuming billing address structure is userInfo.billingAddress.city)
    {
      $lookup: {
        from: "cities",
        localField: "userInfo.billingAddress.city",
        foreignField: "_id",
        as: "userInfo.billingAddress.city",
      },
    },
    {
      $unwind: {
        path: "$userInfo.billingAddress.city",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "states",
        localField: "userInfo.billingAddress.state",
        foreignField: "_id",
        as: "userInfo.billingAddress.state",
      },
    },
    {
      $unwind: {
        path: "$userInfo.billingAddress.state",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "users", // You want to join the 'users' collection again for the salePerson
        localField: "userInfo.salePerson",
        foreignField: "_id",
        as: "salePersonInfo",
      },
    },
    {
      $unwind: {
        path: "$salePersonInfo",
        preserveNullAndEmptyArrays: true, // Include orders without a salePerson if needed
      },
    },
    {
      $lookup: {
        from: "returnorders", // collection name (lowercase plural)
        let: { orderId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$order", "$$orderId"] },
                  { $ne: ["$returnStatus", "Cancelled"] },
                ],
              },
            },
          },
        ],
        as: "returnOrder",
      },
    },
    {
      $unwind: {
        path: "$returnOrder",
        preserveNullAndEmptyArrays: true,
      },
    },

    // Apply the match stage for filtering orders
    { $match: matchStage },

    {
      $project: {
        _id: 1,
        id: 1,
        orderId: 1,
        products: 1,
        finalTotal: 1,
        subtotal: 1,
        subTotalIncTax: 1,
        shippingFee: 1,
        taxAmount: 1,
        orderStatus: 1,
        paymentStatus: 1,
        shippingDetails: 1,
        deliveredAt: 1,
        createdAt: 1,
        updatedAt: 1,
        hsnTx: 1,
        recipientId: 1,
        paymentMode: 1,
        paymentId: 1,
        transportName: 1,
        trackingLink: 1,
        trackingId: 1,
        sapInvoideNumber: 1,
        eWayBillNo: 1,
        uploadlr: 1,
        deliveredAt: 1,
        returnOrder: 1,
        rejectionOrder: 1,
        user: "$userInfo",
        salePerson: "$salePersonInfo", // Add the salePerson info to the projection
      },
    },
    { $sort: { createdAt: -1 } },
  ];

  const orders = await Order.aggregate(pipeline);

  // Create Excel workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Orders");

  worksheet.columns = [
    { header: "id", key: "keyid", width: 20 },
    { header: "User ID", key: "userId", width: 20 },
    { header: "Business Name", key: "businessName", width: 20 },
    { header: "Customer Name", key: "fullName", width: 25 },
    { header: "Customer Email", key: "customerEmail", width: 30 },
    {
      header: "Customer Mobile Number",
      key: "customerMobileNumber",
      width: 30,
    },
    { header: "GST number", key: "GstNumber", width: 30 },
    { header: "Order ID", key: "orderId", width: 20 },
    { header: "Sub Total", key: "subTotal", width: 20 },
    {
      header: "Sub Total Including Tax",
      key: "subTotalIncludingTax",
      width: 20,
    },
    { header: "Tax", key: "tax", width: 20 },
    { header: "Shipping Fees", key: "Shipping", width: 20 },
    { header: "Order Amount", key: "orderAmount", width: 20 },
    { header: "Receipt No ", key: "ReceiptNo", width: 20 },
    { header: "Order Status ", key: "OrderStatus", width: 20 },
    { header: "Payment Mode", key: "PaymentMode", width: 20 },
    { header: "Payment Id", key: "PaymentId", width: 20 },
    { header: "Payment Status", key: "PaymentStatus", width: 20 },
    { header: "Order On", key: "OrderOn", width: 20 },
    { header: "Last Updated On", key: "LastUpdatedOn", width: 20 },
    { header: "Billin Address", key: "BillingAddress", width: 20 },
    { header: "Delivery Address", key: "DeliveryAddress", width: 20 },
    { header: "Tracking Id", key: "TrackingId", width: 20 },
    { header: "Tracking Link", key: "TrackingLink", width: 20 },
    { header: "Transport Name", key: "transport_name", width: 20 },
    { header: "EWay No", key: "eWayBillNo", width: 20 },
    { header: "LRDocument", key: "uploadlr", width: 20 },
    { header: "Rejection id", key: "RejectionGuid", width: 20 },
    { header: "Return id", key: "ReturnGuid", width: 20 },
    { header: "Rejection Status", key: "RejectionStatus", width: 20 },
    { header: "Return Status", key: "ReturnStatus", width: 20 },
  ];

  function formatFullAddress(address) {
    if (!address) return "";

    const line1 = address.line1 || "";
    const line2 = address.line2 || "";
    const landmark = address.landmark ? `, Landmark: ${address.landmark}` : "";
    const location = address.location ? `, Location: ${address.location}` : "";
    const city = address.city?.name || "";
    const state = address.state?.name || "";
    const pincode = address.pincode || "";
    const country = address.country || "India";

    const parts = [line1, line2, city, state, pincode, country].filter(Boolean); // Remove empty strings

    return `${parts.join(", ")}${landmark}${location}`;
  }

  orders.forEach((order, index) => {
    const billingAddress = formatFullAddress(order.user?.billingAddress);
    const deliveryAddress = formatFullAddress(order.user?.deliveryAddress);

    worksheet.addRow({
      keyid: index + 1,
      userId: order?.user?.id,
      businessName: order?.user?.businessName,
      fullName: order?.user?.fullName,
      customerEmail: order?.user?.email,
      customerMobileNumber: order?.user?.phone,
      GstNumber: order?.user?.gstNumber,
      orderId: order?.id,
      subTotal: order?.subtotal,
      subTotalIncludingTax: order?.subTotalIncTax,
      tax: order?.taxAmount,
      Shipping: order?.shippingFee,
      orderAmount: order?.finalTotal,
      ReceiptNo: order?.recipientId,
      OrderStatus: order?.orderStatus,
      PaymentMode: order?.paymentMode,
      PaymentId: order?.paymentId,
      PaymentStatus: order?.paymentStatus,
      OrderOn: moment(order?.createdAt).format("YYYY-MM-DD HH:mm:ss"),
      LastUpdatedOn: moment(order?.updatedAt).format("YYYY-MM-DD HH:mm:ss"),
      BillingAddress: billingAddress,
      DeliveryAddress: deliveryAddress,
      TrackingId: order?.trackingId,
      TrackingLink: order?.trackingLink,
      transport_name: order?.transportName,
      eWayBillNo: order?.eWayBillNo,
      uploadlr: order?.uploadlr,
      RejectionGuid: order?.rejectionOrder?.id,
      ReturnGuid: order?.returnOrder?.id,
      RejectionStatus: order?.rejectionOrder?.orderStatus,
      ReturnStatus: order?.returnOrder?.returnStatus,
    });
  });

  const exportDir = path.join(__dirname, "..", "public", "exports");
  const fileName = `orders_${Date.now()}.xlsx`;
  const filePath = path.join(exportDir, fileName);

  // Ensure directory exists
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }
  // Write to file
  await workbook.xlsx.writeFile(filePath);

  const fileUrl = `${req.protocol}://${req.get("host")}/exports/${fileName}`;

  return {
    file: fileUrl,
    orders,
  };
};

module.exports = {
  createOrderService,
  fetchOrders,
  fetchAllOrders,
  fetchOrdersBySalePerson,
  getOrderByIdService,
  updateOrderStatusService,
  changeOrder,
  changePaymentStatus,
  UploadLr,
  fetchOrderExcelFileExport,
};
