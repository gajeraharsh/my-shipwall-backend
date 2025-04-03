import { Request, Response } from 'express';
import {
    createContactMessage,
    updateContactMessage,
    deleteContactMessage,
    fetchContactMessages,
} from '../services/contactusService';
import { asyncHandler } from '../utils/asyncHandler';
import ApiResponse from '../utils/apiResponse';
import ApiError from '../utils/apiError';

export const getContactsController = asyncHandler(async (req: Request, res: Response) => {
    try {
        const contacts = await fetchContactMessages(req);
        return res.status(200).json(new ApiResponse(200, { contacts }, 'Contact messages retrieved successfully'));
    } catch (err: any) {
        throw new ApiError(500, err.message || 'Error retrieving contact messages');
    }
});


export const createContact = asyncHandler(async (req: Request, res: Response) => {
    try {
        const contact = await createContactMessage(req.body);
        return res.status(201).json(new ApiResponse(201, { contact }, 'Contact message created successfully'));
    } catch (err: any) {
        throw new ApiError(500, err.message || 'Failed to create contact message');
    }
});

export const updateContact = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updatedContact = await updateContactMessage(id, req.body);
        return res.status(200).json(new ApiResponse(200, { updatedContact }, 'Contact message updated successfully'));
    } catch (err: any) {
        throw new ApiError(500, err.message || 'Failed to update contact message');
    }
});

export const deleteContact = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await deleteContactMessage(id);
        return res.status(200).json(new ApiResponse(200, {}, 'Contact message deleted successfully'));
    } catch (err: any) {
        throw new ApiError(500, err.message || 'Failed to delete contact message');
    }
});
