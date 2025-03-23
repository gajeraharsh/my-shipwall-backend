import { NextFunction, Request, Response } from 'express';
import {
  createNewCategory,
  fetchCategories,
  getCategoryByIdService,
  updateCategoryIdById,
  deleteCategoryIdById,
  fetchCategoriesDropdown,
  fetchAllCategories,
  updateCategoryOrderService
} from '../services/categoryService';
import { asyncHandler } from '../utils/asyncHandler';
import ApiResponse from '../utils/apiResponse';
import ApiError from '../utils/apiError';
import pick from "../utils/pick"
import httpStatus from 'http-status';

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  try {
    const category = await createNewCategory(req);
    return res.status(200).json(new ApiResponse(200, { category }, 'Created Successfully'));
  } catch (err: any) {
    throw new ApiError(500, err.message || 'Not created');
  }
});

export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  try {
    const categories = await fetchCategories(req);
    return res.status(200).json(new ApiResponse(200, { categories }, 'Categories retrieved successfully'));
  } catch (err: any) {
    throw new ApiError(500, err.message || 'Could not retrieve categories');
  }
});

export const getCatehgoryById = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await getCategoryByIdService(id);
    return res.status(200).json(new ApiResponse(200, { category }, 'Category retrieved successfully'));
  } catch (err: any) {
    throw new ApiError(500, err.message || 'Could not retrieve category');
  }
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedCategory = await updateCategoryIdById(id, req);
    return res.status(200).json(new ApiResponse(200, { updatedCategory }, 'Category updated successfully'));
  } catch (err: any) {
    throw new ApiError(500, err.message || 'Could not update category');
  }
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteCategoryIdById(id);
    return res.status(200).json(new ApiResponse(200, {}, 'Category deleted successfully'));
  } catch (err: any) {
    throw new ApiError(500, err.message || 'Could not delete category');
  }
});

export const getCategoryDropdown = asyncHandler(async (req: Request, res: Response) => {
  try {
    const categories = await fetchCategoriesDropdown(req);
    const options = categories?.results?.map((item: any) => {
      return {
        label: item?.categoryName,
        value: item?._id
      }
    })
    return res.status(200).json(new ApiResponse(200, { options }, 'Categories retrieved successfully'));
  } catch (err: any) {
    throw new ApiError(500, err.message || 'Could not retrieve categories');
  }
});


export const getAllCategories = asyncHandler(async (req: Request, res: Response) => {
  try {
    const categories = await fetchAllCategories(req);
    return res.status(200).json(new ApiResponse(200, { categories }, 'All categories retrieved successfully'));
  } catch (err: any) {
    throw new ApiError(500, err.message || 'Could not retrieve categories');
  }
});

export const updateCategoryOrderController = asyncHandler(async (req: Request, res: Response) => {
  try {
    const updatedCategory = await updateCategoryOrderService(req?.body?.ids || []);
    return res.status(200).json(new ApiResponse(200, { updatedCategory }, 'Category order updated successfully'));
  } catch (err: any) {
    throw new ApiError(500, err.message || 'Could not update categories order');
  }
});

