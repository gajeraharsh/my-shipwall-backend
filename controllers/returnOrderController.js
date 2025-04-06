const { asyncHandler } = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");

const {
  createOrderReturnService,
  createReturnForRejectionOrderService,
  fetchAllReturnOrders,
  fetchReturnOrderById,
  fetchReturnOrders,
  getOrderReturnByIdService,
  updateReturnActivityById,
  updateReturnOrderStatusService,
} = require("../services/returnOrderService");

const createReturnOrder = asyncHandler(async (req, res) => {
  const userId = req.user._id; // Assuming `req.user._id` is populated via authentication middleware

  const order = await createOrderReturnService(userId, req);
  res
    .status(201)
    .json(new ApiResponse(201, order, "Order return created successfully"));
});

const getReturnOrders = asyncHandler(async (req, res) => {
  const order = await fetchReturnOrders(req);
  res
    .status(201)
    .json(new ApiResponse(201, order, "Order return fetch successfully"));
});

const getAllReturnOrders = asyncHandler(async (req, res) => {
  const order = await fetchAllReturnOrders(req);
  res
    .status(201)
    .json(new ApiResponse(201, order, "Order return fetch successfully"));
});

const getReturnOrderbyId = asyncHandler(async (req, res) => {
  // const userId = req.user._id;
  const orderId = req.params.orderId;

  const order = await getOrderReturnByIdService(orderId);
  res
    .status(201)
    .json(new ApiResponse(201, order, "Order return fetch successfully"));
});

/**
 * Controller to update rejection order status and log activity
 * @route PATCH /api/rejection-orders/:orderId/status
 */
const updateReturnOrderStatus = asyncHandler(async (req, res) => {
  const orderId = req.params.orderId;
  const { newStatus } = req.body;
  const changedBy = req.user._id; // assuming `req.user._id` is set via auth middleware

  const updatedOrder = await updateReturnOrderStatusService(
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
        "return order status updated successfully"
      )
    );
});

const orderReturnApproveController = asyncHandler(async (req, res) => {
  const orderId = req.params.orderId;
  const { refundAmount } = req.body;
  const changedBy = req.user._id; // assuming `req.user._id` is set via auth middleware

  const updatedOrder = await createReturnForRejectionOrderService({
    orderId,
    refundAmount,
    initiatedBy: changedBy,
  });

  res
    .status(200)
    .json(new ApiResponse(200, updatedOrder, "return Approved successfully."));
});

module.exports = {
  createReturnOrder,
  getReturnOrders,
  getAllReturnOrders,
  getReturnOrderbyId,
  updateReturnOrderStatus,
  orderReturnApproveController,
};
