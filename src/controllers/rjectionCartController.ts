import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import {
    getCartService, removeFromCartService,
    updateCartService
} from "../services/rejectionCartService";
import ApiResponse from "../utils/apiResponse";


export const addToCartRjection = asyncHandler(async (req: Request, res: Response) => {
    const { productId, quantity } = req.body;
    const userId = req.user._id; // Assuming `req.user.id` is populated via authentication middleware

    if (!productId) {
        res.status(500).json(new ApiResponse(200, {}, "Product id required."));
    }

    const cart = await updateCartService(userId, productId, quantity);
    res.status(200).json(new ApiResponse(200, cart, "Product added to cart"));
});

export const removeFromCartRjection = asyncHandler(async (req: Request, res: Response) => {
    const { productId } = req.params;
    const userId = req.user._id;
    const cart = await removeFromCartService(userId, productId);
    res.status(200).json(new ApiResponse(200, cart, "Product removed from cart"));
});

export const getCartRjection = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user._id;
    const cart = await getCartService(userId);
    res.status(200).json(new ApiResponse(200, cart, "Cart retrieved successfully"));
});
