import Brand from '../models/Brand';
import ApiError from '../utils/apiError';
import { IColorMasterBody } from '../types/IColormaster';
import httpStatus from 'http-status';
import ColorMaster from '../models/ColorMaster';


export const createNewColorMaster = async (data: IColorMasterBody) => {
    const input = {
        ...data,
    };
    return await ColorMaster.create(input);
};

export const fetchColorMasterService = async (req: any) => {
    try {

        const page = req?.query?.page;
        const limit = req?.query?.limit;
        const query = req?.query?.search

        const colorsMasters = await ColorMaster.paginate({
            colorName: { $regex: query, $options: 'i' }
        }, {
            page,
            limit,

        });

        if (!colorsMasters || colorsMasters.length === 0) {
            throw new ApiError(httpStatus.NOT_FOUND, 'No color master found');
        }

        return colorsMasters;
    } catch (err: any) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving color master');
    }
}

export const fetchColorMasterDropdown = async (req: any) => {
    try {
        const filter = req.query.search
            ? { colorName: { $regex: req.query.search, $options: 'i' } }
            : {};

        const options = {
            page: Number(req.query.page) || 1,
            limit: Number(req.query.limit) || 1,
            pagination: true,
        };

        const colorMasters = await ColorMaster.paginate(filter, options);

        return colorMasters;
    } catch (err: any) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving color master');
    }
};

export const getColorMasterByIdService = async (id: string) => {
    try {
        const colorMaster = await ColorMaster.findById(id);

        if (!colorMaster) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Color master not found');
        }

        return colorMaster;
    } catch (err: any) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving color master');
    }
};

export const updateColorMasterById = async (id: string, updateData: Partial<IColorMasterBody>) => {
    try {
        const colorMaster = await ColorMaster.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        if (!colorMaster) throw new ApiError(httpStatus.NOT_FOUND, 'Color master not found');
        return colorMaster;
    } catch (err: any) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error updating color master');
    }
};

export const deleteColorMasterById = async (id: string) => {
    try {
        const colorMaster = await ColorMaster.findByIdAndDelete(id);
        if (!colorMaster) throw new ApiError(httpStatus.NOT_FOUND, 'Color master not found');
        return colorMaster;
    } catch (err: any) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error deleting color master');
    }
};