import Product from '../models/Product';
import ApiError from '../utils/apiError';
import { IProductbody } from '../types/IProduct';
import httpStatus from 'http-status';


export const createNewProduct = async (productbody: IProductbody) => {
    const productData = {
      ...productbody,
    };
    return await Product.create(productData);
  };

  /**
 * Query for Product with pagination and options
 * @param {Object} options - Query options (e.g., pagination, sort, populate)
 * @returns {Promise<QueryResult>}
 */

  
  export const fetchProduct = async () => {
    try {
    //   const product = await Product.paginate({}, {});
        const product = await Product.find();
        
        
        if (!product || product.length === 0) {
          throw new ApiError(httpStatus.NOT_FOUND, 'No product found');
        }
    
        return product;
      } catch (err: any) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving brands');
      }
  }

  export const fetchProductDropdown = async () => {
    try {
      const product = await Product.find({}, { _id: 1, productName: 1 });
  
      if (!product || product.length === 0) {
        throw new ApiError(httpStatus.NOT_FOUND, 'No product found');
      }
      return product;
    } catch (err: any) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving brands');
    }
  };

  export const getProductByIdService = async (productId: string) => {
    try {
      const product = await Product.findById(productId);

      if (!product) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
      }
  
      return product;
    } catch (err: any) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving product');
    }
  };

  export const updateProductById = async (productId: string, updateData: Partial<IProductbody>) => {
    try {
      const product = await Product.findByIdAndUpdate(productId, updateData, { new: true, runValidators: true });
      if (!product) throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
      return product;
    } catch (err: any) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error updating product');
    }
  };
  
  export const deleteProductById = async (productId: string) => {
    try {
      const product = await Product.findByIdAndDelete(productId);
      if (!product) throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
      return product;
    } catch (err: any) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error deleting brand');
    }
  };
  
