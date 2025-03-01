import ApiError from '../utils/apiError';
import { IBannerBody } from '../types/IBanner';
import httpStatus from 'http-status';
import Banner from '../models/Banner';
import { Request } from 'express';
import { uploadFileToS3 } from './fileUploads3Service';


export const createNewBanner = async (req: Request) => {
    const data: IBannerBody = req?.body
    const file = req.file as Express.Multer.File | undefined;

    let bannerImageUrl: string | null = null;

    if (file) {
        bannerImageUrl = await uploadFileToS3(file, req.body.user?._id);
    }

    const input = {
        ...data,
        bannerImageUrl
    };
    return await Banner.create(input);
};

/**
* Query for banner with pagination and options
* @param {Object} options - Query options (e.g., pagination, sort, populate)
* @returns {Promise<QueryResult>}
*/

export const fetchBanners = async (req: any) => {
    try {

        const page = req?.query?.page;
        const limit = req?.query?.limit;
        const query = req?.query?.search || ''

        const banners = await Banner.paginate({
            bannerName: { $regex: query, $options: 'i' }
        }, {
            page,
            limit,

        });

        if (!banners || banners.length === 0) {
            throw new ApiError(httpStatus.NOT_FOUND, 'No Banner found');
        }

        return banners;
    } catch (err: any) {
        console.log(err)
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving banners');
    }
}


export const getBannerByIdService = async (id: string) => {
    try {
        const banner = await Banner.findById(id);

        if (!banner) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Banner not found');
        }

        return banner;
    } catch (err: any) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving banner');
    }
};

export const updateBannerById = async (id: string, req: Request) => {
    try {
        const data: IBannerBody = req?.body
        const file = req.file as Express.Multer.File | undefined;

        let bannerImageUrl: string | null = null;

        if (file) {
            bannerImageUrl = await uploadFileToS3(file, req.body.user?._id);
        }

        const input: any = {
            ...data,
        };

        if (bannerImageUrl) {
            input['bannerImageUrl'] = bannerImageUrl
        }

        const banner = await Banner.findByIdAndUpdate(id, input, { new: true, runValidators: true });
        if (!banner) throw new ApiError(httpStatus.NOT_FOUND, 'Banner not found');
        return banner;
    } catch (err: any) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error updating banner');
    }
};

export const deleteBannerById = async (id: string) => {
    try {
        const banner = await Banner.findByIdAndDelete(id);
        if (!banner) throw new ApiError(httpStatus.NOT_FOUND, 'Banner not found');
        return banner;
    } catch (err: any) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error deleting banner');
    }
};

