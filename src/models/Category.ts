import mongoose, { Schema, Model, Types } from 'mongoose';
import { ICategory } from '../types/ICategory';

const categorySchema = new Schema<ICategory>({
  brand: {
    type: Schema.Types.ObjectId,
    ref: 'Brand',
    required: true,
  },
  categoryName: {
    type: String,
    required: true,
    unique: true,
  },
  categoryUrl: {
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
    type: [String],
  },
  iconImage: {
    type: String,
    required: true,
  },
  displayHome: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true,
});

const Category: Model<ICategory> = mongoose.model<ICategory>('Category', categorySchema);

export default Category;
