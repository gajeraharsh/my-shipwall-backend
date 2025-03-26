// models/refund.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IRefund extends Document {
    order?: mongoose.Types.ObjectId;            // for regular order refund
    rejectionOrder?: mongoose.Types.ObjectId;   // for rejection order refund
    user: mongoose.Types.ObjectId;
    amount: number;
    sourceType: "Order" | "RejectionOrder";
    status: "Initiated" | "Processed" | "Failed";
    note?: string;
    initiatedAt: Date;
}

const RefundSchema: Schema = new Schema(
    {
        order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
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

export default mongoose.model<IRefund>("Refund", RefundSchema);
