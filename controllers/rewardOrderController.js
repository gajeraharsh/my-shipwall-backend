const {
  createRewardOrderService,
  fetchRewardOrders,
  updateRewardOrderStatusService,
  getRewardOrderByIdService,
  UploadLr,
  changeOrder,
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
  const orders = await fetchRewardOrders(req);
  res.status(201).json(
    new ApiResponse(
      201,
      {
        orders,
      },
      "Order fetch successfully"
    )
  );
});

const getRewardOrderById = asyncHandler(async (req, res) => {
  const orderId = req?.params?.id;

  const order = await getRewardOrderByIdService(orderId);
  res.status(201).json(
    new ApiResponse(
      201,
      {
        order,
      },
      "Reward order fetch successfully"
    )
  );
});

const updateRewardOrderStatusController = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const status = req.body?.status;
  const orderId = req.params?.id;

  const order = await updateRewardOrderStatusService(orderId, status, userId);
  res
    .status(201)
    .json(new ApiResponse(201, order, "Order status successfully changed."));
});

const changeOrderController = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const orderId = req.params?.orderId;

  const order = await changeOrder(orderId, req?.body, userId);
  res
    .status(201)
    .json(new ApiResponse(201, order, "Reward order changed successfully"));
});

const UploadLrController = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const orderId = req.params?.orderId;

  const file = req.file;

  const order = await UploadLr(orderId, file, userId);
  res
    .status(201)
    .json(
      new ApiResponse(201, order, "Reward order payment changed successfully")
    );
});

module.exports = {
  createRewardOrder,
  getRewardOrders,
  updateRewardOrderStatusController,
  getRewardOrderById,
  changeOrderController,
  UploadLrController,
};
