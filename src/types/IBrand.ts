import { Types, Document, Model } from "mongoose";

export interface IBrand extends Document {
  _id: Types.ObjectId;
  brandName: string;
  pageTitle: string;
  metaDescription: string;
  metaKeywords: string;
  displayHome: boolean;
}

export interface IBrandBody {
  brandName: string;
  pageTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  displayHome?: boolean;
}

export interface IBrandMethods {
  paginate: any;
}

export type BrandModel = Model<IBrand, {}, IBrandMethods>;
export type BrandDocument = Document & IBrand & IBrandMethods;
