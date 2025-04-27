const {
  createRewardOrderService,
  fetchRewardOrders,
  updateRewardOrderStatusService,
} = require("../services/rewardOrderService");

const { asyncHandler } = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");

const createRewardOrder = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const order = await createRewardOrderService(userId, req.user);
  res
    .status(201)
    .json(new ApiResponse(201, order, "Order created successfully"));
});

const getRewardOrders = asyncHandler(async (req, res) => {
  const order = await fetchRewardOrders(req);
  res.status(201).json(new ApiResponse(201, order, "Order fetch successfully"));
});

const updateRewardOrderStatusController = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const status = req.body?.status;
  const orderId = req.params?.orderId;

  const order = await updateRewardOrderStatusService(orderId, status, userId);
  res
    .status(201)
    .json(new ApiResponse(201, order, "Order status successfully changed."));
});

module.exports = {
  createRewardOrder,
  getRewardOrders,
  updateRewardOrderStatusController,
};
