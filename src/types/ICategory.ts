import { Document, Types } from 'mongoose';

export interface ICategory extends Document {
  brand: Types.ObjectId;
  categoryName: string;
  categoryUrl: string;
  pageTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  iconImage: string;
  displayHome: boolean;
}
