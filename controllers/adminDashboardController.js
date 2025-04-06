const ApiResponse = require("../utils/apiResponse");
const { asyncHandler } = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");
const Order = require("../models/Order");
const Product = require("../models/Product");
const ContactUs = require("../models/ContactUs");
const Support = require("../models/Support");
const ReturnOrder = require("../models/ReturnOrder");
const RejectionOrder = require("../models/RejectionOrder");

const calculateTotalSales = async () => {
  try {
    const result = await Order.aggregate([
      {
        $match: {
          orderStatus: "delevered", // correct spelling
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$finalTotal" },
        },
      },
    ]);

    return result[0]?.totalSales || 0;
  } catch (error) {
    console.error("Error calculating total sales:", error);
    throw error;
  }
};

const getDashboardMetrics = asyncHandler(async (req, res) => {
  try {
    const [
      totalSales,
      totalProducts,
      totalOrders,
      totalEnquirys,
      totalSupports,
      totalReturnOrder,
      totalRejectionOrder,
    ] = await Promise.all([
      calculateTotalSales(),
      Product.countDocuments(),
      Order.countDocuments(),
      ContactUs.countDocuments(),
      Support.countDocuments(),
      ReturnOrder.countDocuments(),
      RejectionOrder.countDocuments(),
    ]);

    const dashboardData = {
      totalSales,
      totalProducts,
      totalOrders,
      totalEnquirys,
      totalSupports,
      totalReturnOrder,
      totalRejectionOrder,
    };

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          dashboardData,
          "Dashboard metrics retrieved successfully"
        )
      );
  } catch (err) {
    throw new ApiError(
      500,
      err.message || "Could not retrieve dashboard metrics"
    );
  }
});

module.exports = {
  getDashboardMetrics,
};
