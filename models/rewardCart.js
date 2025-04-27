const mongoose = require("mongoose");
const { Schema } = mongoose;

// Cart Schema
const rewardCartSchema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "RewardProduct",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
        subtotal: { type: Number, required: true },
      },
    ],
    shippingDetails: {
      line1: { type: String, required: false },
      line2: { type: String },
      pincode: { type: String, required: false },
      state: { type: mongoose.Types.ObjectId, ref: "State", default: null },
      city: { type: mongoose.Types.ObjectId, ref: "City", default: null },
      country: { type: String, required: false },
      landmark: { type: String, required: false },
    },

    subtotal: { type: Number, required: true, default: 0 },
    shippingFee: { type: Number, required: true, default: 0 },
    totalAmount: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RewardCart", rewardCartSchema);
