// models/rejectionOrder.model.js
const mongoose = require("mongoose");
const paginate = require("./plugins/paginate");
const incrementId = require("./plugins/incrementId");

const RejectionOrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    rejectionOrderId: { type: Number, required: true, unique: true },
    issueImage: { type: String, required: true },
    reason: { type: String, required: true },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
        subtotal: { type: Number, required: true },
        taxAmount: { type: Number, required: true },
        taxPercent: { type: Number, required: true },
        hsnTx: {
          amount: { type: Number, required: false },
          percent: { type: Number, required: false },
          hsnCode: { type: String, required: false },
          taxableValue: { type: String, required: false },
          totalTaxAmount: { type: Number, required: false },
        },
      },
    ],
    subtotal: { type: Number, required: true, default: 0 },
    subTotalIncTax: { type: Number, required: true, default: 0 },
    shippingFee: { type: Number, required: true, default: 0 },
    taxAmount: { type: Number, required: true, default: 0 },
    finalTotal: { type: Number, required: true },
    orderStatus: {
      type: String,
      enum: [
        "Initiated",
        "Pickup_Schedule",
        "PickedUp",
        "Received",
        "Mismatch_Correction",
        "Validated",
        "Approved_Credited",
        "Cancelled",
      ],
      default: "Initiated",
    },
    deliveredAt: { type: Date },
    activities: [
      {
        status: {
          type: String,
          enum: [
            "Initiated",
            "Cancelled",
            "Confirmed",
            "Pickup_Schedule",
            "PickedUp",
            "Received",
            "Mismatch_Correction",
            "Validated",
            "Approved_Credited",
          ],
          required: true,
        },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        note: { type: String },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

RejectionOrderSchema.plugin(paginate);
RejectionOrderSchema.plugin(incrementId, "QREJ00");
RejectionOrderSchema.plugin(incrementId);

module.exports = mongoose.model("RejectionOrder", RejectionOrderSchema);
