import Brand from '../models/Brand';
import ApiError from '../utils/apiError';
import { IBrandBody } from '../types/IBrand';
import httpStatus from 'http-status';


export const createNewBrand = async (brandBody: IBrandBody) => {
  const brandData = {
    ...brandBody,
  };
  return await Brand.create(brandData);
};

/**
* Query for brands with pagination and options
* @param {Object} options - Query options (e.g., pagination, sort, populate)
* @returns {Promise<QueryResult>}
*/


export const fetchBrands = async (req: any) => {
  try {

    const page = req?.query?.page;
    const limit = req?.query?.limit;
    const query = req?.query?.search

    const brands = await Brand.paginate({
      brandName: { $regex: query, $options: 'i' }
    }, {
      page,
      limit,

    });
    // const brands = await Brand.find();


    if (!brands || brands.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, 'No brands found');
    }

    return brands;
  } catch (err: any) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving brands');
  }
}

export const fetchBrandsDropdown = async (req: any) => {
  try {
    const filter = req.query.search
      ? { brandName: { $regex: req.query.search, $options: 'i' } }
      : {};

    const options = {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
      sortBy: 'brandName:asc', // Optional sorting
      select: '_id brandName',
      pagination: true, // Set to false if you want all results without pagination
    };

    const brands = await Brand.paginate(filter, options);

    // if (!brands || brands.length === 0) {
    //   throw new ApiError(httpStatus.NOT_FOUND, 'No brands found');
    // }
    return brands;
  } catch (err: any) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving brands');
  }
};

export const getBrandByIdService = async (brandId: string) => {
  try {
    const brand = await Brand.findById(brandId);

    if (!brand) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Brand not found');
    }

    return brand;
  } catch (err: any) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving brand');
  }
};

export const updateBrandById = async (brandId: string, updateData: Partial<IBrandBody>) => {
  try {
    const brand = await Brand.findByIdAndUpdate(brandId, updateData, { new: true, runValidators: true });
    if (!brand) throw new ApiError(httpStatus.NOT_FOUND, 'Brand not found');
    return brand;
  } catch (err: any) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error updating brand');
  }
};

export const deleteBrandById = async (brandId: string) => {
  try {
    const brand = await Brand.findByIdAndDelete(brandId);
    if (!brand) throw new ApiError(httpStatus.NOT_FOUND, 'Brand not found');
    return brand;
  } catch (err: any) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error deleting brand');
  }
};

