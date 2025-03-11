import Brand from '../models/Brand';
import ApiError from '../utils/apiError';
import { IBrandBody } from '../types/IBrand';
import httpStatus from 'http-status';
import mongoose from 'mongoose';



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
    const query = req?.query?.search ?? ''

    const brands = await Brand.paginate({
      brandName: { $regex: query, $options: 'i' }
    }, {
      page,
      limit,
      sortBy: 'position:asc',
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
      limit: Number(req.query.limit) || 5,
      select: '_id brandName',
      pagination: true,
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

export const fetchAllBrands = async (req: any) => {
  try {
    const filter = {}; // No specific filter to get all brands
    const options = {
      sortBy: 'position:asc', // Sort by position in ascending order
      pagination: false, // Fetch all brands without pagination
    };

    const brands = await Brand.paginate(filter, options);

    return brands.results; // Return only the results array
  } catch (err: any) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving brands');
  }
};

export const updateBrandOrderService = async (brands: { _id: string }[]) => {
  try {
    if (!brands || brands.length === 0) {
      throw new ApiError(400, "Invalid brand list");
    }


    const bulkOps = brands.map((brand, index) => ({
      updateOne: {
        filter: { _id: brand },
        update: { $set: { position: index + 1 } }, // Change the value slightly
        upsert: true, // Ensures update happens even if no change detected
      },
    }));

    const result = await Brand.bulkWrite(bulkOps);

    return { success: true, message: "Brand order updated successfully", result };
  } catch (err: any) {
    throw new ApiError(500, "Error updating brand order: " + err.message);
  }
};

