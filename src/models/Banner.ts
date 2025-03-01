import mongoose, { Schema } from 'mongoose';
import paginate from './plugins/paginate';
import { BannerModel, IBanner } from '../types/IBanner';

const bannerSchema = new Schema<IBanner, BannerModel>({
    bannerName: {
        type: String,
        required: true
    },
    link: {
        type: String
    },
    bannerImage: {
        type: String,
    },
    bannerImageUrl: {
        type: String,
    }
}, {
    timestamps: true,
});

bannerSchema.plugin(paginate);

const Banner = mongoose.model<IBanner, any>('Banner', bannerSchema);

export default Banner;
