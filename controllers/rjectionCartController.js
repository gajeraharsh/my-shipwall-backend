const { asyncHandler } = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");

const {
  getCartService,
  removeFromCartService,
  updateCartService,
} = require("../services/rejectionCartService");

const addToCartRjection = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user._id; // Assuming `req.user.id` is populated via authentication middleware

  if (!productId) {
    res.status(500).json(new ApiResponse(200, {}, "Product id required."));
  }

  const cart = await updateCartService(userId, productId, quantity);
  res.status(200).json(new ApiResponse(200, cart, "Product added to cart"));
});

const removeFromCartRjection = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const userId = req.user._id;
  const cart = await removeFromCartService(userId, productId);
  res.status(200).json(new ApiResponse(200, cart, "Product removed from cart"));
});

const getCartRjection = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const cart = await getCartService(userId);
  res
    .status(200)
    .json(new ApiResponse(200, cart, "Cart retrieved successfully"));
});

module.exports = {
  addToCartRjection,
  removeFromCartRjection,
  getCartRjection,
};
