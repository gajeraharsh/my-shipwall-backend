import { Request, Response } from 'express';

import { asyncHandler } from '../utils/asyncHandler';
import ApiResponse from '../utils/apiResponse';
import ApiError from '../utils/apiError';
import { createNewBanner, deleteBannerById, fetchBanners, getBannerByIdService, updateBannerById } from '../services/bannerService';

export const createBanner = asyncHandler(async (req: Request, res: Response) => {
    try {
        const banners = await createNewBanner(req);
        return res.status(200).json(new ApiResponse(200, { banners }, 'Created Successfully'));
    } catch (err: any) {
        throw new ApiError(500, err.message || 'Not created');
    }
});

export const getBanners = asyncHandler(async (req: Request, res: Response) => {
    try {
        const banners = await fetchBanners(req);
        return res.status(200).json(new ApiResponse(200, { banners }, 'Banners retrieved successfully'));
    } catch (err: any) {
        throw new ApiError(500, err.message || 'Could not retrieve banners');
    }
});

export const getBannerById = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const banner = await getBannerByIdService(id);
        return res.status(200).json(new ApiResponse(200, { banner }, 'Banner retrieved successfully'));
    } catch (err: any) {
        throw new ApiError(500, err.message || 'Could not retrieve banner');
    }
});

export const updateBanner = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updatedBanner = await updateBannerById(id, req);
        return res.status(200).json(new ApiResponse(200, { updatedBanner }, 'Banner updated successfully'));
    } catch (err: any) {
        throw new ApiError(500, err.message || 'Could not update banner');
    }
});

export const deleteBanner = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await deleteBannerById(id);
        return res.status(200).json(new ApiResponse(200, {}, 'Banner deleted successfully'));
    } catch (err: any) {
        throw new ApiError(500, err.message || 'Could not delete banner');
    }
});

