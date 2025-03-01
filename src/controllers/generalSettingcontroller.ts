import { Request, Response } from 'express';
import {
    getGeneralSettings,
    updateGeneralSettings
} from '../services/generalSettingService';
import { asyncHandler } from '../utils/asyncHandler';
import ApiResponse from '../utils/apiResponse';
import ApiError from '../utils/apiError';

export const getGeneralsetting = asyncHandler(async (req: Request, res: Response) => {
    try {
        const genralSetting = await getGeneralSettings();
        return res.status(200).json(new ApiResponse(200, { genralSetting }, 'General setting retrieved successfully'));
    } catch (err: any) {
        throw new ApiError(500, err.message || 'Could not retrieve general setting.');
    }
});

export const updateGeneralSetting = asyncHandler(async (req: Request, res: Response) => {
    try {
        const updateColorMaster = await updateGeneralSettings(req.body);
        return res.status(200).json(new ApiResponse(200, { updateColorMaster }, 'General setting updated successfully'));
    } catch (err: any) {
        throw new ApiError(500, err.message || 'Could not update general settin..');
    }
})