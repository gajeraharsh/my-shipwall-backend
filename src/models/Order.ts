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

// Order Product Interface
interface OrderProduct {
    product: mongoose.Schema.Types.ObjectId;
    quantity: number;
    price: number;
    subtotal: number;
    boxQuantity: number;
    boxPrice: number;
    taxAmount: number;
    subTotalIncTax: number;
    taxPercent: number;
    hsnTx: HSNTx

}

// Order Document Interface
export interface IOrder extends Document {
    user: mongoose.Schema.Types.ObjectId;
    orderId: Number;
    products: OrderProduct[];
    finalTotal: number;
    orderStatus: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled" | "Returned";
    shippingDetails: {
        address: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        phone: string;
    };
    paymentId: string;
    paymentRemark: string;
    paymentMode: string;
    paymentStatus: "Pending" | "Paid" | "Failed" | "Refunded";
    trackingId: string;
    trackingLink: string;
    transportName: string;
    sapInvoideNumber: string;
    eWayBillNo: string;
    uploadlr: string;
    deliveredAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

// Order Schema
const OrderSchema: Schema = new Schema<any>(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        orderId: { type: Number, required: true, unique: true },
        products: [
            {
                product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
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
            enum: ["draft", "initiated", "Received", "Cancelled", "packing", "dispatch", "InLogistic", "delevered"],
            default: "draft",
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
        paymentRemark: {
            type: String
        },
        trackingId: {
            type: String
        },
        trackingLink: {
            type: String
        },
        transportName: {
            type: String
        },
        sapInvoideNumber: {
            type: String
        },
        eWayBillNo: {
            type: String
        },
        uploadlr: {
            type: String
        },
        deliveredAt: {
            type: Date,
        }
    },
    { timestamps: true }
);


OrderSchema.virtual("returnOrder", {
    ref: "ReturnOrder",          // The model to use
    localField: "_id",           // Field in Order model
    foreignField: "order",       // Field in ReturnOrder model referencing Order
    justOne: true                // Each order can have only one returnOrder
});


OrderSchema.set("toObject", { virtuals: true });
OrderSchema.set("toJSON", { virtuals: true });


OrderSchema.plugin(paginate);
OrderSchema.plugin(incrementId, "QVAPOR");
OrderSchema.plugin(incrementId);




export default mongoose.model<IOrder, any>("Order", OrderSchema);
