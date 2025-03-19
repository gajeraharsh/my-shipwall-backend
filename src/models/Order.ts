import mongoose, { Schema, Document } from "mongoose";
import paginate from "./plugins/paginate";
import incrementId from "./plugins/incrementId";

// Order Product Interface
interface OrderProduct {
    product: mongoose.Schema.Types.ObjectId;
    quantity: number;
    price: number;
    subtotal: number;
}

// Order Document Interface
export interface IOrder extends Document {
    user: mongoose.Schema.Types.ObjectId;
    orderId: Number;
    products: OrderProduct[];
    finalTotal: number;
    orderStatus: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled" | "Returned";
    paymentStatus: "Pending" | "Paid" | "Failed" | "Refunded";
    shippingDetails: {
        address: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        phone: string;
    };
    deliveredAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

// Order Schema
const OrderSchema: Schema = new Schema<IOrder>(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        orderId: { type: Number, required: true, unique: true },
        products: [
            {
                product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
                quantity: { type: Number, required: true, min: 1 },
                price: { type: Number, required: true },
                subtotal: { type: Number, required: true },
            },
        ],
        finalTotal: { type: Number, required: true },
        orderStatus: {
            type: String,
            enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Returned"],
            default: "Pending",
        },
        paymentStatus: {
            type: String,
            enum: ["Pending", "Paid", "Failed", "Refunded"],
            default: "Pending",
        },
        shippingDetails: {
            address: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            postalCode: { type: String, required: true },
            country: { type: String, required: true },
            phone: { type: String, required: true },
        },
        deliveredAt: {
            type: Date,
        }
    },
    { timestamps: true }
);

OrderSchema.plugin(paginate);
OrderSchema.plugin(incrementId);


export default mongoose.model<IOrder, any>("Order", OrderSchema);
