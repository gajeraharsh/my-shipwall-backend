// @ts-nocheck
const RejectionOrder = require("../models/RejectionOrder");
const Product = require("../models/Product");
const ApiError = require("../utils/apiError");
const { status: httpStatus } = require("http-status");

const mongoose = require("mongoose");
const moment = require("moment");
const { uploadFileToS3 } = require("./fileUploads3Service");
const Refund = require("../models/Refund");
const ReturnOrder = require("../models/ReturnOrder");
const ReturnCart = require("../models/ReturnCart");
const User = require("../models/User");
const CustomerWalletCredit = require("../models/CustomerWalletCredit");

// Express types like Request are only relevant in TypeScript and are not needed in CommonJS

const createOrderReturnService = async (userId, req) => {
  const cart = await ReturnCart.findOne({
    user: userId,
    order: req?.body?.orderId,
  }).populate("products.product");

  if (!cart || cart.products.length === 0) {
    throw new ApiError(
      400,
      "Your Return Order List is empty. Cannot Place An Rejection Order."
    );
  }

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

  const newOrder = new ReturnOrder({
    user: userId,
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
    issueImage: issueImageUrl,
    reason: reason,
    returnStatus: "Initiated",
    order: cart?.order,
  });

  newOrder.activities.push({
    status: "Initiated",
    note: "Return order Initiated",
    timestamp: new Date(),
    updatedBy: userId,
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
  cart.order = null;
  await cart.save();

  return newOrder;
};

const fetchReturnOrders = async (req) => {
  try {
    const page = req?.query?.page;
    const limit = req?.query?.limit;
    const query = req?.query?.search || "";

    const orders = await ReturnOrder.paginate(
      {
        returnStatus: { $regex: query, $options: "i" },
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

const fetchAllReturnOrders = async (req) => {
  try {
    const page = parseInt(req?.query?.page) || 1;
    const limit = parseInt(req?.query?.limit) || 10;
    const skip = (page - 1) * limit;
    const sortField = req?.query?.sortField || "createdAt";
    const sortOrder = req?.query?.sortOrder === "desc" ? -1 : -1;

    const {
      search = "",
      returnStatus = "",
      startDate,
      endDate,
      days,
    } = req.query;

    const matchStage = {};

    // Exact return status match
    if (returnStatus) {
      matchStage.returnStatus = returnStatus;
    }

    if (days) {
      const today = new Date();
      let startDateForFilter = new Date(today.setHours(0, 0, 0, 0)); // Start of today

      if (parseInt(days) === 0) {
        // Today only
        const endOfToday = new Date(startDateForFilter);
        endOfToday.setHours(23, 59, 59, 999);
        matchStage.createdAt = { $gte: startDateForFilter, $lte: endOfToday };
      } else if (parseInt(days) === 1) {
        // Yesterday only
        startDateForFilter.setDate(today.getDate() - 1);
        const endOfYesterday = new Date(startDateForFilter);
        endOfYesterday.setHours(23, 59, 59, 999);
        matchStage.createdAt = {
          $gte: startDateForFilter,
          $lte: endOfYesterday,
        };
      } else {
        // Last 'n' days
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

    const sortFieldMap = {
      fullName: "user.fullName",
      phone: "user.phone",
      userId: "user.id",
      createdAt: "createdAt",
      returnStatus: "returnStatus",
      // Add any new sort fields here
    };

    const resolvedSortField = sortFieldMap[sortField] || sortField;
    const sortOptions = { [resolvedSortField]: sortOrder };
    console.log(sortOptions, "sortOptions");
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

    // Search logic
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
    const countResult = await ReturnOrder.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    // Paginate and sort
    pipeline.push(
      { $sort: sortOptions },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          id: 1,
          returnStatus: 1,
          createdAt: 1,
          updatedAt: 1,
          user: {
            _id: 1,
            id: 1, // Include the `id` from `user`
            fullName: 1,
            phone: 1,
          },
        },
      }
    );

    const docs = await ReturnOrder.aggregate(pipeline);

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

const fetchReturnOrderById = async (orderId) => {
  try {
    const order = await ReturnOrder.findById(orderId)
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
      returnOrder: orderId,
    });

    const orderObj = await order?.toObject();
    order.refund = refundOrder;

    if (!order) {
      throw new ApiError(httpStatus.NOT_FOUND, "Return order not found");
    }

    return order;
  } catch (err) {
    console.error(err);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error retrieving return order"
    );
  }
};

const getOrderReturnByIdService = async (orderId) => {
  try {
    const order = await ReturnOrder.findOne({ _id: orderId })
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
          "fullName email phone  id _id businessName phone email gstNumber profileImage stock",
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
      })
      .populate({
        path: "order",
        select: "_id id",
      });

    const refundOrder = await Refund.find({
      returnOrder: orderId,
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

const updateReturnActivityById = async (orderId, note, status, changedBy) => {
  try {
    const res = await ReturnOrder.findByIdAndUpdate(orderId, {
      $set: { ordreturnStatuserStatus: newStatus },
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
      "Error updating return order activities"
    );
  }
};

/**
 * Updates the order status and logs the activity with predefined note
 * @param orderId - ID of the rejection order
 * @param newStatus - New status to set (must be a valid status)
 * @param changedBy - ID of the user who made the change
 */
const updateReturnOrderStatusService = async (
  orderId,
  newStatus,
  changedBy
) => {
  const order = await ReturnOrder.findById(orderId);
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

  if (order?.returnStatus == "Cancelled") {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "status is cancelled you can not change status."
    );
  }

  console.log(order?.returnStatus, "order?.returnStatus");
  if (order?.returnStatus == "Approved_Credited") {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "status is approvved you can not change status."
    );
  }

  const statusNotes = {
    Initiated: "Return order has been initiated.",
    Pickup_Schedule: "Return has been scheduled.",
    PickedUp: "Return items have been picked up.",
    Received: "Return items have been received at warehouse.",
    Mismatch_Correction: "Mismatch identified, correction in progress.",
    Validated: "Return order has been validated.",
    Cancelled: "Rejection order is cancelled.",
  };

  const note = statusNotes[newStatus] || "";

  // Update status and log activity
  order.returnStatus = newStatus;

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

const createReturnForRejectionOrderService = async ({
  orderId,
  refundAmount,
  note,
  initiatedBy,
}) => {
  const returnOrder = await ReturnOrder.findById(orderId);
  if (!returnOrder) {
    throw new ApiError(httpStatus.NOT_FOUND, "Return order not found");
  }

  if (returnOrder?.returnStatus == "Cancelled") {
    throw new ApiError(httpStatus.BAD_REQUEST, "Return order is cancelled");
    return;
  }

  const existingRefund = await Refund.findOne({
    returnOrder: orderId,
    sourceType: "Order",
  });

  if (existingRefund) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Refund already initiated for this return order"
    );
  }

  const refund = await Refund.create({
    returnOrder: orderId,
    user: returnOrder.user,
    amount: refundAmount,
    sourceType: "Order",
    status: "Initiated",
    note: note || "Manual refund initiated",
    initiatedBy,
  });

  const user = await User.findByIdAndUpdate(
    returnOrder.user,
    {
      $inc: {
        balance: Number(refundAmount), // Assumes `balance` is a numeric field in the User schema
      },
    },
    { new: true } // to return the updated user document if needed
  );

  returnOrder.returnStatus = "Approved_Credited";
  returnOrder.activities.push({
    status: "Approved_Credited",
    updatedBy: initiatedBy,
    note: "Return order approved and credit issued",
    timestamp: new Date(),
  });

  await CustomerWalletCredit.create({
    amount: refundAmount,
    type: "credit",
    description: `Refund for return order ${returnOrder._id}`,
    referenceId: returnOrder._id,
    referenceModel: "ReturnOrder",
    user: returnOrder.user,
  });

  await returnOrder.save();

  return refund;
};

const cancelReturnOrderService = async (orderId, changedBy) => {
  const order = await ReturnOrder.findById(orderId);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, "Return Order not found");
  }

  if (order?.returnStatus == "Cancelled") {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "status is cancelled you can not change status."
    );
  }

  if (order?.returnStatus == "Approved_Credited") {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "status is approvved you can not change status."
    );
  }

  const statusNotes = {
    Cancelled: "Rejection order is cancelled.",
  };

  const note = statusNotes["Cancelled"] || "";

  // Update status and log activity
  order.returnStatus = "Cancelled";

  if (!order.activities) order.activities = [];

  order.activities.push({
    status: "Cancelled",
    updatedBy: changedBy,
    note,
    timestamp: new Date(),
  });

  await order.save();

  return order;
};

module.exports = {
  createOrderReturnService,
  fetchReturnOrders,
  fetchAllReturnOrders,
  fetchReturnOrderById,
  getOrderReturnByIdService,
  updateReturnActivityById,
  updateReturnOrderStatusService,
  createReturnForRejectionOrderService,
  cancelReturnOrderService,
};
