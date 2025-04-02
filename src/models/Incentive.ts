import mongoose, { Schema, Document, Model } from 'mongoose';
import paginate from './plugins/paginate';
import incrementId from './plugins/incrementId';

interface IIncentive extends Document {
    minAmount: number;
    maxAmount: number;
    incentivePercentage: number;
    createdAt?: Date;
    updatedAt?: Date;
    user: any;
}

const IncentiveSchema = new Schema<IIncentive>({
    minAmount: {
        type: Number,
        required: true,
    },
    maxAmount: {
        type: Number,
        required: true,
    },
    incentivePercentage: {
        type: Number,
        required: true,
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true,
});

IncentiveSchema.plugin(paginate);
IncentiveSchema.plugin(incrementId);


const IncentiveModel = mongoose.model<IIncentive, any>('Incentive', IncentiveSchema);

export default IncentiveModel;
