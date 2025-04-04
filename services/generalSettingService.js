const ApiError = require("../utils/apiError");
const { status: httpStatus } = require("http-status");

const GeneralSettingModel = require("../models/generalSetting");

const getGeneralSettings = async () => {
  try {
    const generalSettings = await GeneralSettingModel.findOne({});

    if (!generalSettings) {
      return {
        generalshippingcost: 0,
        returnDays: 0,
      };
    }

    return generalSettings;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error fetching general settings"
    );
  }
};

const updateGeneralSettings = async (updateData) => {
  try {
    const generalSettings = await GeneralSettingModel.findOneAndUpdate(
      {},
      updateData,
      { new: true, upsert: true, runValidators: true }
    );

    if (!generalSettings)
      throw new ApiError(httpStatus.NOT_FOUND, "General settings not found");
    return generalSettings;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error updating general settings"
    );
  }
};

module.exports = {
  getGeneralSettings,
  updateGeneralSettings,
};
