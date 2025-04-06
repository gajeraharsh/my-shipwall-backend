const {
  createNewProduct,
  fetchProduct,
  getProductByIdService,
  updateProductById,
  deleteProductById,
  fetchProductDropdown,
  updateProductGalleryById,
  reorderProductGallery,
  fetchAllProducts,
  updateProductOrderService,
} = require("../services/productsService");

const { asyncHandler } = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");
const pick = require("../utils/pick");
const { status: httpStatus } = require("http-status");


const createProducts = asyncHandler(async (req, res) => {
  try {
    const product = await createNewProduct(req);
    return res
      .status(200)
      .json(new ApiResponse(200, { product }, "Created Successfully"));
  } catch (err) {
    throw new ApiError(500, err.message || "Not created");
  }
});

const getProducts = asyncHandler(async (req, res) => {
  try {
    const products = await fetchProduct(req);
    return res
      .status(200)
      .json(
        new ApiResponse(200, { products }, "Products retrieved successfully")
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Could not retrieve products");
  }
});

const getProductById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const product = await getProductByIdService(id);
    return res
      .status(200)
      .json(
        new ApiResponse(200, { product }, "product retrieved successfully")
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Could not retrieve product");
  }
});

const updateProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProduct = await updateProductById(id, req);
    return res
      .status(200)
      .json(
        new ApiResponse(200, { updatedProduct }, "Product updated successfully")
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Could not update Product");
  }
});

const deleteProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    await deleteProductById(id);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Product deleted successfully"));
  } catch (err) {
    throw new ApiError(500, err.message || "Could not delete product");
  }
});

const getProductsDropdown = asyncHandler(async (req, res) => {
  try {
    const products = await fetchProductDropdown();
    return res
      .status(200)
      .json(
        new ApiResponse(200, { products }, "Products retrieved successfully")
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Could not retrieve products");
  }
});

/**
 * Controller to upload images to the product gallery
 */
const updateProductGallery = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProduct = await updateProductGalleryById(id, req);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { updatedProduct },
          "Product gallery updated successfully"
        )
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Could not update product gallery");
  }
});

/**
 * Controller to reorder images in the product gallery
 */
const reorderGalleryImages = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { newOrder } = req.body; // Expecting an array of image URLs in desired order
    const updatedProduct = await reorderProductGallery(id, newOrder);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { updatedProduct },
          "Gallery images reordered successfully"
        )
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Could not reorder gallery images");
  }
});

const getAllProducts = asyncHandler(async (req, res) => {
  try {
    const products = await fetchAllProducts(req);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { products },
          "All products retrieved successfully"
        )
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Could not retrieve products");
  }
});

const updateProductOrderController = asyncHandler(async (req, res) => {
  try {
    const updatedProduct = await updateProductOrderService(
      req?.body?.ids || []
    );
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { updatedProduct },
          "Product order updated successfully"
        )
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Could not update product order");
  }
});

const getWebAllProducts = asyncHandler(async (req, res) => {
  try {
    const products = await fetchProduct(req, {
      status: "Published",
    });
    return res
      .status(200)
      .json(
        new ApiResponse(200, { products }, "Products retrieved successfully")
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Could not retrieve products");
  }
});

module.exports = {
  createProducts,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsDropdown,
  updateProductGallery,
  reorderGalleryImages,
  getAllProducts,
  updateProductOrderController,
  getWebAllProducts,
};
