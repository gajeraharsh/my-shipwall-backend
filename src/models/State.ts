import mongoose, { Schema, Document, Model } from 'mongoose';
import paginate from './plugins/paginate';
import incrementId from './plugins/incrementId';

interface IState extends Document {
    name: string;
    country: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const StateSchema = new Schema<IState>({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    country: {
        type: String,
        required: true,
        trim: true,
        default: "india"
    },
}, {
    timestamps: true,
});

StateSchema.plugin(incrementId);
StateSchema.plugin(paginate);




const StateModel = mongoose.model<IState, any>('State', StateSchema);

export default StateModel;