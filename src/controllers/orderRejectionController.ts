import { Request, Response } from "express";
import {
    createOrderRejectionService, fetchAllRejctionOrders, fetchRejectionOrders,
    getOrderRejectionByIdService
} from "../services/rejectionOrderService";
import { asyncHandler } from "../utils/asyncHandler";
import ApiResponse from "../utils/apiResponse";

export const createRejectionOrder = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user._id; // Assuming `req.user._id` is populated via authentication middleware

    const order = await createOrderRejectionService(userId, req);
    res.status(201).json(new ApiResponse(201, order, "Order rejection created successfully"));
});


export const getRejectionOrders = asyncHandler(async (req: Request, res: Response) => {
    const order = await fetchRejectionOrders(req);
    res.status(201).json(new ApiResponse(201, order, "Order rejection fetch successfully"));
});


export const getAllRejectionOrders = asyncHandler(async (req: Request, res: Response) => {
    const order = await fetchAllRejctionOrders(req);
    res.status(201).json(new ApiResponse(201, order, "Order rejection fetch successfully"));
});



export const getRejectionOrderbyId = asyncHandler(async (req: Request, res: Response) => {
    // const userId = req.user._id;
    const orderId = req.params.orderId;

    const order = await getOrderRejectionByIdService(orderId);
    res.status(201).json(new ApiResponse(201, order, "Order rejection fetch successfully"));
});