import mongoose, { Schema, Document } from "mongoose";
import paginate from "./plugins/paginate";
import incrementId from "./plugins/incrementId";

interface HSNTx {
    amount: number;
    percent: number;
    hsnCode: string;
    taxableValue: string;
    totalTaxAmount: number;
}

// Rejection Order Product Interface
interface RejectionOrderProduct {
    product: mongoose.Schema.Types.ObjectId;
    quantity: number;
    price: number;
    subtotal: number;
    taxAmount: number;
    subTotalIncTax: number;
    taxPercent: number;
    hsnTx: HSNTx;
}

// Rejection Order Document Interface
export interface IRejectionOrder extends Document {
    user: mongoose.Schema.Types.ObjectId;
    rejectionOrderId: Number;
    products: RejectionOrderProduct[];
    finalTotal: number;
    orderStatus: "Initiated" | "Cancelled" | "Confirmed" | "Pickup_Schedule" | "PickedUp" | "Received" | "Mismatch_Correction" | "Validated" | "Approved_Credited";
    deliveredAt?: Date;
    issueImage?: string;
    reason?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Rejection Order Schema
const RejectionOrderSchema: Schema = new Schema<any>(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        rejectionOrderId: { type: Number, required: true, unique: true },
        issueImage: { type: String, required: true },
        reason: { type: String, required: true },
        products: [
            {
                product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
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
                }
            },
        ],
        subtotal: { type: Number, required: true, default: 0 },
        subTotalIncTax: { type: Number, required: true, default: 0 },
        shippingFee: { type: Number, required: true, default: 0 },
        taxAmount: { type: Number, required: true, default: 0 },
        finalTotal: { type: Number, required: true },
        orderStatus: {
            type: String,
            enum: ["Initiated", "Pickup_Schedule", "PickedUp", "Received", "Mismatch_Correction", "Validated", "Approved_Credited", "Cancelled"],
            default: "Initiated",
        },
        deliveredAt: {
            type: Date,
        },
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
                        "Approved_Credited"
                    ],
                    required: true
                },
                updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
                note: { type: String },
                updatedAt: { type: Date, default: Date.now }
            }
        ],

    },
    { timestamps: true }
);

RejectionOrderSchema.plugin(paginate);
RejectionOrderSchema.plugin(incrementId, "QREJ00");
RejectionOrderSchema.plugin(incrementId);

export default mongoose.model<IRejectionOrder, any>("RejectionOrder", RejectionOrderSchema);
