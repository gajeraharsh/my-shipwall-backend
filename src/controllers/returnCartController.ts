import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import {
    addToReturnCartService,
    getCartService,
    removeFromCartService
} from "../services/returnCartService";
import ApiResponse from "../utils/apiResponse";


export const addToCartReturn = asyncHandler(async (req: Request, res: Response) => {
    const { productId, quantity, orderId } = req.body;
    const userId = req.user._id; // Assuming `req.user.id` is populated via authentication middleware

    if (!productId) {
        res.status(500).json(new ApiResponse(200, {}, "Product id required."));
    }

    const cart = await addToReturnCartService(userId, orderId, productId, quantity);
    res.status(200).json(new ApiResponse(200, cart, "Product added to cart"));
});

export const removeFromCartReturn = asyncHandler(async (req: Request, res: Response) => {
    const { productId, orderId } = req.params;
    const userId = req.user._id;
    const cart = await removeFromCartService(userId, orderId, productId);
    res.status(200).json(new ApiResponse(200, cart, "Product removed from cart"));
});

export const getCartReturn = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user._id;
    const orderId = req.query?.orderId;
    const cart = await getCartService(userId, orderId);
    res.status(200).json(new ApiResponse(200, cart, "Cart retrieved successfully"));
});
