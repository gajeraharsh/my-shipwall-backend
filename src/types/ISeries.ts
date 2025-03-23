import { Document, Types, Model } from 'mongoose';

export interface ISeries extends Document {
  brand: Types.ObjectId;
  category: Types.ObjectId;
  seriesName: string;
  seriesUrl: string;
  metaDescription: string;
  pageTitle: string;
  metaKeywords: string;
  thumbImage: string;
  thumbImageUrl?: string
  status?: string;
  position: number;
}

export interface ISeriesbody {
  brand: Types.ObjectId;
  category: Types.ObjectId;
  seriesName?: string;
  seriesUrl?: string;
  metaDescription?: string;
  pageTitle?: string;
  metaKeywords?: string;
  thumbImage?: string;
}

export interface ISeriesMethods {
  paginate: any
  // Add any instance methods if needed in the future
}

export type SeriesModel = Model<ISeries, {}, ISeriesMethods>;
export type SeriesDocument = Document & ISeries & ISeriesMethods;
