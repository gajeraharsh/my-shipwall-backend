import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import ApiResponse from '../../utils/apiResponse';

import {
    createCity,
    createIncentive,
    createState,
    deleteCityById,
    deleteIncentiveById,
    deleteStateById,
    fetchCities,
    fetchIncentives,
    fetchStates,
    getCityById,
    getIncentiveById,
    getStateById,
    updateCityById,
    updateIncentiveById,
    updateStateById

} from '../../services//Seller/SettingService';
import ApiError from '../../utils/apiError';


// State Controllers
export const createStateController = asyncHandler(async (req: Request, res: Response) => {
    const state = await createState(req.body);
    return res.status(200).json(new ApiResponse(200, { state }, 'State created successfully'));
});

export const getStatesController = asyncHandler(async (req: Request, res: Response) => {
    const states = await fetchStates(req);
    return res.status(200).json(new ApiResponse(200, { states }, 'States retrieved successfully'));
});

export const getStatesDropdown = asyncHandler(async (req: Request, res: Response) => {
    try {
        const states = await fetchStates(req);
        const statesOptions = states?.results?.map((item: any) => {
            return {
                label: item?.name,
                value: item?._id
            }
        })
        return res.status(200).json(new ApiResponse(200, { options: statesOptions }, 'States retrieved successfully'));
    } catch (err: any) {
        throw new ApiError(500, err.message || 'Could not retrieve States');
    }
});

export const getStateByIdController = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const state = await getStateById(id);
    return res.status(200).json(new ApiResponse(200, { state }, 'State retrieved successfully'));
});

export const updateStateController = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updatedState = await updateStateById(id, req.body);
    return res.status(200).json(new ApiResponse(200, { updatedState }, 'State updated successfully'));
});

export const deleteStateController = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await deleteStateById(id);
    return res.status(200).json(new ApiResponse(200, {}, 'State deleted successfully'));
});

// City Controllers
export const createCityController = asyncHandler(async (req: Request, res: Response) => {
    const city = await createCity(req.body);
    return res.status(200).json(new ApiResponse(200, { city }, 'City created successfully'));
});

export const getCitiesController = asyncHandler(async (req: Request, res: Response) => {
    const cities = await fetchCities(req);
    return res.status(200).json(new ApiResponse(200, { cities }, 'Cities retrieved successfully'));
});

export const getCityByIdController = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const city = await getCityById(id);
    return res.status(200).json(new ApiResponse(200, { city }, 'City retrieved successfully'));
});

export const updateCityController = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updatedCity = await updateCityById(id, req.body);
    return res.status(200).json(new ApiResponse(200, { updatedCity }, 'City updated successfully'));
});

export const deleteCityController = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await deleteCityById(id);
    return res.status(200).json(new ApiResponse(200, {}, 'City deleted successfully'));
});

// Incentive Controllers
export const createIncentiveController = asyncHandler(async (req: Request, res: Response) => {
    const incentive = await createIncentive(req.body);
    return res.status(200).json(new ApiResponse(200, { incentive }, 'Incentive created successfully'));
});

export const getIncentivesController = asyncHandler(async (req: Request, res: Response) => {
    const incentives = await fetchIncentives(req);
    return res.status(200).json(new ApiResponse(200, { incentives }, 'Incentives retrieved successfully'));
});

export const getIncentiveByIdController = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const incentive = await getIncentiveById(id);
    return res.status(200).json(new ApiResponse(200, { incentive }, 'Incentive retrieved successfully'));
});

export const updateIncentiveController = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updatedIncentive = await updateIncentiveById(id, req.body);
    return res.status(200).json(new ApiResponse(200, { updatedIncentive }, 'Incentive updated successfully'));
});

export const deleteIncentiveController = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await deleteIncentiveById(id);
    return res.status(200).json(new ApiResponse(200, {}, 'Incentive deleted successfully'));
});
