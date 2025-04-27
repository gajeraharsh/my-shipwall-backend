const mongoose = require("mongoose");
const { Schema } = mongoose;
const paginate = require("./plugins/paginate");
const incrementId = require("./plugins/incrementId");
const autoIncrementId = require("./plugins/autoIncrementId");

const rewardOrderSchema = new Schema(
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
    subtotal: { type: Number, required: true, default: 0 },
    shippingFee: { type: Number, required: true, default: 0 },
    finalTotal: { type: Number, required: true },
    orderStatus: {
      type: String,
      enum: [
        "initiated",
        "Received",
        "Cancelled",
        "packing",
        "dispatch",
        "InLogistic",
        "delevered",
      ],
      default: "initiated",
    },
    shippingDetails: {
      line1: { type: String, required: false },
      line2: { type: String },
      pincode: { type: String, required: false },
      state: { type: mongoose.Types.ObjectId, ref: "State", default: null },
      city: { type: mongoose.Types.ObjectId, ref: "City", default: null },
      country: { type: String, required: false },
      landmark: { type: String, required: false },
    },
    paymentStatus: {
      type: String,
      enum: ["Awaiting Payment", "Paid", "Failed", "Refunded"],
      default: "Awaiting Payment",
    },
    paymentId: {
      type: String,
    },
    paymentRemark: {
      type: String,
    },
    paymentMode: {
      type: String,
      enum: ["E-Pay", "Cheque", "Cash"],
    },
    trackingId: {
      type: String,
    },
    trackingLink: {
      type: String,
    },
    transportName: {
      type: String,
    },
    sapInvoideNumber: {
      type: String,
    },
    eWayBillNo: {
      type: String,
    },
    uploadlr: {
      type: String,
    },
    deliveredAt: {
      type: Date,
    },
    recipientId: {
      type: String,
    },
  },
  { timestamps: true }
);

rewardOrderSchema.plugin(paginate);
rewardOrderSchema.plugin(incrementId, "QVAPOR");

module.exports = mongoose.model("RewardOrder", rewardOrderSchema);
