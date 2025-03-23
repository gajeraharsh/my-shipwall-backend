import ApiError from '../utils/apiError';
import httpStatus from 'http-status';
import { ISupportBody } from '../types/support';
import Support from '../models/Support';
import { uploadFileToS3 } from './fileUploads3Service';
import { Request } from 'express';


export const createNewTicket = async (req: Request) => {

    const body: ISupportBody = req.body;

    const file = req.file as Express.Multer.File | undefined;

    let issueImageUrl: string | null = null;

    if (file) {
        issueImageUrl = await uploadFileToS3(file, req.user?._id);
    }

    const ticketData = {
        ...body,
        issueImageUrl,
        user: req?.user?._id
    };
    return await Support.create(ticketData);
};

/**
* Query for tickets with pagination and options
* @param {Object} options - Query options (e.g., pagination, sort, populate)
* @returns {Promise<QueryResult>}
*/


export const fetchTickets = async (req: any) => {
    try {
        const page = req?.query?.page || 1;
        const limit = req?.query?.limit || 10;
        const query = req?.query?.search ?? '';

        const {
            status = '',
            typeOfComplaint = '',
            user = '',
            startDate = '',
            endDate = ''
        } = req?.query;

        // Construct the filter query
        const filter: any = {};

        if (query) {
            filter.complaintReason = { $regex: query, $options: 'i' };
        }

        if (status) {
            filter.complaintStatus = status;
        }

        if (typeOfComplaint) {
            filter.typeOfComplaint = typeOfComplaint;
        }

        if (user) {
            filter.user = user;
        }

        // Date Range Filtering (Handles only startDate, only endDate, or both)
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        const tickets = await Support.paginate(filter, {
            page,
            limit,
            sort: { createdAt: -1 },
            populate: [
                { path: 'user', select: '_id id' },
            ]
        });

        return tickets;
    } catch (err: any) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving tickets');
    }
};


export const getTicketByIdService = async (ticketId: string) => {
    try {
        const ticket = await Support.findById(ticketId);

        if (!ticket) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Ticket not found');
        }

        return ticket;
    } catch (err: any) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving tickets');
    }
};

export const updateTicketById = async (ticketId: string, updateData: Partial<ISupportBody>) => {
    try {
        const ticket = await Support.findByIdAndUpdate(ticketId, updateData, { new: true, runValidators: true });
        if (!ticket) throw new ApiError(httpStatus.NOT_FOUND, 'Ticket not found');
        return ticket;
    } catch (err: any) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error updating tickets');
    }
};

export const deleteTicketById = async (ticketId: string) => {
    try {
        const ticket = await Support.findByIdAndDelete(ticketId);
        if (!ticket) throw new ApiError(httpStatus.NOT_FOUND, 'Ticket not found');
        return ticket;
    } catch (err: any) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error deleting tickets');
    }
};

