import mongoose, { Schema, Document } from "mongoose";

// Cart Product Interface
interface CartProduct {
    product: mongoose.Schema.Types.ObjectId;
    quantity: number;
    price: number;
    subtotal: number;
}

// Cart Document Interface
export interface ICart extends Document {
    user: mongoose.Schema.Types.ObjectId;
    products: CartProduct[];
    subtotal: number;
    shippingFee: number;
    totalAmount: number;
}

// Cart Schema
const CartSchema: Schema = new Schema<ICart>(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        products: [
            {
                product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
                quantity: { type: Number, required: true, min: 1 },
                price: { type: Number, required: true },
                subtotal: { type: Number, required: true },
            },
        ],
        subtotal: { type: Number, required: true, default: 0 },
        shippingFee: { type: Number, required: true, default: 0 },
        totalAmount: { type: Number, required: true, default: 0 },
    },
    { timestamps: true }
);

export default mongoose.model<ICart>("Cart", CartSchema);
