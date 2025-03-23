import { Types, Document, Model } from "mongoose";

export interface IGeneralSettingcode extends Document {
    _id: Types.ObjectId;
    generalshippingcost: number;
    returnDays: number
}

export interface IGeneralSettingBody {
    generalshippingcost: number,
    returnDays: number
}

export interface IGeneralSettingsrMethods {
    paginate: any;
}

export type GeneralsettingModal = Model<IGeneralSettingcode, {}, IGeneralSettingsrMethods>;
export type GeneralSettingDocument = Document & IGeneralSettingcode & IGeneralSettingsrMethods;