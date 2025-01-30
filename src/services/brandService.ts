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

  
  export const fetchBrands = async () => {
    try {
        
        const brands = await Brand.find();
        
        if (!brands || brands.length === 0) {
          throw new ApiError(httpStatus.NOT_FOUND, 'No brands found');
        }
    
        return brands;
      } catch (err: any) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving brands');
      }
  }

  export const fetchBrandsDropdown = async () => {
    try {
      const brands = await Brand.find({}, { _id: 1, brandName: 1 });
  
      if (!brands || brands.length === 0) {
        throw new ApiError(httpStatus.NOT_FOUND, 'No brands found');
      }
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
  
