const Brand = require("../models/Brand");
const {
  createNewBrand,
  fetchBrands,
  getBrandByIdService,
  updateBrandById,
  deleteBrandById,
  fetchBrandsDropdown,
  fetchAllBrands,
  updateBrandOrderService,
} = require("../services/brandService");
const { asyncHandler } = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");
const pick = require("../utils/pick");

const createBrand = asyncHandler(async (req, res) => {
  try {
    const brand = await createNewBrand(req.body);
    return res
      .status(200)
      .json(new ApiResponse(200, { brand }, "Created Successfully"));
  } catch (err) {
    throw new ApiError(500, err.message || "Not created");
  }
});

const getBrands = asyncHandler(async (req, res) => {
  try {
    const brands = await fetchBrands(req);
    return res
      .status(200)
      .json(new ApiResponse(200, { brands }, "Brands retrieved successfully"));
  } catch (err) {
    throw new ApiError(500, err.message || "Could not retrieve brands");
  }
});

const getAllBrands = asyncHandler(async (req, res) => {
  try {
    const brands = await fetchAllBrands(req);
    return res
      .status(200)
      .json(
        new ApiResponse(200, { brands }, "All brands retrieved successfully")
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Could not retrieve brands");
  }
});

const getBrandById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const brand = await getBrandByIdService(id);
    return res
      .status(200)
      .json(new ApiResponse(200, { brand }, "Brand retrieved successfully"));
  } catch (err) {
    throw new ApiError(500, err.message || "Could not retrieve brand");
  }
});

const updateBrand = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatedBrand = await updateBrandById(id, req.body);
    return res
      .status(200)
      .json(
        new ApiResponse(200, { updatedBrand }, "Brand updated successfully")
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Could not update brand");
  }
});

const deleteBrand = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    await deleteBrandById(id);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Brand deleted successfully"));
  } catch (err) {
    throw new ApiError(500, err.message || "Could not delete brand");
  }
});

const getBrandDropdown = asyncHandler(async (req, res) => {
  try {
    const brands = await fetchBrandsDropdown(req);
    const brandsOptions = brands?.results?.map((item) => {
      return {
        label: item?.brandName,
        value: item?._id,
      };
    });
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { options: brandsOptions },
          "Brands retrieved successfully"
        )
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Could not retrieve brands");
  }
});

const updateBrandOrderController = asyncHandler(async (req, res) => {
  try {
    const updatedBrand = await updateBrandOrderService(req?.body?.ids || []);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { updatedBrand },
          "Brand order updated successfully"
        )
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Could not update brand order");
  }
});

module.exports = {
  createBrand,
  getBrands,
  getAllBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
  getBrandDropdown,
  updateBrandOrderController,
};
