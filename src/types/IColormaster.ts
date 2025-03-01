import { Types, Document, Model } from "mongoose";

export interface IColorMastercode extends Document {
    _id: Types.ObjectId;
    colorName: string;
    colorCode: string;
}

export interface IColorMasterBody {
    colorName: string;
    colorCode: string;
}

export interface IColorMasterMethods {
    paginate: any;
}

export type ColorMasterModel = Model<IColorMastercode, {}, IColorMasterMethods>;
export type ColorMasterDocument = Document & IColorMastercode & IColorMasterMethods;