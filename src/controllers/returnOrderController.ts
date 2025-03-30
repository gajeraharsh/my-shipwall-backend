import { Request, Response } from "express";
import {
    createOrderReturnService,
    createReturnForRejectionOrderService,
    fetchAllReturnOrders,
    fetchReturnOrderById,
    fetchReturnOrders,
    getOrderReturnByIdService,
    updateReturnActivityById,
    updateReturnOrderStatusService,
} from "../services/returnOrderService";
import { asyncHandler } from "../utils/asyncHandler";
import ApiResponse from "../utils/apiResponse";

export const createReturnOrder = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user._id; // Assuming `req.user._id` is populated via authentication middleware

    const order = await createOrderReturnService(userId, req);
    res.status(201).json(new ApiResponse(201, order, "Order return created successfully"));
});


export const getReturnOrders = asyncHandler(async (req: Request, res: Response) => {
    const order = await fetchReturnOrders(req);
    res.status(201).json(new ApiResponse(201, order, "Order return fetch successfully"));
});


export const getAllReturnOrders = asyncHandler(async (req: Request, res: Response) => {
    const order = await fetchAllReturnOrders(req);
    res.status(201).json(new ApiResponse(201, order, "Order return fetch successfully"));
});



export const getReturnOrderbyId = asyncHandler(async (req: Request, res: Response) => {
    // const userId = req.user._id;
    const orderId = req.params.orderId;

    const order = await getOrderReturnByIdService(orderId);
    res.status(201).json(new ApiResponse(201, order, "Order return fetch successfully"));
});

/**
 * Controller to update rejection order status and log activity
 * @route PATCH /api/rejection-orders/:orderId/status
 */
export const updateReturnOrderStatus = asyncHandler(async (req: Request, res: Response) => {
    const orderId = req.params.orderId;
    const { newStatus } = req.body;
    const changedBy = req.user._id; // assuming `req.user._id` is set via auth middleware

    const updatedOrder = await updateReturnOrderStatusService(orderId, newStatus, changedBy);

    res.status(200).json(new ApiResponse(200, updatedOrder, "return order status updated successfully"));
});


export const orderReturnApproveController = asyncHandler(async (req: Request, res: Response) => {
    const orderId = req.params.orderId;
    const { refundAmount, } = req.body;
    const changedBy = req.user._id; // assuming `req.user._id` is set via auth middleware

    const updatedOrder = await createReturnForRejectionOrderService({
        orderId,
        refundAmount,
        initiatedBy: changedBy
    });

    res.status(200).json(new ApiResponse(200, updatedOrder, "return Approved successfully."));
});
