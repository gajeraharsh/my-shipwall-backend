import { NextFunction, Request, Response } from 'express';
import {
  createNewProduct,
  fetchProduct,
  getProductByIdService,
  updateProductById,
  deleteProductById,
  fetchProductDropdown
} from '../services/productsService';
import { asyncHandler } from '../utils/asyncHandler';
import ApiResponse from '../utils/apiResponse';
import ApiError from '../utils/apiError';
import pick from "../utils/pick"
import httpStatus from 'http-status';

export const createProducts = asyncHandler(async (req: Request, res: Response) => {
  try {
    const product = await createNewProduct(req.body);
    return res.status(200).json(new ApiResponse(200, { product }, 'Created Successfully'));
  } catch (err: any) {
    throw new ApiError(500, err.message || 'Not created');
  }
});

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  try {
    const products = await fetchProduct();
    return res.status(200).json(new ApiResponse(200, { products }, 'Products retrieved successfully'));
  } catch (err: any) {
    throw new ApiError(500, err.message || 'Could not retrieve products');
  }
});

export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await getProductByIdService(id);
    return res.status(200).json(new ApiResponse(200, { product }, 'product retrieved successfully'));
  } catch (err: any) {
    throw new ApiError(500, err.message || 'Could not retrieve product');
  }
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedProduct = await updateProductById(id, req.body);
    return res.status(200).json(new ApiResponse(200, { updatedProduct }, 'Product updated successfully'));
  } catch (err: any) {
    throw new ApiError(500, err.message || 'Could not update Product');
  }
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteProductById(id);
    return res.status(200).json(new ApiResponse(200, {}, 'Product deleted successfully'));
  } catch (err: any) {
    throw new ApiError(500, err.message || 'Could not delete product');
  }
});

export const getProductsDropdown = asyncHandler(async (req: Request, res: Response) => {
  try {
    const products = await fetchProductDropdown();
    return res.status(200).json(new ApiResponse(200, { products }, 'Products retrieved successfully'));
  } catch (err: any) {
    throw new ApiError(500, err.message || 'Could not retrieve products');
  }
});
