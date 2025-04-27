const { asyncHandler } = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");
const {
  createOrderReward,
  deleteRewardById,
  fetchOrderRewards,
  getRewardsByIdService,
  updateRewardById,
} = require("../services/rewardService");

const createReward = asyncHandler(async (req, res) => {
  try {
    const reward = await createOrderReward(req);
    return res
      .status(200)
      .json(new ApiResponse(200, { reward }, "Reward Successfully"));
  } catch (err) {
    throw new ApiError(500, err.message || "Not created");
  }
});

const getRewards = asyncHandler(async (req, res) => {
  try {
    const rewards = await fetchOrderRewards(req);
    return res
      .status(200)
      .json(
        new ApiResponse(200, { rewards }, "Rewards retrieved successfully")
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Could not retrieve rewards");
  }
});

const getRewardById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const reward = await getRewardsByIdService(id);
    return res
      .status(200)
      .json(new ApiResponse(200, { reward }, "Reward retrieved successfully"));
  } catch (err) {
    throw new ApiError(500, err.message || "Could not retrieve reward");
  }
});

const updateReward = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const reward = await updateRewardById(id, req);
    return res
      .status(200)
      .json(new ApiResponse(200, { reward }, "Reward updated successfully"));
  } catch (err) {
    throw new ApiError(500, err.message || "Could not update reward");
  }
});

const deleteReward = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    await deleteRewardById(id);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Reward deleted successfully"));
  } catch (err) {
    throw new ApiError(500, err.message || "Could not delete reward");
  }
});

module.exports = {
  createReward,
  getRewards,
  getRewardById,
  updateReward,
  deleteReward,
};
