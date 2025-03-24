import { Document, Types, Model } from 'mongoose';

interface IGalleryImage {
  url: string;
  position: number;
}


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
  gallery: IGalleryImage[];
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
