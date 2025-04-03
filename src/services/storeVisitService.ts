import ApiError from '../utils/apiError';
import httpStatus from 'http-status';
import StoreVisit from '../models/StoreVisit';
import { uploadFileToS3 } from './fileUploads3Service';
import { Request } from 'express';

export const createStoreVisit = async (req: Request) => {
    const body: any = req.body;
    const files = req.files as Express.Multer.File[] | undefined;

    let images: string[] = [];

    if (files && files.length > 0) {
        images = await Promise.all(
            files.map((file) => uploadFileToS3(file, req.user?._id))
        );
    }

    const storeVisitData = {
        ...body,
        images,
    };

    return await StoreVisit.create(storeVisitData);
};

export const fetchStoreVisits = async (req: any) => {
    try {
        const page = req?.query?.page || 1;
        const limit = req?.query?.limit || 10;
        const search = req?.query?.search ?? '';
        const { startDate = '', endDate = '', user } = req?.query;

        const filter: any = {};

        if (search) {
            filter.comments = { $regex: search, $options: 'i' };
        }

        if (startDate || endDate) {
            filter.fromDate = {};
            if (startDate) filter.fromDate.$gte = new Date(startDate);
            if (endDate) filter.fromDate.$lte = new Date(endDate);
        }

        if (user) {
            filter.user = user
        }

        const visits = await StoreVisit.paginate(filter, {
            page,
            limit,
            sort: { createdAt: -1 },
        });

        return visits;
    } catch (err: any) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving store visits');
    }
};

export const getStoreVisitById = async (id: string) => {
    try {
        const visit = await StoreVisit.findById(id);
        if (!visit) throw new ApiError(httpStatus.NOT_FOUND, 'Store visit not found');
        return visit;
    } catch (err: any) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving store visit');
    }
};

export const updateStoreVisitById = async (id: string, updateData: Partial<any>) => {
    try {
        const visit = await StoreVisit.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        if (!visit) throw new ApiError(httpStatus.NOT_FOUND, 'Store visit not found');
        return visit;
    } catch (err: any) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error updating store visit');
    }
};

export const deleteStoreVisitById = async (id: string) => {
    try {
        const visit = await StoreVisit.findByIdAndDelete(id);
        if (!visit) throw new ApiError(httpStatus.NOT_FOUND, 'Store visit not found');
        return visit;
    } catch (err: any) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error deleting store visit');
    }
};
