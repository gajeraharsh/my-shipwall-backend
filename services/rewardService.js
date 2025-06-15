const ApiError = require("../utils/apiError");
const { status: httpStatus } = require("http-status");

const Rewards = require("../models/Rewards");

const createOrderReward = async (req) => {
  const data = req?.body;

  const input = {
    ...data,
  };
  return await Rewards.create(input);
};

/**
 * Query for banner with pagination and options
 * @param {Object} options - Query options (e.g., pagination, sort, populate)
 * @returns {Promise<QueryResult>}
 */

const fetchOrderRewards = async (req) => {
  try {
    const page = req?.query?.page;
    const limit = req?.query?.limit;
    const query = req?.query?.search || "";
    const sortField = req?.query?.sortField || "createdAt";
    const sortOrder = req?.query?.sortOrder === "asc" ? "asc" : "desc";
    const sortOptions = {};

    const queryString = query.trim();
    const queryNumber =
      !isNaN(queryString) && queryString !== ""
        ? parseFloat(queryString)
        : null;
    const searchQuery = {};
    if (queryNumber !== null) {
      // If the query is a valid number, apply it as an equality check for numeric fields
      searchQuery.minAmount = queryNumber;
      searchQuery.maxAmount = queryNumber;
      searchQuery.rewardPoints = queryNumber;
    }
    sortOptions[sortField] = sortOrder;

    sortByString = Object.entries(sortOptions)
      .map(([key, val]) => `${key}:${val}`)
      .join(",");

    const rewards = await Rewards.paginate(searchQuery, {
      page,
      limit,
      sortBy: sortByString,
    });

    if (!rewards) {
      throw new ApiError(httpStatus.NOT_FOUND, "No Rewards found");
    }

    return rewards;
  } catch (err) {
    console.log(err);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error retrieving rewards"
    );
  }
};

const getRewardsByIdService = async (id) => {
  try {
    const reward = await Rewards.findById(id);

    if (!reward) {
      throw new ApiError(httpStatus.NOT_FOUND, "Reward not found");
    }

    return reward;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error retrieving reward"
    );
  }
};

const updateRewardById = async (id, req) => {
  try {
    const data = req?.body;

    const input = {
      ...data,
    };

    const reward = await Rewards.findByIdAndUpdate(id, input, {
      new: true,
      runValidators: true,
    });
    if (!reward) throw new ApiError(httpStatus.NOT_FOUND, "Reward not found");
    return reward;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error updating reward"
    );
  }
};

const deleteRewardById = async (id) => {
  try {
    const reward = await Rewards.findByIdAndDelete(id);
    if (!reward) throw new ApiError(httpStatus.NOT_FOUND, "Reward not found");
    return reward;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error deleting reward"
    );
  }
};

module.exports = {
  createOrderReward,
  fetchOrderRewards,
  getRewardsByIdService,
  updateRewardById,
  deleteRewardById,
};
