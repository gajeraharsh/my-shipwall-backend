import State from '../../models/State';
import City from '../../models/City';
import Incentive from '../../models/Incentive';
import ApiError from '../../utils/apiError';
import httpStatus from 'http-status';

// State Services
export const createState = async (stateBody: any) => {
    return await State.create(stateBody);
};

export const fetchStates = async (req: any) => {

    const {
        page = 1,
        limit = 5,
        search = ''
    } = req?.query



    try {
        const states = await State.paginate({
            name: { $regex: search, $options: 'i' }
        }, {
            page,
            limit,
        });
        return states;
    } catch (err) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving states');
    }
};

export const getStateById = async (stateId: string) => {
    const state = await State.findById(stateId);
    if (!state) throw new ApiError(httpStatus.NOT_FOUND, 'State not found');
    return state;
};

export const updateStateById = async (stateId: string, updateData: Partial<any>) => {
    const state = await State.findByIdAndUpdate(stateId, updateData, { new: true, runValidators: true });
    if (!state) throw new ApiError(httpStatus.NOT_FOUND, 'State not found');
    return state;
};

export const deleteStateById = async (stateId: string) => {
    const state = await State.findByIdAndDelete(stateId);
    if (!state) throw new ApiError(httpStatus.NOT_FOUND, 'State not found');
    return state;
};

// City Services
export const createCity = async (cityBody: any) => {
    return await City.create(cityBody);
};

export const fetchCities = async (req: any) => {

    const {
        page = 1,
        limit = 5,
        search = ''
    } = req?.query

    try {
        const cities = await City.paginate({
            name: { $regex: search, $options: 'i' }
        }, {
            page,
            limit,
            populate: [
                { path: 'state', select: '_id name' },
            ]
        });
        return cities;
    } catch (err) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving cities');
    }
};

export const getCityById = async (cityId: string) => {
    const city = await City.findById(cityId).populate('state');
    if (!city) throw new ApiError(httpStatus.NOT_FOUND, 'City not found');
    return city;
};

export const updateCityById = async (cityId: string, updateData: Partial<any>) => {
    const city = await City.findByIdAndUpdate(cityId, updateData, { new: true, runValidators: true });
    if (!city) throw new ApiError(httpStatus.NOT_FOUND, 'City not found');
    return city;
};

export const deleteCityById = async (cityId: string) => {
    const city = await City.findByIdAndDelete(cityId);
    if (!city) throw new ApiError(httpStatus.NOT_FOUND, 'City not found');
    return city;
};

// Incentive Services
export const createIncentive = async (incentiveBody: any) => {
    return await Incentive.create(incentiveBody);
};

export const fetchIncentives = async (req: any) => {
    const {
        page = 1,
        limit = 5,
        search = ''
    } = req?.query

    try {
        const incentives = await Incentive.paginate({
            $or: [
                { $expr: { $regexMatch: { input: { $toString: "$minAmount" }, regex: search, options: "i" } } },
                { $expr: { $regexMatch: { input: { $toString: "$incentivePercentage" }, regex: search, options: "i" } } },
                { $expr: { $regexMatch: { input: { $toString: "$maxAmount" }, regex: search, options: "i" } } }
            ]
        }, {
            page,
            limit,
        });
        return incentives;

    } catch (err) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving incentives');
    }
};

export const getIncentiveById = async (incentiveId: string) => {
    const incentive = await Incentive.findById(incentiveId);
    if (!incentive) throw new ApiError(httpStatus.NOT_FOUND, 'Incentive not found');
    return incentive;
};

export const updateIncentiveById = async (incentiveId: string, updateData: Partial<any>) => {
    const incentive = await Incentive.findByIdAndUpdate(incentiveId, updateData, { new: true, runValidators: true });
    if (!incentive) throw new ApiError(httpStatus.NOT_FOUND, 'Incentive not found');
    return incentive;
};

export const deleteIncentiveById = async (incentiveId: string) => {
    const incentive = await Incentive.findByIdAndDelete(incentiveId);
    if (!incentive) throw new ApiError(httpStatus.NOT_FOUND, 'Incentive not found');
    return incentive;
};