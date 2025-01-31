import { Document, Types, Model } from 'mongoose';

export interface ISeries extends Document {
  brand: Types.ObjectId;
  categoryName: string;
  categoryUrl: string;
  pageTitle: string;
  metaDescription: string;
  metaKeywords: string;
  iconImage: string;
  displayHome: boolean;
}

export interface ISeriesbody {
  brand: Types.ObjectId;
  categoryName: string;
  categoryUrl?: string;
  pageTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  iconImage?: string;
  displayHome?: boolean;
}

export interface ISeriesMethods {
  // Add any instance methods if needed in the future
}

export type CategoryModel = Model<ISeries, {}, ISeriesMethods>;
export type CategoryDocument = Document & ISeries & ISeriesMethods;
