const Product = require("../models/Product");
const ApiError = require("../utils/apiError");
const { status: httpStatus } = require("http-status");

const { uploadFileToS3 } = require("./fileUploads3Service");
const mongoose = require("mongoose");

const createNewProduct = async (req) => {
  try {
    const data = req?.body;
    const files = req.files;

    let productThumbImageUrl = null;
    let dataSheetUrl = null;

    if (files?.productThumbImage?.[0]) {
      productThumbImageUrl = await uploadFileToS3(
        files.productThumbImage[0],
        req.body.user?._id
      );
    }

    if (files?.dataSheet?.[0]) {
      dataSheetUrl = await uploadFileToS3(
        files.dataSheet[0],
        req.body.user?._id
      );
    }

    // Prepare product data
    const productData = {
      ...data,
      productThumbImageUrl,
      dataSheetUrl,
    };


    return await Product.create(productData);
  } catch (error) {
    console.log(error);

    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error creating product"
    );
  }
};

/**
 * Query for Product with pagination and options
 * @param {Object} options - Query options (e.g., pagination, sort, populate)
 * @returns {Promise<QueryResult>}
 */

const fetchProduct = async (req, filter) => {
  try {
    //   const product = await Product.paginate({}, {});

    const page = req?.query?.page;
    const limit = req?.query?.limit;
    const query = req?.query?.search || "";
    const sortBy = req?.query?.sortBy;
    const sortField = req?.query?.sortField || "createdAt";
    const sortOrder = req?.query?.sortOrder === "desc" ? "desc" : "asc";

    const {
      featureProduct = null,
      newArrivals = null,
      seriesId = null,
      categoryId = null,
    } = req?.query;

    let where = {
      ...filter,
    };

    const sortOptions = {};

    if (sortBy === "New Added") {
      sortOptions.createdAt = "desc";
    } else if (sortField == "brandName") {
      sortOptions["brand.brandName"] = sortOrder;
    } else if (sortField == "categoryName") {
      sortOptions["category.categoryName"] = sortOrder;
    } else if (sortField == "seriesName") {
      sortOptions["seriesName"] = sortOrder;
    } else {
      sortOptions[sortField] = sortOrder;
    }

    // Convert sortOptions object to string for aggregation paginate
    const sortByString = Object.entries(sortOptions)
      .map(([key, val]) => `${key}:${val}`)
      .join(",");

    if (featureProduct == "true") {
      where["featureProduct"] = true;
    }

    if (newArrivals == "true") {
      where["newArrivals"] = true;
    }

    if (seriesId) {
      where["series._id"] = new mongoose.Types.ObjectId(seriesId);
    }

    if (categoryId) {
      where["category._id"] = new mongoose.Types.ObjectId(categoryId);
    }
    console.log({
      productName: { $regex: query, $options: "i" },
      isDeleted: false, // Ensure we only fetch non-deleted products
      ...where,
    });
    /// @ts-ignore
    const product = await Product.paginate(
      {
        productName: { $regex: query, $options: "i" },
        isDeleted: false, // Ensure we only fetch non-deleted products
        ...where,
      },
      {
        page,
        limit,
        sortBy: sortByString,
        populate: [
          { path: "brand", select: "_id brandName" },
          { path: "category", select: "_id categoryName" },
          { path: "series", select: "_id seriesName" },
          { path: "hsnCode", select: "_id code" },
          { path: "color", select: "_id colorName" },
        ],
      }
    );

    if (!product || product.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, "No product found");
    }

    return product;
  } catch (err) {
    console.log(err);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error retrieving products"
    );
  }
};

const fetchProductDropdown = async () => {
  try {
    const product = await Product.find(
      { isDeleted: false },
      { _id: 1, productName: 1 }
    );

    if (!product || product.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, "No product found");
    }
    return product;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error retrieving brands"
    );
  }
};

const getProductByIdService = async (productId) => {
  try {
    const product = await Product.findById(productId)
      .populate("brand", "brandName")
      .populate("category", "categoryName")
      .populate("series", "seriesName")
      .populate("hsnCode", "code")
      .populate("color", "colorName");

    if (!product) {
      throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
    }

    return product;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error retrieving product"
    );
  }
};

