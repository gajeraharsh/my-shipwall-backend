// models/rejectionCart.model.js
const mongoose = require("mongoose");

const RejectionCartSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        products: [
            {
                product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
                quantity: { type: Number, required: true, min: 1 },
                price: { type: Number, required: true },
                subtotal: { type: Number, required: true },
                taxAmount: { type: Number, required: true },
                taxPercent: { type: Number, required: true },
                hsnTx: {
                    amount: { type: Number, required: true },
                    percent: { type: Number, required: true },
                    hsnCode: { type: String, required: true },
                    taxableValue: { type: String, required: true },
                    totalTaxAmount: { type: Number, required: true },
                }
            },
        ],
        subtotal: { type: Number, required: true, default: 0 },
        shippingFee: { type: Number, required: true, default: 0 },
        taxAmount: { type: Number, required: true, default: 0 },
        totalAmount: { type: Number, required: true, default: 0 },
        subTotalIncTax: { type: Number, required: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("RejectionCart", RejectionCartSchema);
