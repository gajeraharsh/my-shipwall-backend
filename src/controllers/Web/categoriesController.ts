import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import ApiError from "../../utils/apiError";
import httpStatus from 'http-status'
import ApiResponse from "../../utils/apiResponse";
import Category from "../../models/Category";

export const getCategoriesByBrand = asyncHandler(async (req: Request, res: Response) => {
    try {

        const brandId = req?.query?.brandId

        if (!brandId) {
            throw new ApiError(httpStatus.BAD_GATEWAY, 'brand id is requried');
            return
        }

        /// @ts-ignore
        const categories = await Category.find({
            brand: brandId
        });

        // if (!categories || categories.length === 0) {
        //     throw new ApiError(httpStatus.NOT_FOUND, 'No categories found');
        // }

        return res.status(200).json(new ApiResponse(200, { categories }, 'Categories retrieved successfully'));
    } catch (err: any) {
        throw new ApiError(500, err.message || 'Could not retrieve categories');
    }
});