const updateProductById = async (productId, req) => {
  try {
    const data = req?.body;
    const files = req.files;

    let productThumbImageUrl = null;
    let dataSheetUrl = null;
    let uploadedImages = [];

    if (files?.productThumbImage?.[0]) {
      productThumbImageUrl = await uploadFileToS3(
        files.productThumbImage[0],
        req.user?._id
      );
    }

    if (files?.dataSheet?.[0]) {
      dataSheetUrl = await uploadFileToS3(
        files.dataSheet[0],
        req.body.user?._id
      );
    }

    if (files?.images && files.images.length > 0) {
      uploadedImages = await Promise.all(
        files.images.map((file) => uploadFileToS3(file, req.user?._id))
      );
    }

    const productData = {
      ...data,
    };

    if (productThumbImageUrl) {
      productData["productThumbImageUrl"] = productThumbImageUrl;
    }

    if (dataSheetUrl) {
      productData["dataSheetUrl"] = dataSheetUrl;
    }

    if (uploadedImages.length > 0) {
      productData.images = uploadedImages; // Add new images to the array
    }

    const product = await Product.findByIdAndUpdate(productId, productData, {
      new: true,
      runValidators: true,
    });
    if (!product) throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
    return product;
  } catch (err) {
    console.log(err);

    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error updating product"
    );
  }
};

const deleteProductById = async (productId) => {
  try {
    const product = await Product.findById(productId);
    if (!product) throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
    await product.softDelete();
    return product;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error deleting brand"
    );
  }
};

/**
 * Upload images to the product gallery
 */
const updateProductGalleryById = async (productId, req) => {
  try {
    const files = req.files;
    let uploadedImages = [];

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
  } catch (err) {
    console.log(err);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error updating product gallery"
    );
  }
};

/**
 * Reorder gallery images based on user input
 */
const reorderProductGallery = async (productId, newOrder) => {
  try {
    const product = await Product.findById(productId);
    if (!product) throw new ApiError(httpStatus.NOT_FOUND, "Product not found");

    console.log("New order:", newOrder);
    console.log("Existing gallery:", product.gallery);

    // Normalize URLs before comparison
    const imagesMap = new Map(
      product.gallery.map((img) => [img.url.trim(), img])
    );

    const reorderedGallery = newOrder
      .map((item, index) => {
        const trimmedUrl = item.url.trim(); // ✅ Extract `url` properly
        if (!imagesMap.has(trimmedUrl)) {
          console.log(`Skipping URL not found in gallery: ${trimmedUrl}`);
          return null; // Mark for removal
        }
        return { url: trimmedUrl, position: index };
      })
      .filter(Boolean); // Remove null entries

    console.log("Reordered gallery:", reorderedGallery);

    product.gallery = reorderedGallery;
    await product.save();

    return product;
  } catch (err) {
    console.error("Error reordering gallery:", err);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error reordering product gallery"
    );
  }
};

const fetchAllProducts = async (req) => {
  try {
    const { brandId = null, categoryId = null, seriesId = null } = req?.query;

    const filter = {
      isDeleted: false,
      ...(brandId && {
        brand: new mongoose.Types.ObjectId(brandId),
      }),
      ...(categoryId && {
        category: new mongoose.Types.ObjectId(categoryId),
      }),
      ...(seriesId && {
        series: new mongoose.Types.ObjectId(seriesId),
      }),
    };
    const options = {
      sortBy: "position:asc",
      pagination: false,
    };

    const products = await Product.paginate(filter, options);

    return products.results;
  } catch (err) {
    console.log(err);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error retrieving products"
    );
  }
};

const updateProductOrderService = async (products) => {
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

    return {
      success: true,
      message: "Product order updated successfully",
      result,
    };
  } catch (err) {
    throw new ApiError(500, "Error updating product order: " + err.message);
  }
};

module.exports = {
  createNewProduct,
  fetchProduct,
  fetchProductDropdown,
  getProductByIdService,
  updateProductById,
  deleteProductById,
  updateProductGalleryById,
  reorderProductGallery,
  fetchAllProducts,
  updateProductOrderService,
};
