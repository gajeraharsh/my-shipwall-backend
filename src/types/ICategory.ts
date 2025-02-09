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
  status: string | 'Draft' | "Published";
  iconImageUrl?: string;
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
  status?: string
}


export interface ICategoryMethods {
  paginate: any;
  // Add any instance methods if needed in the future
}

export type CategoryModel = Model<ICategory, {}, ICategoryMethods>;
export type CategoryDocument = Document & ICategory & ICategoryMethods;
