const mongoose = require("mongoose");
const incrementId = require("./plugins/incrementId");
const paginate = require("./plugins/paginate");

const creditHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },
    description: {
      type: String,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "referenceModel",
    },
    referenceModel: {
      type: String,
      enum: ["ReturnOrder", "RejectionOrder", "Order"], // Add more as needed
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

creditHistorySchema.plugin(paginate);
creditHistorySchema.plugin(incrementId, "QVACREDIT");

module.exports = mongoose.model("CreditWalletHistory", creditHistorySchema);
