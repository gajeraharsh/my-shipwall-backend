import ContactUs from '../models/ContactUs';
import ApiError from '../utils/apiError';
import { IContactUs } from '../types/IContactUs';
import httpStatus from 'http-status';

export const fetchContactMessages = async (req: any) => {
    try {
        const page = Number(req?.query?.page) || 1;
        const limit = Number(req?.query?.limit) || 10;
        const query = req?.query?.search ? { name: { $regex: req.query.search, $options: 'i' } } : {};

        const options = {
            page,
            limit,
            sort: { createdAt: -1 },
        };

        const contacts = await ContactUs.paginate(query, options);
        return contacts;
    } catch (err: any) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving contact messages');
    }
};


export const createContactMessage = async (contactBody: IContactUs) => {
    return await ContactUs.create(contactBody);
};

export const updateContactMessage = async (contactId: string, updateData: Partial<IContactUs>) => {
    try {
        const contact = await ContactUs.findByIdAndUpdate(contactId, updateData, { new: true, runValidators: true });
        if (!contact) throw new ApiError(httpStatus.NOT_FOUND, 'Contact message not found');
        return contact;
    } catch (err: any) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error updating contact message');
    }
};

export const deleteContactMessage = async (contactId: string) => {
    try {
        const contact = await ContactUs.findByIdAndDelete(contactId);
        if (!contact) throw new ApiError(httpStatus.NOT_FOUND, 'Contact message not found');
        return contact;
    } catch (err: any) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error deleting contact message');
    }
};
