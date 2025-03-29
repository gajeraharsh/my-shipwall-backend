import { Request, Response } from "express";
import { changeOrder, changePaymentStatus, createOrderService, fetchOrders, fetchOrdersBySalePerson, getOrderByIdService, updateOrderStatusService, UploadLr } from "../services/orderService";
import { asyncHandler } from "../utils/asyncHandler";
import ApiResponse from "../utils/apiResponse";

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user._id; // Assuming `req.user._id` is populated via authentication middleware

    const order = await createOrderService(userId);
    res.status(201).json(new ApiResponse(201, order, "Order created successfully"));
});


export const getOrders = asyncHandler(async (req: Request, res: Response) => {
    const order = await fetchOrders(req);
    res.status(201).json(new ApiResponse(201, order, "Order fetch successfully"));
});

export const getOrderBySalePerson = asyncHandler(async (req: Request, res: Response) => {
    const order = await fetchOrdersBySalePerson(req);
    res.status(201).json(new ApiResponse(201, order, "Order fetch successfully"));
});


export const getOrderbyId = asyncHandler(async (req: Request, res: Response) => {
    // const userId = req.user._id;
    const orderId = req.params.orderId;

    const order = await getOrderByIdService(orderId);
    res.status(201).json(new ApiResponse(201, order, "Order fetch successfully"));
});


export const updateOrderStatusController = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user._id;
    const status = req.body?.status
    const orderId = req.params?.orderId

    const order = await updateOrderStatusService(orderId, status, userId);
    res.status(201).json(new ApiResponse(201, order, "Order status successfully changed."));
});


export const changeOrderController = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user._id;
    const orderId = req.params?.orderId

    const order = await changeOrder(orderId, req?.body, userId);
    res.status(201).json(new ApiResponse(201, order, "Order changed successfully"));
});


export const chanegPaymentStatusController = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user._id;
    const orderId = req.params?.orderId


    const order = await changePaymentStatus(orderId, req?.body, userId);
    res.status(201).json(new ApiResponse(201, order, "Order payment changed successfully"));
});


export const UploadLrController = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user._id;
    const orderId = req.params?.orderId

    const file = req.file as Express.Multer.File | undefined;

    const order = await UploadLr(orderId, file, userId);
    res.status(201).json(new ApiResponse(201, order, "Order payment changed successfully"));
});