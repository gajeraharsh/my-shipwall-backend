import mongoose, { Schema } from 'mongoose';
import { IBrand, BrandModel } from '../types/IBrand';
import paginate from './plugins/paginate';

const brandSchema = new Schema<IBrand, BrandModel>({
  brandName: {
    type: String,
    required: true,
    unique: true,
  },
  pageTitle: {
    type: String,
  },
  metaDescription: {
    type: String,
  },
  metaKeywords: {
    type: String,
  },
  displayHome: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true,
});

brandSchema.plugin(paginate);

const Brand = mongoose.model<IBrand, BrandModel>('Brand', brandSchema);

export default Brand;
