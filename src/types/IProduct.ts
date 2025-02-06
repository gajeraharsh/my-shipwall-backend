import { Document, Types, Model } from 'mongoose';

export interface IProduct extends Document {
  brand: Types.ObjectId;
  category: Types.ObjectId;
  series: Types.ObjectId;
  hsnCode: string;
  productName: string;
  productUrl: string;
  modelNo: string;
  watt: string;
  color: string;
  bodyColor: string;
  price: string;
  stock: string;
  featureProduct: string;
  newArrivals: string;
  productThumbImage: string;
  structure: string;
  boxQuantity: string;
  dataSheet: string;
}

export interface IProductbody {
    brand: Types.ObjectId;
    category: Types.ObjectId;
    series: Types.ObjectId;
    hsnCode?: string;
    productName?: string;
    productUrl?: string;
    modelNo?: string;
    watt?: string;
    color?: string;
    bodyColor?: string;
    price?: string;
    stock?: string;
    featureProduct?: string;
    newArrivals?: string;
    productThumbImage?: string;
    structure?: string;
    boxQuantity?: string;
    dataSheet?: string;
}

export interface IProductMethods {
  // Add any instance methods if needed in the future
}

export type ProductModel = Model<IProduct, {}, IProductMethods>;
export type ProductDocument = Document & IProduct & IProductMethods;
