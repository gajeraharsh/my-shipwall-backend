import { Types, Document, Model } from "mongoose";

export interface IBanner extends Document {
    _id: Types.ObjectId;
    bannerName: string;
    link?: string;
    bannerImage?: string;
    bannerImageUrl?:string;
}

export interface IBannerBody {
    bannerName: string;
    link?: string;
    bannerImage?: string;
}

export interface IBrandMethods {
    paginate: any;
}

export type BannerModel = Model<IBanner, {}, IBrandMethods>;
export type BannerDocument = Document & IBanner & IBrandMethods;
