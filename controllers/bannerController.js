const { asyncHandler } = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");
const {
  createNewBanner,
  deleteBannerById,
  fetchBanners,
  getBannerByIdService,
  updateBannerById,
} = require("../services/bannerService");

const createBanner = asyncHandler(async (req, res) => {
  try {
    const banners = await createNewBanner(req);
    return res
      .status(200)
      .json(new ApiResponse(200, { banners }, "Created Successfully"));
  } catch (err) {
    throw new ApiError(500, err.message || "Not created");
  }
});

const getBanners = asyncHandler(async (req, res) => {
  try {
    const banners = await fetchBanners(req);
    return res
      .status(200)
      .json(
        new ApiResponse(200, { banners }, "Banners retrieved successfully")
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Could not retrieve banners");
  }
});

const getBannerById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await getBannerByIdService(id);
    return res
      .status(200)
      .json(new ApiResponse(200, { banner }, "Banner retrieved successfully"));
  } catch (err) {
    throw new ApiError(500, err.message || "Could not retrieve banner");
  }
});

const updateBanner = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatedBanner = await updateBannerById(id, req);
    return res
      .status(200)
      .json(
        new ApiResponse(200, { updatedBanner }, "Banner updated successfully")
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Could not update banner");
  }
});

const deleteBanner = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    await deleteBannerById(id);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Banner deleted successfully"));
  } catch (err) {
    throw new ApiError(500, err.message || "Could not delete banner");
  }
});

module.exports = {
  createBanner,
  getBanners,
  getBannerById,
  updateBanner,
  deleteBanner,
};
