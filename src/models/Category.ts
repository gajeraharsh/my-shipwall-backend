import mongoose, { Schema, Model, Types } from 'mongoose';
import { CategoryModel, ICategory } from '../types/ICategory';
import paginate from './plugins/paginate';

const categorySchema = new Schema<ICategory, CategoryModel>({
  brand: {
    type: Schema.Types.ObjectId,
    ref: 'Brand',
    required: true,
  },
  status: {
    type: String,
    enum: ['Draft', 'Published'],
    default: "Draft",
  },
  categoryName: {
    type: String,
    required: true,
  },
  categoryUrl: {
    type: String,
    required: true,
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
  iconImage: {
    type: String,
    required: true,
  },
  iconImageUrl: {
    type: String,
    required: true,
  },
  displayHome: {
    type: Boolean,
    default: false,
  },
  position: {
    type: Number,
    required: true,
    default: 0,
  }

}, {
  timestamps: true,
});

categorySchema.plugin(paginate);

const Category = mongoose.model<ICategory, any>('Category', categorySchema);

export default Category;
