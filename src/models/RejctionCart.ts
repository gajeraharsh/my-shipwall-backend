import mongoose, { Schema, Document } from "mongoose";

interface HSNTx {
    amount: number;
    percent: number;
    hsnCode: string;
    taxableValue: string;
    totalTaxAmount: number;
}

// Rejection Cart Product Interface
interface RejectionCartProduct {
    product: mongoose.Schema.Types.ObjectId;
    quantity: number;
    price: number;
    subtotal: number;
    boxQuantity: number;
    boxPrice: number;
    taxAmount: number;
    taxPercent: number;
    hsnTx: HSNTx;
}

// Rejection Cart Document Interface
export interface IRejectionCart extends Document {
    user: mongoose.Schema.Types.ObjectId;
    products: RejectionCartProduct[];
    subtotal: number;
    shippingFee: number;
    totalAmount: number;
    taxAmount: number;
    subTotalIncTax: number;
}

// Rejection Cart Schema
const RejectionCartSchema: Schema = new Schema<IRejectionCart>(
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

export default mongoose.model<IRejectionCart>("RejectionCart", RejectionCartSchema);
