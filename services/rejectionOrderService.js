// @ts-nocheck
const RejctionCart = require("../models/RejctionCart");
const RejectionOrder = require("../models/RejectionOrder");
const Product = require("../models/Product");
const ApiError = require("../utils/apiError");
const { status: httpStatus } = require("http-status");

const mongoose = require("mongoose");
const moment = require("moment");
const { uploadFileToS3 } = require("./fileUploads3Service");
const Refund = require("../models/Refund");
const User = require("../models/User");

// Express types like Request are only relevant in TypeScript and are not needed in CommonJS

const createOrderRejectionService = async (userId, req) => {
  const cart = await RejctionCart.findOne({ user: userId }).populate(
    "products.product"
  );

  if (!cart || cart.products.length === 0) {
    throw new ApiError(
      400,
      "Your Rejection Order List is empty. Cannot Place An Rejection Order."
    );
  }

  const lastOrder = await RejectionOrder.findOne().sort({
    rejectionOrderId: -1,
  });
  const newOrderNumber = lastOrder ? lastOrder.rejectionOrderId + 1 : 1;

  // Validate stock availability
  // for (const item of cart.products) {
  //     if (item.quantity > item.product.stock) {
  //         throw new ApiError(400, `Insufficient stock for ${item.product.productName}`);
  //     }
  // }

  const file = req.file;
  const reason = req?.body?.reason;

  if (!file || !reason) {
    throw new ApiError(400, "Invalid input");
    return;
  }

  let issueImageUrl = null;

  if (file) {
    issueImageUrl = await uploadFileToS3(file, req.body.user?._id);
  }

  const newOrder = new RejectionOrder({
    user: userId,
    rejectionOrderId: newOrderNumber,
    products: cart.products.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
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
    issueImage: issueImageUrl,
    reason: reason,
    orderStatus: "Initiated",
  });

  newOrder.activities.push({
    status: "Initiated",
    note: "Rejection Initiated For Select Rejection Type",
    timestamp: new Date(),
  });

  await newOrder.save();

  // for (const item of cart.products) {
  //     const productCurrentStock = parseInt(item?.product?.stock)
  //     await Product.findByIdAndUpdate(item.product._id, { stock: productCurrentStock - item.quantity });
  // }

  cart.products = [];
  cart.totalAmount = 0;
  cart.subtotal = 0;
  cart.shippingFee = 0;
  cart.subTotalIncTax = 0;
  cart.taxAmount = 0;
  await cart.save();

  return newOrder;
};

const fetchRejectionOrders = async (req) => {
  try {
    const page = req?.query?.page;
    const limit = req?.query?.limit;
    const query = req?.query?.search || "";

    const orders = await RejectionOrder.paginate(
      {
        orderStatus: { $regex: query, $options: "i" },
        user: req?.user?._id,
      },
      {
        page,
        limit,
        sortBy: "createdAt:desc",
      }
    );

    if (!orders || orders.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, "No orders found");
    }

    return orders;
  } catch (err) {
    console.log(err);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error retrieving orders"
    );
  }
};

const fetchAllRejctionOrders = async (req) => {
  try {
    const page = parseInt(req?.query?.page) || 1;
    const limit = parseInt(req?.query?.limit) || 10;
    const skip = (page - 1) * limit;

    const {
      search = "",
      orderStatus = "",
      startDate,
      endDate,
      days,
    } = req.query;

    const matchStage = {};

    // Order Status logic
    if (orderStatus) {
      matchStage.orderStatus = { $regex: orderStatus, $options: "i" };
    }

    // Date filtering for 'days'
    if (days) {
      const today = new Date();
      let startDateForFilter = new Date(today.setHours(0, 0, 0, 0)); // Start of today

      if (parseInt(days) === 0) {
        const endOfToday = new Date(startDateForFilter);
        endOfToday.setHours(23, 59, 59, 999);
        matchStage.createdAt = { $gte: startDateForFilter, $lte: endOfToday };
      } else if (parseInt(days) === 1) {
        startDateForFilter.setDate(today.getDate() - 1);
        const endOfYesterday = new Date(startDateForFilter);
        endOfYesterday.setHours(23, 59, 59, 999);
        matchStage.createdAt = {
          $gte: startDateForFilter,
          $lte: endOfYesterday,
        };
      } else {
        startDateForFilter.setDate(today.getDate() - parseInt(days));
        matchStage.createdAt = { $gte: startDateForFilter, $lte: new Date() };
      }
    } else if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      matchStage.createdAt = { $gte: new Date(startDate) };
    } else if (endDate) {
      matchStage.createdAt = { $lte: new Date(endDate) };
    }

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { id: { $regex: search, $options: "i" } },
            { "user.fullName": { $regex: search, $options: "i" } },
            { "user.phone": { $regex: search, $options: "i" } },
            { "user.id": { $regex: search, $options: "i" } },
          ],
        },
      });
    }

    // Count total documents
    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await RejectionOrder.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    // Paginate and sort
    pipeline.push(
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          id: 1,
          orderStatus: 1,
          createdAt: 1,
          user: {
            _id: 1,
            id: 1, // Include the `id` from `user`
            fullName: 1,
            phone: 1,
          },
        },
      }
    );

    const docs = await RejectionOrder.aggregate(pipeline);

    return {
      docs,
      totalDocs: total,
      limit,
      page,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    };
  } catch (err) {
    console.error(err);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error retrieving orders"
    );
  }
};

