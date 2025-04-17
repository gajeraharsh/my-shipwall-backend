const {
  createOrderRejectionService,
  createRefundForRejectionOrderService,
  fetchAllRejctionOrders,
  fetchRejectionOrders,
  getOrderRejectionByIdService,
  updateRejectionOrderStatusService,
  cancelRejectionOrderWebService,
} = require("../services/rejectionOrderService");

const { asyncHandler } = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");

const createRejectionOrder = asyncHandler(async (req, res) => {
  const userId = req.user._id; // Assuming `req.user._id` is populated via authentication middleware

  const order = await createOrderRejectionService(userId, req);
  res
    .status(201)
    .json(new ApiResponse(201, order, "Order rejection created successfully"));
});

const getRejectionOrders = asyncHandler(async (req, res) => {
  const order = await fetchRejectionOrders(req);
  res
    .status(201)
    .json(new ApiResponse(201, order, "Order rejection fetch successfully"));
});

const getAllRejectionOrders = asyncHandler(async (req, res) => {
  const order = await fetchAllRejctionOrders(req);
  res
    .status(201)
    .json(new ApiResponse(201, order, "Order rejection fetch successfully"));
});

const getRejectionOrderbyId = asyncHandler(async (req, res) => {
  // const userId = req.user._id;
  const orderId = req.params.orderId;

  const order = await getOrderRejectionByIdService(orderId);
  res
    .status(201)
    .json(new ApiResponse(201, order, "Order rejection fetch successfully"));
});

/**
 * Controller to update rejection order status and log activity
 * @route PATCH /api/rejection-orders/:orderId/status
 */
const updateRejectionOrderStatus = asyncHandler(async (req, res) => {
  const orderId = req.params.orderId;
  const { newStatus } = req.body;
  const changedBy = req.user._id; // assuming `req.user._id` is set via auth middleware

  const updatedOrder = await updateRejectionOrderStatusService(
    orderId,
    newStatus,
    changedBy
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedOrder,
        "Rejection order status updated successfully"
      )
    );
});

const orderRejectionApproveController = asyncHandler(async (req, res) => {
  const orderId = req.params.orderId;
  const { refundAmount } = req.body;
  const changedBy = req.user._id; // assuming `req.user._id` is set via auth middleware

  const updatedOrder = await createRefundForRejectionOrderService({
    orderId,
    refundAmount,
    initiatedBy: changedBy,
  });

  res
    .status(200)
    .json(
      new ApiResponse(200, updatedOrder, "Rejection Approved successfully.")
    );
});

const cancelRejectionOrderWebController = asyncHandler(async (req, res) => {
  const orderId = req.body.orderId;
  const changedBy = req.user._id;

  const order = await cancelRejectionOrderWebService(orderId, changedBy);
  res
    .status(201)
    .json(
      new ApiResponse(201, order, "Order rejection cancelled successfully")
    );
});

module.exports = {
  createRejectionOrder,
  getRejectionOrders,
  getAllRejectionOrders,
  getRejectionOrderbyId,
  orderRejectionApproveController,
  updateRejectionOrderStatus,
  cancelRejectionOrderWebController,
};
