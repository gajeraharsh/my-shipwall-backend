const {
  changeOrder,
  changePaymentStatus,
  createOrderService,
  fetchAllOrders,
  fetchOrders,
  fetchOrdersBySalePerson,
  getOrderByIdService,
  updateOrderStatusService,
  UploadLr,
  fetchOrderExcelFileExport,
} = require("../services/orderService");

const { asyncHandler } = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");

const createOrder = asyncHandler(async (req, res) => {
  const userId = req.user._id; // Assuming `req.user._id` is populated via authentication middleware

  const order = await createOrderService(userId);
  res
    .status(201)
    .json(new ApiResponse(201, order, "Order created successfully"));
});

const getOrders = asyncHandler(async (req, res) => {
  const order = await fetchOrders(req);
  res.status(201).json(new ApiResponse(201, order, "Order fetch successfully"));
});

const getAllOrders = asyncHandler(async (req, res) => {
  const order = await fetchAllOrders(req);
  res.status(201).json(new ApiResponse(201, order, "Order fetch successfully"));
});

const getOrderBySalePerson = asyncHandler(async (req, res) => {
  const order = await fetchOrdersBySalePerson(req);
  res.status(201).json(new ApiResponse(201, order, "Order fetch successfully"));
});

const getOrderbyId = asyncHandler(async (req, res) => {
  // const userId = req.user._id;
  const orderId = req.params.orderId;

  const order = await getOrderByIdService(orderId);
  res.status(201).json(new ApiResponse(201, order, "Order fetch successfully"));
});

const updateOrderStatusController = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const status = req.body?.status;
  const orderId = req.params?.orderId;

  const order = await updateOrderStatusService(orderId, status, userId);
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
    .json(new ApiResponse(201, order, "Order changed successfully"));
});

const chanegPaymentStatusController = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const orderId = req.params?.orderId;

  const order = await changePaymentStatus(orderId, req?.body, userId);
  res
    .status(201)
    .json(new ApiResponse(201, order, "Order payment changed successfully"));
});

const UploadLrController = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const orderId = req.params?.orderId;

  const file = req.file;

  const order = await UploadLr(orderId, file, userId);
  res
    .status(201)
    .json(new ApiResponse(201, order, "Order payment changed successfully"));
});

const exportAllOrderExcel = asyncHandler(async (req, res) => {
  const order = await fetchOrderExcelFileExport(req);
  res.status(201).json(new ApiResponse(201, order, "order exported successfully"));
});


module.exports = {
  createOrder,
  getOrders,
  getAllOrders,
  getOrderBySalePerson,
  getOrderbyId,
  updateOrderStatusController,
  changeOrderController,
  chanegPaymentStatusController,
  UploadLrController,
  exportAllOrderExcel
};
