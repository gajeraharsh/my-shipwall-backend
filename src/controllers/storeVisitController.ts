import { Request, Response } from 'express';
import {
    createStoreVisit,
    deleteStoreVisitById,
    fetchStoreVisits,
    getStoreVisitById,
    updateStoreVisitById
} from '../services/storeVisitService';
import { asyncHandler } from '../utils/asyncHandler';
import ApiResponse from '../utils/apiResponse';
import ApiError from '../utils/apiError';

export const createVisit = asyncHandler(async (req: Request, res: Response) => {
    try {
        const visit = await createStoreVisit(req);
        return res.status(200).json(new ApiResponse(200, { visit }, 'Store visit created successfully'));
    } catch (err: any) {
        throw new ApiError(500, err.message || 'Store visit creation failed');
    }
});

export const getVisits = asyncHandler(async (req: Request, res: Response) => {
    try {
        const visits = await fetchStoreVisits(req);
        return res.status(200).json(new ApiResponse(200, { visits }, 'Store visits retrieved successfully'));
    } catch (err: any) {
        throw new ApiError(500, err.message || 'Could not retrieve store visits');
    }
});

export const getVisitById = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const visit = await getStoreVisitById(id);
        return res.status(200).json(new ApiResponse(200, { visit }, 'Store visit retrieved successfully'));
    } catch (err: any) {
        throw new ApiError(500, err.message || 'Could not retrieve store visit');
    }
});

export const updateVisit = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updatedVisit = await updateStoreVisitById(id, req.body);
        return res.status(200).json(new ApiResponse(200, { updatedVisit }, 'Store visit updated successfully'));
    } catch (err: any) {
        throw new ApiError(500, err.message || 'Could not update store visit');
    }
});

export const deleteVisit = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await deleteStoreVisitById(id);
        return res.status(200).json(new ApiResponse(200, {}, 'Store visit deleted successfully'));
    } catch (err: any) {
        throw new ApiError(500, err.message || 'Could not delete store visit');
    }
});
