import { Types, Document, Model } from "mongoose";

export interface IContactUs extends Document {
    _id: Types.ObjectId;
    name: string;
    phone: string;
    email: string;
    subject: string;
    message: string;
}

export interface IContactUsBody {
    name: string;
    email: string;
    subject: string;
    message: string;
}

export interface IContactUsMethods {
    paginate: any;
}

export type ContactUsModel = Model<IContactUs, {}, IContactUsMethods>;
export type ContactUsDocument = Document & IContactUs & IContactUsMethods;
