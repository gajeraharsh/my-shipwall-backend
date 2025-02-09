import { NextFunction, Request, Response } from 'express';
import {
  createNewSeries,
  fetchSeries,
  getSeriesByIdService,
  updateSeriesById,
  deleteSeriesById,
  fetchSeriesDropdown
} from '../services/seriesService';
import { asyncHandler } from '../utils/asyncHandler';
import ApiResponse from '../utils/apiResponse';
import ApiError from '../utils/apiError';
import httpStatus from 'http-status';

export const createSeries = asyncHandler(async (req: Request, res: Response) => {
  try {
    const series = await createNewSeries(req);
    return res.status(200).json(new ApiResponse(200, { series }, 'Series created successfully'));
  } catch (err: any) {
    throw new ApiError(500, err.message || 'Series not created');
  }
});

export const getSeries = asyncHandler(async (req: Request, res: Response) => {
  try {
    const seriesList = await fetchSeries(req);
    return res.status(200).json(new ApiResponse(200, { seriesList }, 'Series retrieved successfully'));
  } catch (err: any) {
    throw new ApiError(500, err.message || 'Could not retrieve series');
  }
});

export const getSeriesById = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const series = await getSeriesByIdService(id);
    return res.status(200).json(new ApiResponse(200, { series }, 'Series retrieved successfully'));
  } catch (err: any) {
    throw new ApiError(500, err.message || 'Could not retrieve series');
  }
});

export const updateSeries = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedSeries = await updateSeriesById(id, req);
    return res.status(200).json(new ApiResponse(200, { updatedSeries }, 'Series updated successfully'));
  } catch (err: any) {
    throw new ApiError(500, err.message || 'Could not update series');
  }
});

export const deleteSeries = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteSeriesById(id);
    return res.status(200).json(new ApiResponse(200, {}, 'Series deleted successfully'));
  } catch (err: any) {
    throw new ApiError(500, err.message || 'Could not delete series');
  }
});

export const getSeriesDropdown = asyncHandler(async (req: Request, res: Response) => {
  try {
    const seriesList = await fetchSeriesDropdown();
    return res.status(200).json(new ApiResponse(200, { seriesList }, 'Series retrieved successfully'));
  } catch (err: any) {
    throw new ApiError(500, err.message || 'Could not retrieve series');
  }
});
