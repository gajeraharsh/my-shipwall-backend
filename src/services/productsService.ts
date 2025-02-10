import Product from '../models/Product';
import ApiError from '../utils/apiError';
import { IProductbody } from '../types/IProduct';
import httpStatus from 'http-status';
import { uploadFileToS3 } from './fileUploads3Service';
import { Request } from 'express';



export const createNewProduct = async (req: Request) => {

  try {
    const data: IProductbody = req?.body
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    let productThumbImageUrl: string | null = null;
    let dataSheetUrl: string | null = null;

    if (files?.productThumbImage?.[0]) {
      productThumbImageUrl = await uploadFileToS3(files.productThumbImage[0], req.body.user?._id);
    }

    if (files?.dataSheet?.[0]) {
      dataSheetUrl = await uploadFileToS3(files.dataSheet[0], req.body.user?._id);
    }

    // Prepare product data
    const productData = {
      ...data,
      productThumbImageUrl,
      dataSheetUrl,
    };

    console.log(productData);

    return await Product.create(productData);

  } catch (error) {
    console.log(error);

    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error creating product');
  }
};

/**
* Query for Product with pagination and options
* @param {Object} options - Query options (e.g., pagination, sort, populate)
* @returns {Promise<QueryResult>}
*/


export const fetchProduct = async (req: Request) => {
  try {
    //   const product = await Product.paginate({}, {});

    const page = req?.query?.page;
    const limit = req?.query?.limit;
    const query = req?.query?.search

    /// @ts-ignore
    const product = await Product.paginate({
      productName: { $regex: query, $options: 'i' }
    }, {
      page,
      limit,
      populate: [
        { path: 'brand', select: '_id brandName' },
        { path: 'category', select: '_id categoryName' },
        { path: 'series', select: '_id seriesName' },
        { path: 'hsnCode', select: '_id code' },
        { path: 'color', select: '_id colorName' },
      ]
    });


    if (!product || product.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, 'No product found');
    }

    return product;
  } catch (err: any) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving brands');
  }
}

export const fetchProductDropdown = async () => {
  try {
    const product = await Product.find({}, { _id: 1, productName: 1 });

    if (!product || product.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, 'No product found');
    }
    return product;
  } catch (err: any) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving brands');
  }
};

export const getProductByIdService = async (productId: string) => {
  try {
    const product = await Product.findById(productId).populate('brand', 'brandName')
      .populate('category', 'categoryName')
      .populate('series', 'seriesName');;

    if (!product) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
    }

    return product;
  } catch (err: any) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving product');
  }
};

export const updateProductById = async (productId: string, req: Request) => {
  try {

    const data: IProductbody = req?.body
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    let productThumbImageUrl: string | null = null;
    let dataSheetUrl: string | null = null;

    if (files?.productThumbImage?.[0]) {
      productThumbImageUrl = await uploadFileToS3(files.productThumbImage[0], req.body.user?._id);
    }

    if (files?.dataSheet?.[0]) {
      dataSheetUrl = await uploadFileToS3(files.dataSheet[0], req.body.user?._id);
    }

    const productData: any = {
      ...data,
    };

    if (productThumbImageUrl) {
      productData['productThumbImageUrl'] = productThumbImageUrl
    }

    if (dataSheetUrl) {
      productData['dataSheetUrl'] = dataSheetUrl

    }


    const product = await Product.findByIdAndUpdate(productId, productData, { new: true, runValidators: true });
    if (!product) throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
    return product;
  } catch (err: any) {
    console.log(err);

    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error updating product');
  }
};

export const deleteProductById = async (productId: string) => {
  try {
    const product = await Product.findByIdAndDelete(productId);
    if (!product) throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
    return product;
  } catch (err: any) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error deleting brand');
  }
};

