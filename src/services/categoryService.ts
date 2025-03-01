import Category from '../models/Category';
import ApiError from '../utils/apiError';
import { ICategorybody } from '../types/ICategory';
import httpStatus from 'http-status';
import { Request } from 'express';
import { uploadFileToS3 } from './fileUploads3Service';


export const createNewCategory = async (req: Request) => {

  const data: ICategorybody = req?.body
  const file = req.file as Express.Multer.File | undefined;

  let iconImageUrl: string | null = null;

  if (file) {
    iconImageUrl = await uploadFileToS3(file, req.body.user?._id);
  }


  const input = {
    ...data,
    iconImageUrl
  };

  return await Category.create(input);
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
      populate: [
        { path: 'brand', select: '_id brandName' },
      ]
    });

    if (!categories || categories.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, 'No categories found');
    }

    return categories;
  } catch (err: any) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving categories');
  }
}

export const fetchCategoriesDropdown = async (req: Request) => {
  try {
    const filter = req.query.search
      ? { categoryName: { $regex: req.query.search, $options: 'i' } }
      : {};

    const options = {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 5,
      sortBy: 'categoryName:asc', // Optional sorting
      select: '_id categoryName',
      pagination: true, // Set to false if you want all results without pagination
    };
    // @ts-ignore
    const categories = await Category.paginate(filter, options);

    if (!categories || categories.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, 'No categories found');
    }
    return categories;
  } catch (err: any) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving categories');
  }
};


export const updateCategoryIdById = async (categoryId: string, req: Request) => {
  try {

    const data: ICategorybody = req?.body
    const file = req.file as Express.Multer.File | undefined;

    let iconImageUrl: string | null = null;

    if (file) {
      iconImageUrl = await uploadFileToS3(file, req.body.user?._id);
    }

    const input: any = {
      ...data,
    };


    if (iconImageUrl) {
      input['iconImageUrl'] = iconImageUrl
    }


    const category = await Category.findByIdAndUpdate(categoryId, input, { new: true, runValidators: true });
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

