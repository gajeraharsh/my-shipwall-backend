const { asyncHandler } = require("../utils/asyncHandler");
const {
  addToReturnCartService,
  getCartService,
  removeFromCartService,
} = require("../services/returnCartService");
const ApiResponse = require("../utils/apiResponse");

const addToCartReturn = asyncHandler(async (req, res) => {
  const { productId, quantity, orderId } = req.body;
  const userId = req.user._id; // Assuming `req.user.id` is populated via authentication middleware

  if (!productId) {
    res.status(500).json(new ApiResponse(200, {}, "Product id required."));
  }

  const cart = await addToReturnCartService(
    userId,
    orderId,
    productId,
    quantity
  );
  res.status(200).json(new ApiResponse(200, cart, "Product added to cart"));
});

const removeFromCartReturn = asyncHandler(async (req, res) => {
  const { productId, orderId } = req.params;
  const userId = req.user._id;
  const cart = await removeFromCartService(userId, orderId, productId);
  res.status(200).json(new ApiResponse(200, cart, "Product removed from cart"));
});

const getCartReturn = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const orderId = req.query?.orderId;
  const cart = await getCartService(userId, orderId);
  res
    .status(200)
    .json(new ApiResponse(200, cart, "Cart retrieved successfully"));
});

module.exports = {
  addToCartReturn,
  removeFromCartReturn,
  getCartReturn,
};
