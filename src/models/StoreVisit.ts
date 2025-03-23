import { Schema, model, Document, Types } from 'mongoose';
import paginate from './plugins/paginate';
import incrementId from './plugins/incrementId';

export interface IStoreVisit extends Document {
    fromDate: Date;
    time?: string;
    comments?: string;
    images: string[];
    user: Types.ObjectId; // Reference to the User model
}

const storeVisitSchema = new Schema<IStoreVisit>(
    {
        fromDate: {
            type: Date,
            required: true,
        },
        time: {
            type: String,
            required: false,
        },
        comments: {
            type: String,
            required: false,
        },
        images: [
            {
                type: String,
                required: true,
            },
        ],
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

    },
    { timestamps: true }
);

storeVisitSchema.plugin(paginate);
storeVisitSchema.plugin(incrementId, "QVAPSV");

const StoreVisit = model<IStoreVisit, any>('StoreVisit', storeVisitSchema);

export default StoreVisit;
