const { asyncHandler } = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");
const ApiError = require("../../utils/apiError");

const {
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
  updateStateById,
  fetchStatesForWeb,
  fetchCitiesForWeb,
} = require("../../services/Seller/SettingService");


// State Controllers
const createStateController = asyncHandler(async (req, res) => {
  const state = await createState(req.body);
  return res
    .status(200)
    .json(new ApiResponse(200, { state }, "State created successfully"));
});

const getStatesController = asyncHandler(async (req, res) => {
  const states = await fetchStatesForWeb(req);
  return res
    .status(200)
    .json(new ApiResponse(200, { states }, "States retrieved successfully"));
});

const getStatesDropdown = asyncHandler(async (req, res) => {
  try {
    const states = await fetchStates(req);
    const statesOptions = states?.results?.map((item) => {
      return {
        label: item?.name,
        value: item?._id,
      };
    });
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { options: statesOptions },
          "States retrieved successfully"
        )
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Could not retrieve States");
  }
});

const getStateByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const state = await getStateById(id);
  return res
    .status(200)
    .json(new ApiResponse(200, { state }, "State retrieved successfully"));
});

const updateStateController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedState = await updateStateById(id, req.body);
  return res
    .status(200)
    .json(new ApiResponse(200, { updatedState }, "State updated successfully"));
});

const deleteStateController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await deleteStateById(id);
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "State deleted successfully"));
});

// City Controllers
const createCityController = asyncHandler(async (req, res) => {
  const city = await createCity(req.body);
  return res
    .status(200)
    .json(new ApiResponse(200, { city }, "City created successfully"));
});

const getCitiesController = asyncHandler(async (req, res) => {
  const cities = await fetchCitiesForWeb(req);
  return res
    .status(200)
    .json(new ApiResponse(200, { cities }, "Cities retrieved successfully"));
});

const getCityByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const city = await getCityById(id);
  return res
    .status(200)
    .json(new ApiResponse(200, { city }, "City retrieved successfully"));
});

const getCitiesDropdown = asyncHandler(async (req, res) => {
  try {
    const data = await fetchCities(req);
    const options = data?.results?.map((item) => {
      return {
        label: item?.name,
        value: item?._id,
      };
    });
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { options: options },
          "Cities retrieved successfully"
        )
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Could not retrieve Cities");
  }
});

const updateCityController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedCity = await updateCityById(id, req.body);
  return res
    .status(200)
    .json(new ApiResponse(200, { updatedCity }, "City updated successfully"));
});

const deleteCityController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await deleteCityById(id);
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "City deleted successfully"));
});

// Incentive Controllers
const createIncentiveController = asyncHandler(async (req, res) => {
  const incentive = await createIncentive(req.body);
  return res
    .status(200)
    .json(
      new ApiResponse(200, { incentive }, "Incentive created successfully")
    );
});

const getIncentivesController = asyncHandler(async (req, res) => {
  const incentives = await fetchIncentives(req);
  return res
    .status(200)
    .json(
      new ApiResponse(200, { incentives }, "Incentives retrieved successfully")
    );
});

const getIncentiveByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const incentive = await getIncentiveById(id);
  return res
    .status(200)
    .json(
      new ApiResponse(200, { incentive }, "Incentive retrieved successfully")
    );
});

const updateIncentiveController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedIncentive = await updateIncentiveById(id, req.body);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { updatedIncentive },
        "Incentive updated successfully"
      )
    );
});

const deleteIncentiveController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await deleteIncentiveById(id);
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Incentive deleted successfully"));
});

module.exports = {
  createStateController,
  getStatesController,
  getStatesDropdown,
  getStateByIdController,
  updateStateController,
  deleteStateController,
  createCityController,
  getCitiesController,
  getCityByIdController,
  getCitiesDropdown,
  updateCityController,
  deleteCityController,
  createIncentiveController,
  getIncentivesController,
  getIncentiveByIdController,
  updateIncentiveController,
  deleteIncentiveController,
};
