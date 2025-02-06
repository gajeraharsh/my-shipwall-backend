import { NextFunction, Request, Response } from 'express';
import Brand from '../models/Brand';
import {
  createNewBrand,
  fetchBrands,
  getBrandByIdService,
  updateBrandById,
  deleteBrandById,
  fetchBrandsDropdown
} from '../services/brandService';
import { asyncHandler } from '../utils/asyncHandler';
import ApiResponse from '../utils/apiResponse';
import ApiError from '../utils/apiError';
import pick from "../utils/pick"
import httpStatus from 'http-status';

export const createBrand = asyncHandler(async (req: Request, res: Response) => {
  try {
    const brand = await createNewBrand(req.body);
    return res.status(200).json(new ApiResponse(200, { brand }, 'Created Successfully'));
  } catch (err: any) {
    throw new ApiError(500, err.message || 'Not created');
  }
});

export const getBrands = asyncHandler(async (req: Request, res: Response) => {
  try {
    const brands = await fetchBrands(req);
    return res.status(200).json(new ApiResponse(200, { brands }, 'Brands retrieved successfully'));
  } catch (err: any) {
    throw new ApiError(500, err.message || 'Could not retrieve brands');
  }
});

export const getBrandById = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const brand = await getBrandByIdService(id);
    return res.status(200).json(new ApiResponse(200, { brand }, 'Brand retrieved successfully'));
  } catch (err: any) {
    throw new ApiError(500, err.message || 'Could not retrieve brand');
  }
});

export const updateBrand = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedBrand = await updateBrandById(id, req.body);
    return res.status(200).json(new ApiResponse(200, { updatedBrand }, 'Brand updated successfully'));
  } catch (err: any) {
    throw new ApiError(500, err.message || 'Could not update brand');
  }
});

export const deleteBrand = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteBrandById(id);
    return res.status(200).json(new ApiResponse(200, {}, 'Brand deleted successfully'));
  } catch (err: any) {
    throw new ApiError(500, err.message || 'Could not delete brand');
  }
});

export const getBrandDropdown = asyncHandler(async (req: Request, res: Response) => {
  try {
    const brands = await fetchBrandsDropdown(req);
    const brandsOptions = brands?.map((item: any) => {
      return {
        label: item?.brandName,
        value: item?._id
      }
    })
    return res.status(200).json(new ApiResponse(200, { options: brandsOptions }, 'Brands retrieved successfully'));
  } catch (err: any) {
    throw new ApiError(500, err.message || 'Could not retrieve brands');
  }
});
