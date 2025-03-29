import mongoose, { Schema, Document } from "mongoose";
import paginate from "./plugins/paginate";
import incrementId from "./plugins/incrementId";

// HSN Tax Interface
interface HSNTx {
    amount: number;
    percent: number;
    hsnCode: string;
    taxableValue: string;
    totalTaxAmount: number;
}

// Order Product Interface
interface ReturnOrderProduct {
    product: mongoose.Schema.Types.ObjectId;
    quantity: number;
    price: number;
    subtotal: number;
    boxQuantity: number;
    boxPrice: number;
    taxAmount: number;
    subTotalIncTax: number;
    taxPercent: number;
    hsnTx: HSNTx;
}

// Return Order Document Interface
export interface IReturnOrder extends Document {
    originalOrderId: mongoose.Schema.Types.ObjectId;
    returnOrderId: number;
    products: ReturnOrderProduct[];
    reason: string;
    comments?: string;
    refundStatus: "Initiated" | "Approved" | "Rejected" | "Credited";
    returnStatus: "Requested" | "Approved" | "PickedUp" | "Inspected" | "Completed" | "Rejected";
    createdAt: Date;
    updatedAt: Date;
}

const ReturnOrderSchema: Schema = new Schema(
    {
        issueImage: { type: String, required: true },
        reason: { type: String, required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        products: [
            {
                product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
                quantity: { type: Number, required: true },
                boxQuantity: { type: Number, required: true },
                boxPrice: { type: Number, required: true },
                price: { type: Number, required: true },
                subtotal: { type: Number, required: true },
                taxAmount: { type: Number, required: true },
                taxPercent: { type: Number, required: true },
                hsnTx: {
                    amount: { type: Number },
                    percent: { type: Number },
                    hsnCode: { type: String },
                    taxableValue: { type: String },
                    totalTaxAmount: { type: Number },
                },
            },
        ],
        subtotal: { type: Number, required: true, default: 0 },
        subTotalIncTax: { type: Number, required: true, default: 0 },
        shippingFee: { type: Number, required: true, default: 0 },
        taxAmount: { type: Number, required: true, default: 0 },
        finalTotal: { type: Number, required: true },

        returnStatus: {
            type: String,
            enum: ["Initiated", "Pickup_Schedule", "PickedUp", "Received", "Mismatch_Correction", "Validated", "Approved_Credited", "Cancelled"],
            default: "Initiated",
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
        order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    },
    { timestamps: true }
);

ReturnOrderSchema.plugin(paginate);
ReturnOrderSchema.plugin(incrementId, "QRETURN");
ReturnOrderSchema.plugin(incrementId);

export default mongoose.model<IReturnOrder>("ReturnOrder", ReturnOrderSchema);
