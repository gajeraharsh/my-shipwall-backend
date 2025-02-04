import Joi from 'joi';
import { IProductbody } from '../types/IProduct';

const createProductValidation = Joi.object<IProductbody>({
  brand: Joi.string().required().messages({
    'string.base': 'Brand ID must be a string.',
    'any.required': 'Brand is required.',
  }),
  category: Joi.string().required().messages({
    'string.base': 'Category ID must be a string.',
    'any.required': 'Category is required.',
  }),
  series: Joi.string().required().messages({
    'string.base': 'Series ID must be a string.',
    'any.required': 'Series is required.',
  }),
  hsnCode: Joi.string().required().messages({
    'string.base': 'HSN Code must be a string.',
    'any.required': 'HSN Code is required.',
  }),
  productName: Joi.string().required().messages({
    'string.base': 'Product name must be a string.',
    'any.required': 'Product name is required.',
  }),
  productUrl: Joi.string().required().uri().messages({
    'string.base': 'Product URL must be a string.',
    'string.uri': 'Product URL must be a valid URL.',
    'any.required': 'Product URL is required.',
  }),
  modelNo: Joi.string().required().messages({
    'string.base': 'Model number must be a string.',
    'any.required': 'Model number is required.',
  }),
  watt: Joi.string().required().messages({
    'string.base': 'Watt must be a string.',
    'any.required': 'Watt is required.',
  }),
  color: Joi.string().required().messages({
    'string.base': 'Color must be a string.',
    'any.required': 'Color is required.',
  }),
  bodyColor: Joi.string().required().messages({
    'string.base': 'Body color must be a string.',
    'any.required': 'Body color is required.',
  }),
  price: Joi.string().required().messages({
    'string.base': 'Price must be a string.',
    'any.required': 'Price is required.',
  }),
  stock: Joi.string().required().messages({
    'string.base': 'Stock must be a string.',
    'any.required': 'Stock is required.',
  }),
  featureProduct: Joi.string().optional().messages({
    'string.base': 'Feature product must be a string.',
  }),
  newArrivals: Joi.string().optional().messages({
    'string.base': 'New arrivals must be a string.',
  }),
  productThumbImage: Joi.string().required().uri().messages({
    'string.base': 'Product thumbnail image must be a string.',
    'string.uri': 'Product thumbnail image must be a valid URL.',
    'any.required': 'Product thumbnail image is required.',
  }),
  structure: Joi.string().optional().messages({
    'string.base': 'Structure must be a string.',
  }),
  boxQuantity: Joi.string().optional().messages({
    'string.base': 'Box quantity must be a string.',
  }),
  dataSheet: Joi.string().required().messages({
    'string.base': 'Data sheet must be a string.',
    'any.required': 'Data sheet is required.',
  }),
});

const updateProductValidation = Joi.object({
  brand: Joi.string().optional().messages({ 'string.base': 'Brand ID must be a string.' }),
  category: Joi.string().optional().messages({ 'string.base': 'Category ID must be a string.' }),
  series: Joi.string().optional().messages({ 'string.base': 'Series ID must be a string.' }),
  hsnCode: Joi.string().optional().messages({ 'string.base': 'HSN Code must be a string.' }),
  productName: Joi.string().optional().messages({ 'string.base': 'Product name must be a string.' }),
  productUrl: Joi.string().optional().uri().messages({ 'string.base': 'Product URL must be a string.', 'string.uri': 'Product URL must be a valid URL.' }),
  modelNo: Joi.string().optional().messages({ 'string.base': 'Model number must be a string.' }),
  watt: Joi.string().optional().messages({ 'string.base': 'Watt must be a string.' }),
  color: Joi.string().optional().messages({ 'string.base': 'Color must be a string.' }),
  bodyColor: Joi.string().optional().messages({ 'string.base': 'Body color must be a string.' }),
  price: Joi.string().optional().messages({ 'string.base': 'Price must be a string.' }),
  stock: Joi.string().optional().messages({ 'string.base': 'Stock must be a string.' }),
  featureProduct: Joi.string().optional().messages({ 'string.base': 'Feature product must be a string.' }),
  newArrivals: Joi.string().optional().messages({ 'string.base': 'New arrivals must be a string.' }),
  productThumbImage: Joi.string().optional().uri().messages({ 'string.base': 'Product thumbnail image must be a string.', 'string.uri': 'Product thumbnail image must be a valid URL.' }),
  structure: Joi.string().optional().messages({ 'string.base': 'Structure must be a string.' }),
  boxQuantity: Joi.string().optional().messages({ 'string.base': 'Box quantity must be a string.' }),
  dataSheet: Joi.string().optional().messages({ 'string.base': 'Data sheet must be a string.' }),
});

const deleteProductValidation = Joi.object({
  id: Joi.string().required().messages({ 'string.base': 'Product ID must be a string.', 'any.required': 'Product ID is required.' }),
});

const getProductValidation = Joi.object({
  id: Joi.string().required().messages({ 'string.base': 'Product ID must be a string.', 'any.required': 'Product ID is required.' }),
});

export { createProductValidation, updateProductValidation, deleteProductValidation, getProductValidation };
