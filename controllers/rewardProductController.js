const { asyncHandler } = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");
const {
  createRewarProductsService,
  deleteRewardProductById,
  fetchRewardsProdcts,
  getRewardProductsByIdService,
  updateRewardProductById,
} = require("../services/rewardProductService");

const createRewardProduct = asyncHandler(async (req, res) => {
  try {
    const rewardProduct = await createRewarProductsService(req);
    return res
      .status(200)
      .json(
        new ApiResponse(200, { rewardProduct }, "Reward product Successfully")
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Not created");
  }
});

const getRewardProducts = asyncHandler(async (req, res) => {
  try {
    const rewards = await fetchRewardsProdcts(req);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { rewards },
          "Reward products retrieved successfully"
        )
      );
  } catch (err) {
    throw new ApiError(
      500,
      err.message || "Could not retrieve rewards products"
    );
  }
});

const getRewardProductById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const rewardProduct = await getRewardProductsByIdService(id);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { rewardProduct },
          "Reward product retrieved successfully"
        )
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Could not retrieve reward product");
  }
});

const updateRewardProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const rewardProduct = await updateRewardProductById(id, req);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { rewardProduct },
          "Reward product updated successfully"
        )
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Could not update reward product");
  }
});

const deleteRewardProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    await deleteRewardProductById(id);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Reward product deleted successfully"));
  } catch (err) {
    throw new ApiError(500, err.message || "Could not delete reward product");
  }
});

module.exports = {
  createRewardProduct,
  getRewardProducts,
  getRewardProductById,
  updateRewardProduct,
  deleteRewardProduct,
};
