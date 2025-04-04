const { asyncHandler } = require("../../utils/asyncHandler");
const ApiError = require("../../utils/apiError");
const { status: httpStatus } = require("http-status");

const ApiResponse = require("../../utils/apiResponse");
const Category = require("../../models/Category");

const getCategoriesByBrand = asyncHandler(async (req, res) => {
  try {
    const brandId = req?.query?.brandId;

    if (!brandId) {
      throw new ApiError(httpStatus.BAD_GATEWAY, "brand id is requried");
      return;
    }

    /// @ts-ignore
    const categories = await Category.find({
      brand: brandId,
    });

    // if (!categories || categories.length === 0) {
    //     throw new ApiError(httpStatus.NOT_FOUND, 'No categories found');
    // }

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

module.exports = {
  getCategoriesByBrand,
};
