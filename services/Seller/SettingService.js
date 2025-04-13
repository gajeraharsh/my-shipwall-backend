const State = require("../../models/State");
const City = require("../../models/City");
const Incentive = require("../../models/Incentive");
const ApiError = require("../../utils/apiError");
const { status: httpStatus } = require("http-status");

// State Services
const createState = async (stateBody) => {
  return await State.create(stateBody);
};

const fetchStates = async (req) => {
  const { page = 1, limit = 5, search = "" } = req?.query;

  try {
    const states = await State.paginate(
      {
        name: { $regex: search, $options: "i" },
      },
      {
        page,
        limit,
      }
    );
    return states;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error retrieving states"
    );
  }
};

const getStateById = async (stateId) => {
  const state = await State.findById(stateId);
  if (!state) throw new ApiError(httpStatus.NOT_FOUND, "State not found");
  return state;
};

const updateStateById = async (stateId, updateData) => {
  const state = await State.findByIdAndUpdate(stateId, updateData, {
    new: true,
    runValidators: true,
  });
  if (!state) throw new ApiError(httpStatus.NOT_FOUND, "State not found");
  return state;
};

const deleteStateById = async (stateId) => {
  const state = await State.findByIdAndDelete(stateId);
  if (!state) throw new ApiError(httpStatus.NOT_FOUND, "State not found");
  return state;
};

// City Services
const createCity = async (cityBody) => {
  return await City.create(cityBody);
};

const fetchCities = async (req) => {
  const { page = 1, limit = 5, search = "" } = req?.query;

  try {
    const cities = await City.paginate(
      {
        name: { $regex: search, $options: "i" },
      },
      {
        page,
        limit,
        populate: [{ path: "state", select: "_id name" }],
      }
    );
    return cities;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error retrieving cities"
    );
  }
};

const getCityById = async (cityId) => {
  const city = await City.findById(cityId).populate("state");
  if (!city) throw new ApiError(httpStatus.NOT_FOUND, "City not found");
  return city;
};

const updateCityById = async (cityId, updateData) => {
  const city = await City.findByIdAndUpdate(cityId, updateData, {
    new: true,
    runValidators: true,
  });
  if (!city) throw new ApiError(httpStatus.NOT_FOUND, "City not found");
  return city;
};

const deleteCityById = async (cityId) => {
  const city = await City.findByIdAndDelete(cityId);
  if (!city) throw new ApiError(httpStatus.NOT_FOUND, "City not found");
  return city;
};

// Incentive Services
const createIncentive = async (incentiveBody) => {
  return await Incentive.create(incentiveBody);
};

const fetchIncentives = async (req) => {
  const { page = 1, limit = 5, search = "", user } = req?.query;

  try {
    const query = {
      $or: [
        {
          $expr: {
            $regexMatch: {
              input: { $toString: "$minAmount" },
              regex: search,
              options: "i",
            },
          },
        },
        {
          $expr: {
            $regexMatch: {
              input: { $toString: "$incentivePercentage" },
              regex: search,
              options: "i",
            },
          },
        },
        {
          $expr: {
            $regexMatch: {
              input: { $toString: "$maxAmount" },
              regex: search,
              options: "i",
            },
          },
        },
      ],
    };

    // Add conditionally filter based on user presence
    if (user) {
      query.user = user;
    } else {
      query.user = { $exists: false };
    }

    const incentives = await Incentive.paginate(query, {
      page,
      limit,
    });

    return incentives;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error retrieving incentives"
    );
  }
};

const getIncentiveById = async (incentiveId) => {
  const incentive = await Incentive.findById(incentiveId);
  if (!incentive)
    throw new ApiError(httpStatus.NOT_FOUND, "Incentive not found");
  return incentive;
};

const updateIncentiveById = async (incentiveId, updateData) => {
  const incentive = await Incentive.findByIdAndUpdate(incentiveId, updateData, {
    new: true,
    runValidators: true,
  });
  if (!incentive)
    throw new ApiError(httpStatus.NOT_FOUND, "Incentive not found");
  return incentive;
};

const deleteIncentiveById = async (incentiveId) => {
  const incentive = await Incentive.findByIdAndDelete(incentiveId);
  if (!incentive)
    throw new ApiError(httpStatus.NOT_FOUND, "Incentive not found");
  return incentive;
};

module.exports = {
  createState,
  fetchStates,
  getStateById,
  updateStateById,
  deleteStateById,
  createCity,
  fetchCities,
  getCityById,
  updateCityById,
  deleteCityById,
  createIncentive,
  fetchIncentives,
  getIncentiveById,
  updateIncentiveById,
  deleteIncentiveById,
};
