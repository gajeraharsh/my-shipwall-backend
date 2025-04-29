const RewardOrder = require("../models/rewardOrder");
const RewardCart = require("../models/rewardCart");
const Product = require("../models/Product");
const ApiError = require("../utils/apiError");
const { status: httpStatus } = require("http-status");

const mongoose = require("mongoose");
const moment = require("moment");
const GeneralSettingModel = require("../models/generalSetting");
const { uploadFileToS3 } = require("./fileUploads3Service");
const rewardOrder = require("../models/rewardOrder");
const RewardProducts = require("../models/RewardProducts");
const User = require("../models/User");

const createRewardOrderService = async (userId, user) => {
  const cart = await RewardCart.findOne({ user: userId }).populate(
    "products.product"
  );

  if (user?.rewards < cart.totalAmount) {
    throw new ApiError(400, "Insufficient rewards to place the order.");
  }

  if (!cart || cart.products.length === 0) {
    throw new ApiError(400, "Cart is empty. Cannot place an order.");
  }

  // Validate stock availability
  for (const item of cart.products) {
    if (item.quantity > item.product.stock) {
      throw new ApiError(
        400,
        `Insufficient stock for ${item.product.productName}`
      );
    }
  }

  console.log(cart.shippingDetails, "cart.shippingDetails");

  const newOrder = new RewardOrder({
    user: userId,
    products: cart.products.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.subtotal,
    })),
    finalTotal: cart.totalAmount,
    subtotal: cart.subtotal,
    shippingFee: cart.shippingFee,
    shippingDetails: cart.shippingDetails,
    orderStatus: "initiated",
    paymentStatus: "Awaiting Payment",
  });

  await newOrder.save();

  for (const item of cart.products) {
    const productCurrentStock = parseInt(item?.product?.stock);
    await RewardProducts.findByIdAndUpdate(item.product._id, {
      stock: productCurrentStock - item.quantity,
    });
  }

  await User.findByIdAndUpdate(
    userId,
    {
      $inc: {
        rewards: -Number(cart?.totalAmount), // Decrement the rewards by rewardCount
      },
    },
    { new: true }
  );

  cart.products = [];
  cart.totalAmount = 0;
  cart.subtotal = 0;
  cart.shippingFee = 0;
  cart.subTotalIncTax = 0;
  cart.taxAmount = 0;
  cart.shippingDetails = {
    line1: "",
    line2: "",
    pincode: "",
    state: null,
    city: null,
    country: "",
    landmark: "",
  };
  await cart.save();

  return newOrder;
};

const fetchRewardOrders = async (req) => {
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
    const orders = await RewardOrder.paginate(query, {
      page,
      limit,
      populate: [
        {
          path: "user",
          select: "fullName id phone email",
        },
        { path: "shippingDetails.city", select: "name _id" },
        { path: "shippingDetails.state", select: "name _id" },
        { path: "products.product", select: "name _id" },

      ],
      sortBy: "createdAt:desc",
    });

    return orders;
  } catch (err) {
    console.error(err);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error retrieving reward orders"
    );
  }
};

const updateRewardOrderStatusService = async (
  orderId,
  newStatus,
  changedBy
) => {
  const order = await RewardOrder.findById(orderId).populate({
    path: "user",
    select: "_id id",
  });
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
  }

  const validStatuses = [
    "initiated",
    "Received",
    "Cancelled",
    "packing",
    "dispatch",
    "InLogistic",
    "delevered",
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

  await order.save();

  return order;
};

const getRewardOrderByIdService = async (orderId) => {
  try {
    const order = await RewardOrder.findOne({ _id: orderId })
      .populate({
        path: "products.product",
        model: "RewardProduct", // or "RewardProduct" if needed
        select: "name id status price description thumbImage",
      })
      .populate({
        path: "user",
        select:
          "fullName email phone billingAddress deliveryAddress id _id businessName phone email gstNumber",
      })
      .populate({
        path: "shippingDetails.state",
        model: "State",
        select: "name", // or whatever fields you want from State
      })
      .populate({
        path: "shippingDetails.city",
        model: "City",
        select: "name", // or whatever fields you want from City
      });

    if (!order) {
      throw new ApiError(httpStatus.NOT_FOUND, "Reward order not found");
    }

    return order;
  } catch (err) {
    console.log(err);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error retrieving reward order details"
    );
  }
};

module.exports = {
  createRewardOrderService,
  fetchRewardOrders,
  updateRewardOrderStatusService,
  getRewardOrderByIdService,
};