const fetchRejectionOrderById = async (orderId) => {
  try {
    const order = await RejectionOrder.findById(orderId)
      .populate({
        path: "products.product",
        model: "Product",
        select: "productName modelNo color watt price boxQuantity",
        populate: {
          path: "color",
          model: "ColorMaster",
          select: "colorName",
        },
      })
      .populate({
        path: "user",
        select: "fullName email phone id",
      });

    const refundOrder = await Refund.find({
      rejectionOrder: orderId,
    }).populate({
      path: "user",
      select: "id _id ",
    });

    const orderObj = await order?.toObject();
    orderObj.refund = refundOrder;

    if (!orderObj) {
      throw new ApiError(httpStatus.NOT_FOUND, "Rejection order not found");
    }

    return orderObj;
  } catch (err) {
    console.error(err);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error retrieving rejection order"
    );
  }
};

const getOrderRejectionByIdService = async (orderId) => {
  try {
    const order = await RejectionOrder.findOne({ _id: orderId })
      .populate({
        path: "products.product",
        model: "Product",
        select:
          "productName modelNo color watt price boxQuantity productThumbImageUrl productThumbImage bodyColor",
        populate: {
          path: "color",
          model: "ColorMaster",
          select: "colorName",
        },
      })
      .populate({
        path: "user",
        select:
          "fullName email phone  id _id businessName phone email gstNumber profileImage",
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
        path: "activities.updatedBy",
        model: "User",
        select: "fullName _id id profileImage profileImageUrl",
      });

    const refundOrder = await Refund.find({
      rejectionOrder: orderId,
    }).populate({
      path: "user",
      select: "id _id ",
    });

    const orderObj = await order?.toObject();
    orderObj.refund = refundOrder;

    if (!orderObj) {
      throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
    }

    return orderObj;
  } catch (err) {
    console.log(err);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error retrieving order details"
    );
  }
};

const updateRejectionActivityById = async (
  orderId,
  note,
  status,
  changedBy
) => {
  try {
    const res = await RejectionOrder.findByIdAndUpdate(orderId, {
      $set: { orderStatus: newStatus },
      $push: {
        activities: {
          status: status,
          updatedBy: changedBy,
          note: note, // optional
        },
      },
    });

    if (!res)
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Something went wrong please try again"
      );
    return res;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error updating rejection order activities"
    );
  }
};

/**
 * Updates the order status and logs the activity with predefined note
 * @param orderId - ID of the rejection order
 * @param newStatus - New status to set (must be a valid status)
 * @param changedBy - ID of the user who made the change
 */
const updateRejectionOrderStatusService = async (
  orderId,
  newStatus,
  changedBy
) => {
  const order = await RejectionOrder.findById(orderId);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, "Rejection Order not found");
  }

  const validStatuses = [
    "Initiated",
    "Pickup_Schedule",
    "PickedUp",
    "Received",
    "Mismatch_Correction",
    "Validated",
    "Cancelled",
  ];

  if (!validStatuses.includes(newStatus)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid order status");
  }

  if (order?.orderStatus == "Cancelled") {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "status is cancelled you can not change status."
    );
  }

  if (order?.orderStatus == "Approved_Credited") {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "status is approvved you can not change status."
    );
  }

  const statusNotes = {
    Initiated: "Rejection order has been initiated.",
    Pickup_Schedule: "Pickup has been scheduled.",
    PickedUp: "Rejection items have been picked up.",
    Received: "Rejection items have been received at warehouse.",
    Mismatch_Correction: "Mismatch identified, correction in progress.",
    Validated: "Rejection order has been validated.",
    Cancelled: "Rejection order is cancelled.",
  };

  const note = statusNotes[newStatus] || "";

  // Update status and log activity
  order.orderStatus = newStatus;

  if (!order.activities) order.activities = [];

  order.activities.push({
    status: newStatus,
    updatedBy: changedBy,
    note,
    timestamp: new Date(),
  });

  await order.save();

  return order;
};

const createRefundForRejectionOrderService = async ({
  orderId,
  refundAmount,
  note,
  initiatedBy,
}) => {
  const rejectionOrder = await RejectionOrder.findById(orderId);
  if (!rejectionOrder) {
    throw new ApiError(httpStatus.NOT_FOUND, "Rejection order not found");
  }

  if (rejectionOrder?.orderStatus == "Cancelled") {
    throw new ApiError(httpStatus.BAD_REQUEST, "Rejection order is cancelled");
    return;
  }

  const existingRefund = await Refund.findOne({
    rejectionOrder: orderId,
    sourceType: "RejectionOrder",
  });

  if (existingRefund) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Refund already initiated for this rejection order"
    );
  }

  const refund = await Refund.create({
    rejectionOrder: orderId,
    user: rejectionOrder.user,
    amount: refundAmount,
    sourceType: "RejectionOrder",
    status: "Initiated",
    note: note || "Manual refund initiated",
    initiatedBy,
  });

  const user = await User.findByIdAndUpdate(
    rejectionOrder.user,
    {
      $inc: {
        balance: Number(refundAmount), // Assumes `balance` is a numeric field in the User schema
      },
    },
    { new: true } // to return the updated user document if needed
  );

  rejectionOrder.orderStatus = "Approved_Credited";
  rejectionOrder.activities.push({
    status: "Approved_Credited",
    updatedBy: initiatedBy,
    note: "Rejection order approved and credit issued",
    timestamp: new Date(),
  });

  await rejectionOrder.save();

  return refund;
};

module.exports = {
  createOrderRejectionService,
  fetchRejectionOrders,
  fetchAllRejctionOrders,
  fetchRejectionOrderById,
  getOrderRejectionByIdService,
  updateRejectionActivityById,
  updateRejectionOrderStatusService,
  createRefundForRejectionOrderService,
};
