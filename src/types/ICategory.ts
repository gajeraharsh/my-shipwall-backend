import { Document, Types, Model } from 'mongoose';

export interface ICategory extends Document {
  brand: Types.ObjectId;
  categoryName: string;
  categoryUrl: string;
  pageTitle: string;
  metaDescription: string;
  metaKeywords: string;
  iconImage: string;
  displayHome: boolean;
}

export interface ICategorybody {
  brand: Types.ObjectId;
  categoryName: string;
  categoryUrl?: string;
  pageTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  iconImage?: string;
  displayHome?: boolean;
}

export interface ICategoryMethods {
  // Add any instance methods if needed in the future
}

export type CategoryModel = Model<ICategory, {}, ICategoryMethods>;
export type CategoryDocument = Document & ICategory & ICategoryMethods;
