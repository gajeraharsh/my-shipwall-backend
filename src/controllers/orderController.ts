import { Request, Response } from "express";
import { createOrderService, fetchOrders, getOrderByIdService } from "../services/orderService";
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

export const getOrderbyId = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user._id;
    const orderId = req.params.orderId;

    const order = await getOrderByIdService(userId, orderId);
    res.status(201).json(new ApiResponse(201, order, "Order fetch successfully"));
});
