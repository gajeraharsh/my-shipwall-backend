import { Request, Response } from "express";
import {
    createOrderRejectionService, createRefundForRejectionOrderService, fetchAllRejctionOrders, fetchRejectionOrders,
    getOrderRejectionByIdService,
    updateRejectionOrderStatusService
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

/**
 * Controller to update rejection order status and log activity
 * @route PATCH /api/rejection-orders/:orderId/status
 */
export const updateRejectionOrderStatus = asyncHandler(async (req: Request, res: Response) => {
    const orderId = req.params.orderId;
    const { newStatus } = req.body;
    const changedBy = req.user._id; // assuming `req.user._id` is set via auth middleware

    const updatedOrder = await updateRejectionOrderStatusService(orderId, newStatus, changedBy);

    res.status(200).json(new ApiResponse(200, updatedOrder, "Rejection order status updated successfully"));
});


export const orderRejectionApproveController = asyncHandler(async (req: Request, res: Response) => {
    const orderId = req.params.orderId;
    const { refundAmount, } = req.body;
    const changedBy = req.user._id; // assuming `req.user._id` is set via auth middleware

    const updatedOrder = await createRefundForRejectionOrderService({
        orderId,
        refundAmount,
        initiatedBy: changedBy
    });

    res.status(200).json(new ApiResponse(200, updatedOrder, "Rejection Approved successfully."));
});
