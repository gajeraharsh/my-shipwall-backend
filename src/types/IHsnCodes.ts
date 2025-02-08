import { Types, Document, Model } from "mongoose";

export interface IHsncode extends Document {
    _id: Types.ObjectId;
    code: string;
    percentage: number;
}

export interface IHsnBody {
    code: string;
    percentage: number;
}

export interface IHsnMethods {
    paginate: any;
}

export type HsnModel = Model<IHsncode, {}, IHsnMethods>;
export type HsnDocument = Document & IHsncode & IHsnMethods;
