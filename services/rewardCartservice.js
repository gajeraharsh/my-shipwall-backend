const ApiError = require("../utils/apiError");
const GeneralSettingModel = require("../models/generalSetting");
const RewardProducts = require("../models/RewardProducts");
const RewardCart = require("../models/rewardCart");

// Helper function to calculate cart totals
const calculateTotals = async (cart) => {
  let subtotal = 0;
  cart.products.forEach((item) => {
    const quantity = item.quantity;
    const pricePerItem = Math.round(item.price * quantity);

    const productPrice = parseFloat(pricePerItem);
    const totalProductValue = productPrice;

    item.subtotal = Math.round(totalProductValue * 100) / 100;

    subtotal += totalProductValue;
  });

  const generalSettings = await GeneralSettingModel.findOne();
  const shippingFee =
    cart.products.length > 0 && generalSettings
      ? generalSettings.generalshippingcost
      : 0;

  const totalAmount = subtotal + shippingFee;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    shippingFee: Math.round(shippingFee * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
  };
};

// Add or update cart quantity (single API for + / - / remove)
const updateRewardCartService = async (userId, productId, quantity) => {
  if (quantity < 0) throw new ApiError(400, "Quantity cannot be negative");

  const product = await RewardProducts.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");

  let cart = await RewardCart.findOne({ user: userId });

  if (!cart) {
    cart = new RewardCart({ user: userId, products: [] });
  }

  const existingProduct = cart.products.find(
    (item) => item.product.toString() === productId
  );

  const pricePerItem = product.price;
  const totalValue = pricePerItem * quantity;

  if (existingProduct) {
    if (quantity === 0) {
      // Remove product from cart
      cart.products = cart.products.filter(
        (item) => item.product.toString() !== productId
      );
    } else {
      // Update quantity and validate stock
      if (quantity > product.stock)
        throw new ApiError(
          400,
          `Only ${product.stock} items available in stock`
        );

      existingProduct.quantity = quantity;
      existingProduct.subtotal = totalValue;
      existingProduct.boxPrice = pricePerItem;
      existingProduct.price = product.price;
    }
  } else {
    if (quantity > 0) {
      // Add new product to cart
      cart.products.push({
        product: product._id,
        quantity,
        price: product.price,
        subtotal: totalValue,
        boxPrice: pricePerItem,
      });
    }
  }

  // Recalculate totals
  const totals = await calculateTotals(cart);

  Object.assign(cart, totals);
  cart.markModified("products");
  await cart.save();
  return cart;
};

// Remove item from cart
const removeRewardFromCartService = async (userId, productId) => {
  const cart = await RewardCart.findOne({ user: userId });
  if (!cart) throw new ApiError(404, "Cart not found");

  // Filter out the product
  cart.products = cart.products.filter(
    (item) => item.product.toString() !== productId
  );

  // Recalculate totals
  Object.assign(cart, await calculateTotals(cart));
  cart.markModified("products");

  await cart.save();
  return cart;
};

// Get cart items grouped by series
const getRewardCartService = async (userId) => {
  const cart = await RewardCart.findOne({ user: userId })
    .populate({
      path: "products.product",
    })
    .exec();

  if (!cart) throw new ApiError(404, "Cart not found");

  return cart;
};

const saveRewardCartShippingDetailsService = async (userId, body) => {
  const cart = await RewardCart.findOne({ user: userId });
  if (!cart) throw new ApiError(404, "Cart not found");
  cart.shippingDetails = body?.shippingDetails;
  cart.markModified("shippingDetails");
  await cart.save();
  return cart;
};

module.exports = {
  updateRewardCartService,
  removeRewardFromCartService,
  getRewardCartService,
  saveRewardCartShippingDetailsService,
};
