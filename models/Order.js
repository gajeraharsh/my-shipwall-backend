const mongoose = require("mongoose");
const { Schema } = mongoose;
const paginate = require("./plugins/paginate");
const incrementId = require("./plugins/incrementId");
const autoIncrementId = require("./plugins/autoIncrementId");

const OrderSchema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderId: { type: Number, required: true, unique: true },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
        boxQuantity: { type: Number, required: true },
        boxPrice: { type: Number, required: true },
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
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      phone: { type: String, required: true },
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
      unique:true
    },
  },
  { timestamps: true }
);

OrderSchema.virtual("returnOrder", {
  ref: "ReturnOrder",
  localField: "_id",
  foreignField: "order",
  justOne: true,
  match: { returnStatus: { $ne: "Cancelled" } },
});

OrderSchema.set("toObject", { virtuals: true });
OrderSchema.set("toJSON", { virtuals: true });

OrderSchema.plugin(paginate);
OrderSchema.plugin(incrementId, "QVAPOR");
OrderSchema.plugin(incrementId);
OrderSchema.plugin(autoIncrementId, {
  field: "recipientId",      // field to be auto-generated
  prefix: "QVAP",            // prefix for the ID
  counterKey: "recipientId", // internal tracker ID
});

module.exports = mongoose.model("Order", OrderSchema);
