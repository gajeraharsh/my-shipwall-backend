import mongoose, { Schema, Document, Model } from 'mongoose';
import paginate from './plugins/paginate';
import incrementId from './plugins/incrementId';

interface ICity extends Document {
    name: string;
    state: mongoose.Schema.Types.ObjectId;
    country: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const CitySchema = new Schema<ICity>({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    state: {
        type: Schema.Types.ObjectId,
        ref: 'State',
        required: true,
    },
    country: {
        type: String,
        required: true,
        trim: true,
        default: 'india'
    },
}, {
    timestamps: true,
});

CitySchema.plugin(paginate);
CitySchema.plugin(incrementId);


const CityModel = mongoose.model<ICity, any>('City', CitySchema);

export default CityModel;