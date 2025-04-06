const {
  getGeneralSettings,
  updateGeneralSettings,
} = require("../services/generalSettingService");
const { asyncHandler } = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");

const getGeneralsetting = asyncHandler(async (req, res) => {
  try {
    const genralSetting = await getGeneralSettings();
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { genralSetting },
          "General setting retrieved successfully"
        )
      );
  } catch (err) {
    throw new ApiError(
      500,
      err.message || "Could not retrieve general setting."
    );
  }
});

const updateGeneralSetting = asyncHandler(async (req, res) => {
  try {
    const updateColorMaster = await updateGeneralSettings(req.body);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { updateColorMaster },
          "General setting updated successfully"
        )
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Could not update general settin..");
  }
});

module.exports = {
  getGeneralsetting,
  updateGeneralSetting,
};
