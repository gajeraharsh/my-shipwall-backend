import { Request, Response } from 'express';
import {
    createNewColorMaster,
    deleteColorMasterById,
    fetchColorMasterDropdown,
    fetchColorMasterService,
    getColorMasterByIdService,
    updateColorMasterById
} from '../services/colorMasterService';
import { asyncHandler } from '../utils/asyncHandler';
import ApiResponse from '../utils/apiResponse';
import ApiError from '../utils/apiError';

export const createColorMaster = asyncHandler(async (req: Request, res: Response) => {
    try {
        const colorMaster = await createNewColorMaster(req.body);
        return res.status(200).json(new ApiResponse(200, { colorMaster }, 'Created Successfully'));
    } catch (err: any) {
        throw new ApiError(500, err.message || 'Not created');
    }
});

export const getColorMasters = asyncHandler(async (req: Request, res: Response) => {
    try {
        const colorMasters = await fetchColorMasterService(req);
        return res.status(200).json(new ApiResponse(200, { colorMasters }, 'Color master retrieved successfully'));
    } catch (err: any) {
        throw new ApiError(500, err.message || 'Could not retrieve hsn codes');
    }
});

export const GetColorMasterById = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const colorMaster = await getColorMasterByIdService(id);
        return res.status(200).json(new ApiResponse(200, { colorMaster }, 'Color masterretrieved successfully'));
    } catch (err: any) {
        throw new ApiError(500, err.message || 'Could not retrieve color master.');
    }
});

export const updateColorMaster = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updateColorMaster = await updateColorMasterById(id, req.body);
        return res.status(200).json(new ApiResponse(200, { updateColorMaster }, 'Color master updated successfully'));
    } catch (err: any) {
        throw new ApiError(500, err.message || 'Could not update color master..');
    }
});

export const deleteColorMaster = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await deleteColorMasterById(id);
        return res.status(200).json(new ApiResponse(200, {}, 'Color master deleted successfully'));
    } catch (err: any) {
        throw new ApiError(500, err.message || 'Could not delete color master..');
    }
});

export const getColorMasterDropDown = asyncHandler(async (req: Request, res: Response) => {
    try {
        const colorMasters = await fetchColorMasterDropdown(req);
        const colorMastersOptions = colorMasters?.results?.map((item: any) => {
            return {
                label: item?.brandName,
                value: item?._id
            }
        })
        return res.status(200).json(new ApiResponse(200, { options: colorMastersOptions }, 'Color master retrieved successfully'));
    } catch (err: any) {
        throw new ApiError(500, err.message || 'Could not retrieve color master.');
    }
});
