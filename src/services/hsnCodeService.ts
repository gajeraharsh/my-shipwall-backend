import Brand from '../models/Brand';
import ApiError from '../utils/apiError';
import { IHsnBody } from '../types/IHsnCodes';
import httpStatus from 'http-status';
import HsnModel from '../models/HsnCode';


export const createNewHsnCode = async (data: IHsnBody) => {
    const input = {
        ...data,
    };
    return await HsnModel.create(input);
};

export const fetchhsnCodes = async (req: any) => {
    try {

        const page = req?.query?.page;
        const limit = req?.query?.limit;
        const query = req?.query?.search

        const hsncodes = await HsnModel.paginate({
            code: { $regex: query, $options: 'i' }
        }, {
            page,
            limit,

        });

        if (!hsncodes || hsncodes.length === 0) {
            throw new ApiError(httpStatus.NOT_FOUND, 'No hysn code found');
        }

        return hsncodes;
    } catch (err: any) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving brands');
    }
}

export const fetchHsnCodeDropdown = async (req: any) => {
    try {
        const filter = req.query.search
            ? { code: { $regex: req.query.search, $options: 'i' } }
            : {};

        const options = {
            page: Number(req.query.page) || 1,
            limit: Number(req.query.limit) || 5,
            pagination: true,
        };

        const hsncodes = await HsnModel.paginate(filter, options);

        return hsncodes;
    } catch (err: any) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving hsn codes');
    }
};

export const getHsnCodeByIdService = async (brandId: string) => {
    try {
        const hsncode = await HsnModel.findById(brandId);

        if (!hsncode) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Hsn code not found');
        }

        return hsncode;
    } catch (err: any) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving Hsn code');
    }
};

export const updateHsnCodeById = async (id: string, updateData: Partial<IHsnBody>) => {
    try {
        const hsnCode = await HsnModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        if (!hsnCode) throw new ApiError(httpStatus.NOT_FOUND, 'Hsn code not found');
        return hsnCode;
    } catch (err: any) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error updating hsn code');
    }
};

export const deleteHsnCodeById = async (id: string) => {
    try {
        const hsnCode = await HsnModel.findByIdAndDelete(id);
        if (!hsnCode) throw new ApiError(httpStatus.NOT_FOUND, 'Hsn code not found');
        return hsnCode;
    } catch (err: any) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error deleting hsn code');
    }
};

