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
        issueImageUrl
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

        const page = req?.query?.page;
        const limit = req?.query?.limit;
        const query = req?.query?.search ?? ''

        const tickets = await Support.paginate({
            complaintReason: { $regex: query, $options: 'i' }
        }, {
            page,
            limit,

        });


        return tickets;
    } catch (err: any) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving tickets');
    }
}


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

