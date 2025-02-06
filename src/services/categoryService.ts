import Category from '../models/Category';
import ApiError from '../utils/apiError';
import { ICategorybody } from '../types/ICategory';
import httpStatus from 'http-status';


export const createNewCategory = async (categoryBody: ICategorybody) => {
  const categoryData = {
    ...categoryBody,
  };
  return await Category.create(categoryData);
};


/**
* Query for categories with pagination and options
* @param {Object} options - Query options (e.g., pagination, sort, populate)
* @returns {Promise<QueryResult>}
*/
export const getCategoryByIdService = async (categoryId: string) => {
  try {
    const category = await Category.findById(categoryId).populate('brand', 'brandName');

    if (!category) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
    }

    return category;
  } catch (err: any) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving category');
  }
}

export const fetchCategories = async (req: any) => {
  try {
    const page = req?.query?.page;
    const limit = req?.query?.limit;
    const query = req?.query?.search

    /// @ts-ignore
    const categories = await Category.paginate({
      categoryName: { $regex: query, $options: 'i' }
    }, {
      page,
      limit,
    });

    if (!categories || categories.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, 'No categories found');
    }

    return categories;
  } catch (err: any) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving categories');
  }
}

export const fetchCategoriesDropdown = async () => {
  try {
    const categories = await Category.find({}, { _id: 1, categoryName: 1 });

    if (!categories || categories.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, 'No categories found');
    }
    return categories;
  } catch (err: any) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving categories');
  }
};


export const updateCategoryIdById = async (categoryId: string, updateData: Partial<ICategorybody>) => {
  try {
    const category = await Category.findByIdAndUpdate(categoryId, updateData, { new: true, runValidators: true });
    if (!category) throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
    return category;
  } catch (err: any) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error updating category');
  }
};

export const deleteCategoryIdById = async (categoryId: string) => {
  try {
    const category = await Category.findByIdAndDelete(categoryId);
    if (!category) throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
    return category;
  } catch (err: any) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error deleting category');
  }
};

