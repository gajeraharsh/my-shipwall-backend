import { Request, Response } from 'express';
import {
    createNewTicket,
    deleteTicketById,
    fetchTickets,
    getTicketByIdService,
    updateTicketById
} from '../services/supportService';
import { asyncHandler } from '../utils/asyncHandler';
import ApiResponse from '../utils/apiResponse';
import ApiError from '../utils/apiError';

export const createSupport = asyncHandler(async (req: Request, res: Response) => {
    try {
        const support = await createNewTicket(req);
        return res.status(200).json(new ApiResponse(200, { support }, 'Support ticket created successfully'));
    } catch (err: any) {
        throw new ApiError(500, err.message || 'Support ticket creation failed');
    }
});

export const getSupports = asyncHandler(async (req: Request, res: Response) => {
    try {
        const supports = await fetchTickets(req);
        return res.status(200).json(new ApiResponse(200, { supports }, 'Support tickets retrieved successfully'));
    } catch (err: any) {
        throw new ApiError(500, err.message || 'Could not retrieve support tickets');
    }
});

export const getSupportById = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const support = await getTicketByIdService(id);
        return res.status(200).json(new ApiResponse(200, { support }, 'Support ticket retrieved successfully'));
    } catch (err: any) {
        throw new ApiError(500, err.message || 'Could not retrieve support ticket');
    }
});

export const updateSupport = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updatedSupport = await updateTicketById(id, req.body);
        return res.status(200).json(new ApiResponse(200, { updatedSupport }, 'Support ticket updated successfully'));
    } catch (err: any) {
        throw new ApiError(500, err.message || 'Could not update support ticket');
    }
});

export const deleteSupport = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await deleteTicketById(id);
        return res.status(200).json(new ApiResponse(200, {}, 'Support ticket deleted successfully'));
    } catch (err: any) {
        throw new ApiError(500, err.message || 'Could not delete support ticket');
    }
});

