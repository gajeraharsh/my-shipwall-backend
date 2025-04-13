const {
  createNewCategory,
  fetchCategories,
  getCategoryByIdService,
  updateCategoryIdById,
  deleteCategoryIdById,
  fetchCategoriesDropdown,
  fetchAllCategories,
  updateCategoryOrderService,
  fetchAllWebCategories,
} = require("../services/categoryService");

const { asyncHandler } = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");
const pick = require("../utils/pick");

const createCategory = asyncHandler(async (req, res) => {
  try {
    const category = await createNewCategory(req);
    return res
      .status(200)
      .json(new ApiResponse(200, { category }, "Created Successfully"));
  } catch (err) {
    throw new ApiError(500, err.message || "Not created");
  }
});

const getCategories = asyncHandler(async (req, res) => {
  try {
    const categories = await fetchCategories(req);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { categories },
          "Categories retrieved successfully"
        )
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Could not retrieve categories");
  }
});

const getCatehgoryById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const category = await getCategoryByIdService(id);
    return res
      .status(200)
      .json(
        new ApiResponse(200, { category }, "Category retrieved successfully")
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Could not retrieve category");
  }
});

const updateCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCategory = await updateCategoryIdById(id, req);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { updatedCategory },
          "Category updated successfully"
        )
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Could not update category");
  }
});

const deleteCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    await deleteCategoryIdById(id);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Category deleted successfully"));
  } catch (err) {
    throw new ApiError(500, err.message || "Could not delete category");
  }
});

const getCategoryDropdown = asyncHandler(async (req, res) => {
  try {
    const categories = await fetchCategoriesDropdown(req);
    const options = categories?.results?.map((item) => {
      return {
        label: item?.categoryName,
        value: item?._id,
      };
    });
    return res
      .status(200)
      .json(
        new ApiResponse(200, { options }, "Categories retrieved successfully")
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Could not retrieve categories");
  }
});

const getAllCategories = asyncHandler(async (req, res) => {
  try {
    const categories = await fetchAllCategories(req);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { categories },
          "All categories retrieved successfully"
        )
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Could not retrieve categories");
  }
});


const getAllWebCategories = asyncHandler(async (req, res) => {
  try {
    const categories = await fetchAllWebCategories(req);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { categories },
          "All categories retrieved successfully"
        )
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Could not retrieve categories");
  }
});


const updateCategoryOrderController = asyncHandler(async (req, res) => {
  try {
    const updatedCategory = await updateCategoryOrderService(
      req?.body?.ids || []
    );
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { updatedCategory },
          "Category order updated successfully"
        )
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Could not update categories order");
  }
});

module.exports = {
  createCategory,
  getCategories,
  getCatehgoryById,
  updateCategory,
  deleteCategory,
  getCategoryDropdown,
  getAllCategories,
  updateCategoryOrderController,
  getAllWebCategories
};
