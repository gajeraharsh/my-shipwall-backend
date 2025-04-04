// models/refund.model.js
const mongoose = require("mongoose");

const RefundSchema = new mongoose.Schema(
    {
        returnOrder: { type: mongoose.Schema.Types.ObjectId, ref: "ReturnOrder", default: null },
        rejectionOrder: { type: mongoose.Schema.Types.ObjectId, ref: "RejectionOrder", default: null },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        amount: { type: Number, required: true },
        sourceType: {
            type: String,
            enum: ["Order", "RejectionOrder"],
            required: true,
        },
        status: {
            type: String,
            enum: ["Initiated", "Processed", "Failed"],
            default: "Processed",
        },
        note: { type: String },
        initiatedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Refund", RefundSchema);
