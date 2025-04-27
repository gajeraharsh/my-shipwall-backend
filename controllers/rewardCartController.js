const { asyncHandler } = require("../utils/asyncHandler");
const {
  getRewardCartService,
  updateRewardCartService,
  removeRewardFromCartService,
  saveRewardCartShippingDetailsService,
} = require("../services/rewardCartservice");
const ApiResponse = require("../utils/apiResponse");

const addToCartReward = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user._id; // Assuming `req.user.id` is populated via authentication middleware

  if (!productId) {
    res.status(500).json(new ApiResponse(200, {}, "Product id required."));
  }

  const cart = await updateRewardCartService(userId, productId, quantity);
  res.status(200).json(new ApiResponse(200, cart, "Product added to cart"));
});

const removeFromCartReward = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const userId = req.user._id;
  const cart = await removeRewardFromCartService(userId, productId);
  res.status(200).json(new ApiResponse(200, cart, "Product removed from cart"));
});

const getCartReward = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const cart = await getRewardCartService(userId);
  res
    .status(200)
    .json(new ApiResponse(200, cart, "Cart retrieved successfully"));
});

const saveCartRewardShippingAddress = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const cart = await saveRewardCartShippingDetailsService(userId, req?.body);
  res
    .status(200)
    .json(new ApiResponse(200, cart, "Shipping address saved successfully"));
});

module.exports = {
  addToCartReward,
  removeFromCartReward,
  getCartReward,
  saveCartRewardShippingAddress,
};
