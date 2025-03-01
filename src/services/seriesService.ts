import Series from '../models/Series';
import ApiError from '../utils/apiError';
import { ISeriesbody } from '../types/ISeries';
import httpStatus from 'http-status';
import { uploadFileToS3 } from './fileUploads3Service';
import { Request } from 'express';


export const createNewSeries = async (req: Request) => {
  const seriesbody = req?.body
  const file = req.file as Express.Multer.File | undefined;

  let iconImageUrl: string | null = null;

  if (file) {
    iconImageUrl = await uploadFileToS3(file, req.body.user?._id);
  }

  const input = {
    ...seriesbody,
    thumbImageUrl: iconImageUrl
  };
  return await Series.create(input);
};

/**
* Query for Series with pagination and options
* @param {Object} options - Query options (e.g., pagination, sort, populate)
* @returns {Promise<QueryResult>}
*/


export const fetchSeries = async (req: Request) => {
  try {
    const page = req?.query?.page;
    const limit = req?.query?.limit;
    const query = req?.query?.search

    // @ts-ignore
    const series = await Series.paginate({
      seriesName: { $regex: query, $options: 'i' }
    }, {
      page,
      limit,
      populate: [
        { path: 'brand', select: '_id brandName' },
        { path: 'category', select: '_id categoryName' }
      ]
    });


    //   const series = await Series.paginate({}, {});
    // const series = await Series.find().populate('brand', 'brandName').populate('category', 'categoryName');


    if (!series || series.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, 'No series found');
    }

    return series;
  } catch (err: any) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving brands');
  }
}

export const fetchSeriesDropdown = async (req: Request) => {
  try {
    const filter = req.query.search
      ? { categoryName: { $regex: req.query.search, $options: 'i' } }
      : {};

    const options = {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 5,
      sortBy: 'seriesName:asc', // Optional sorting
      select: '_id seriesName',
      pagination: true, // Set to false if you want all results without pagination
    };
    // @ts-ignore
    const series = await Series.paginate(filter, options);

    // const series = await Series.find({}, { _id: 1, seriesName: 1 });

    if (!series || series.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, 'No series found');
    }
    return series;
  } catch (err: any) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving brands');
  }
};

export const getSeriesByIdService = async (seriesId: string) => {
  try {
    const series = await Series.findById(seriesId).populate('brand', 'brandName').populate('category', 'categoryName');

    if (!series) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Series not found');
    }

    return series;
  } catch (err: any) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving series');
  }
};

export const updateSeriesById = async (seriesId: string, req: Request) => {
  try {

    const data: ISeriesbody = req?.body
    const file = req.file as Express.Multer.File | undefined;

    let iconImageUrl: string | null = null;

    if (file) {
      iconImageUrl = await uploadFileToS3(file, req.body.user?._id);
    }

    const input: any = {
      ...data,
    };

    if (iconImageUrl) {
      input['thumbImageUrl'] = iconImageUrl
    }

    const series = await Series.findByIdAndUpdate(seriesId, input, { new: true, runValidators: true });
    if (!series) throw new ApiError(httpStatus.NOT_FOUND, 'Series not found');
    return series;
  } catch (err: any) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error updating series');
  }
};

export const deleteSeriesById = async (seriesId: string) => {
  try {
    const series = await Series.findByIdAndDelete(seriesId);
    if (!series) throw new ApiError(httpStatus.NOT_FOUND, 'series not found');
    return series;
  } catch (err: any) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error deleting brand');
  }
};

