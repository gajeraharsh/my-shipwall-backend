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
const CustomerRewardCredit = require("../models/CustomerRewardCredit");

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

//reward activity
const getRewardCreditHistory = asyncHandler(async (req, res) => {
  try {
    const page = req?.query?.page;
    const limit = req?.query?.limit;
    const query = req?.query?.search || "";
    const userId = req.params?.id;

    console.log(userId, "userId");

    const creditHistory = await CustomerRewardCredit.paginate(
      {
        user: userId,
      },
      {
        page,
        limit,
        populate: [
          {
            path: "referenceId",
            select: "_id id orderStatus finalTotal createdAt",
          },
        ],
        sortBy: "createdAt:desc",
      }
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { creditHistory },
          "creditHistory retrieved successfully"
        )
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Could not retrieve creditHistory");
  }
});

module.exports = {
  createReward,
  getRewards,
  getRewardById,
  updateReward,
  deleteReward,
  getRewardCreditHistory,
};
