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
    const query = req?.query?.search || '';

    const {
      featureProduct = null,
      newArrivals = null,
      seriesId = null,
      categoryId = null
    } = req?.query;

    let where: any = {}

    if (featureProduct) {
      where['featureProduct'] = featureProduct
    }

    if (newArrivals) {
      where['newArrivals'] = newArrivals
    }

    if (seriesId) {
      where['series'] = seriesId
    }

    if (categoryId) {
      where['category'] = categoryId
    }

    /// @ts-ignore
    const product = await Product.paginate({
      productName: { $regex: query, $options: 'i' },
      ...where
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
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving products');
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
      .populate('series', 'seriesName')
      .populate('hsnCode', 'code')
      .populate('color', 'colorName')

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
    let uploadedImages: string[] = [];


    if (files?.productThumbImage?.[0]) {
      productThumbImageUrl = await uploadFileToS3(files.productThumbImage[0], req.user?._id);
    }

    if (files?.dataSheet?.[0]) {
      dataSheetUrl = await uploadFileToS3(files.dataSheet[0], req.body.user?._id);
    }

    if (files?.images && files.images.length > 0) {
      uploadedImages = await Promise.all(
        files.images.map((file) => uploadFileToS3(file, req.user?._id))
      );
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

    if (uploadedImages.length > 0) {
      productData.images = uploadedImages; // Add new images to the array
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


/**
 * Upload images to the product gallery
 */
export const updateProductGalleryById = async (productId: string, req: Request) => {
  try {
    const files = req.files as Express.Multer.File[] | undefined;
    let uploadedImages: { url: string; position: number }[] = [];

    const product = await Product.findById(productId);
    if (!product) throw new ApiError(httpStatus.NOT_FOUND, "Product not found");

    const existingImages = product.gallery || [];
    let newPosition = existingImages.length; // Append new images at the end

    if (files && files.length > 0) {
      const uploadedUrls = await Promise.all(
        files.map((file) => uploadFileToS3(file, req.user?._id))
      );

      uploadedImages = uploadedUrls.map((url, index) => ({
        url,
        position: newPosition + index, // Maintain position
      }));
    }

    product.gallery.push(...uploadedImages);
    await product.save();

    return product;
  } catch (err: any) {
    console.log(err);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error updating product gallery");
  }
};

/**
 * Reorder gallery images based on user input
 */
export const reorderProductGallery = async (productId: string, newOrder: { url: string }[]) => {
  try {
    const product = await Product.findById(productId);
    if (!product) throw new ApiError(httpStatus.NOT_FOUND, "Product not found");

    console.log("New order:", newOrder);
    console.log("Existing gallery:", product.gallery);

    // Normalize URLs before comparison
    const imagesMap = new Map(product.gallery.map((img: any) => [img.url.trim(), img]));

    const reorderedGallery = newOrder.map((item, index) => {
      const trimmedUrl = item.url.trim(); // ✅ Extract `url` properly
      if (!imagesMap.has(trimmedUrl)) {
        console.log(`Skipping URL not found in gallery: ${trimmedUrl}`);
        return null; // Mark for removal
      }
      return { url: trimmedUrl, position: index };
    }).filter(Boolean); // Remove null entries

    console.log("Reordered gallery:", reorderedGallery);

    product.gallery = reorderedGallery;
    await product.save();

    return product;
  } catch (err: any) {
    console.error("Error reordering gallery:", err);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error reordering product gallery");
  }
};



export const fetchAllProducts = async (req: any) => {
  try {

    const { brandId = null, categoryId = null, seriesId = null } = req?.query

    const filter = {
      ...(brandId && {
        brand: brandId
      }),
      ...(categoryId && {
        category: categoryId
      }),
      ...(seriesId && {
        series: seriesId
      })
    };
    const options = {
      sortBy: "position:asc",
      pagination: false,
    };

    const products = await Product.paginate(filter, options);

    return products.results;
  } catch (err: any) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error retrieving products");
  }
};

export const updateProductOrderService = async (products: { _id: string }[]) => {
  try {
    if (!products || products.length === 0) {
      throw new ApiError(400, "Invalid product list");
    }

    const bulkOps = products.map((product, index) => ({
      updateOne: {
        filter: { _id: product },
        update: { $set: { position: index + 1 } },
        upsert: true,
      },
    }));

    const result = await Product.bulkWrite(bulkOps);

    return { success: true, message: "Product order updated successfully", result };
  } catch (err: any) {
    throw new ApiError(500, "Error updating product order: " + err.message);
  }
};
