import mongoose, { Schema } from 'mongoose';
import paginate from './plugins/paginate';
import incrementId from './plugins/incrementId';

const IncentivePayoutSchema = new Schema<any>({
    salePerson: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    order: {
        type: mongoose.Types.ObjectId,
        ref: "Order",
    },
    totalOrderAmount: {
        type: Number,
        required: true,
    },
    percentageIncentive: {
        type: Number,
        required: true,
    },
    totalIncentiveAmount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        require: true,
        enum: ["Pending", "Settled"],
        default: "Pending"
    }
}, {
    timestamps: true,
});

IncentivePayoutSchema.plugin(paginate);
IncentivePayoutSchema.plugin(incrementId);


const IncentivePayoutModel = mongoose.model<any, any>('IncentivePayout', IncentivePayoutSchema);

export default IncentivePayoutModel;
