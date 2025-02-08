import ApiError from '../utils/apiError';
import httpStatus from 'http-status';
import GeneralSettingModel from '../models/generalSetting';


export const getGeneralSettings = async () => {
    try {
        const generalSettings = await GeneralSettingModel.findOne({});

        return generalSettings || 0;
    } catch (err: any) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error fetching general settings');
    }
};

export const updateGeneralSettings = async (updateData: Partial<{ generalshippingcost: number }>) => {
    try {
        const generalSettings = await GeneralSettingModel.findOneAndUpdate(
            {},
            updateData,
            { new: true, upsert: true, runValidators: true }
        );

        if (!generalSettings) throw new ApiError(httpStatus.NOT_FOUND, 'General settings not found');
        return generalSettings;
    } catch (err: any) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error updating general settings');
    }
};
