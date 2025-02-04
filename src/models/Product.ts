import mongoose, { Schema } from 'mongoose';
import { IProduct, ProductModel } from '../types/IProduct';
import paginate from './plugins/paginate';

const productSchema = new Schema<IProduct, ProductModel>({
  brand: {
    type: Schema.Types.ObjectId,
    ref: 'Brand',
    required: true,
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  series: {
    type: Schema.Types.ObjectId,
    ref: 'Series',
    required: true,
  },
  hsnCode: {
    type: String,
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  productUrl: {
    type: String,
    required: true,
  },
  modelNo: {
    type: String,
    required: true,
  },
  watt: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  bodyColor: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  stock: {
    type: String,
    required: true,
  },
  featureProduct: {
    type: String,
  },
  newArrivals: {
    type: String,
  },
  productThumbImage: {
    type: String,
    required: true,
  },
  structure: {
    type: String,
  },
  boxQuantity: {
    type: String,
  },
  dataSheet: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

productSchema.plugin(paginate);

const Product = mongoose.model<IProduct, any>('Product', productSchema);

export default Product;
