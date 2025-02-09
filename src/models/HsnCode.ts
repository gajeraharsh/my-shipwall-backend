import mongoose, { Schema } from 'mongoose';
import { IHsncode, HsnModel } from '../types/IHsnCodes';
import paginate from './plugins/paginate';

const HsncodeSchema = new Schema<IHsncode, HsnModel>({
    code: {
        type: String,
        required: true
    },
    percentage: {
        type: Number,
        required: true
    }
}, {
    timestamps: true,
});

HsncodeSchema.plugin(paginate);

const HsnModel = mongoose.model<IHsncode, any>('HsnciodeModel', HsncodeSchema);

export default HsnModel;
