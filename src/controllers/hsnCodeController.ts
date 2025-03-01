import { Request, Response } from 'express';
import {
    createNewHsnCode,
    deleteHsnCodeById,
    fetchHsnCodeDropdown,
    fetchhsnCodes,
    getHsnCodeByIdService,
    updateHsnCodeById
} from '../services/hsnCodeService';
import { asyncHandler } from '../utils/asyncHandler';
import ApiResponse from '../utils/apiResponse';
import ApiError from '../utils/apiError';

export const createHsnCode = asyncHandler(async (req: Request, res: Response) => {
    try {
        const hsnCode = await createNewHsnCode(req.body);
        return res.status(200).json(new ApiResponse(200, { hsnCode }, 'Created Successfully'));
    } catch (err: any) {
        throw new ApiError(500, err.message || 'Not created');
    }
});

export const getHsnCodes = asyncHandler(async (req: Request, res: Response) => {
    try {
        const hsnCodes = await fetchhsnCodes(req);
        return res.status(200).json(new ApiResponse(200, { hsnCodes }, 'Hsn codes retrieved successfully'));
    } catch (err: any) {
        throw new ApiError(500, err.message || 'Could not retrieve hsn codes');
    }
});

export const getHsnCodeById = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const hsnCode = await getHsnCodeByIdService(id);
        return res.status(200).json(new ApiResponse(200, { hsnCode }, 'Hsn code retrieved successfully'));
    } catch (err: any) {
        throw new ApiError(500, err.message || 'Could not retrieve brand');
    }
});

export const updateHsnCode = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updatedHsnCode = await updateHsnCodeById(id, req.body);
        return res.status(200).json(new ApiResponse(200, { updatedHsnCode }, 'Hsn code updated successfully'));
    } catch (err: any) {
        throw new ApiError(500, err.message || 'Could not update hsn code.');
    }
});

export const deleteHsnCode = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await deleteHsnCodeById(id);
        return res.status(200).json(new ApiResponse(200, {}, 'Hsn code deleted successfully'));
    } catch (err: any) {
        throw new ApiError(500, err.message || 'Could not delete hsn code.');
    }
});

export const getHsnDropdown = asyncHandler(async (req: Request, res: Response) => {
    try {
        const hsnCodes = await fetchHsnCodeDropdown(req);
        const hsnCodesOptions = hsnCodes?.results?.map((item: any) => {
            return {
                label: item?.code,
                value: item?._id
            }
        })
        return res.status(200).json(new ApiResponse(200, { options: hsnCodesOptions }, 'Hsn code retrieved successfully'));
    } catch (err: any) {
        throw new ApiError(500, err.message || 'Could not retrieve hsn codes.');
    }
});
