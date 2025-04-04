const { NextFunction, Request, Response } = require("express");
const {
  createNewSeries,
  fetchSeries,
  getSeriesByIdService,
  updateSeriesById,
  deleteSeriesById,
  fetchSeriesDropdown,
  updateSeriesOrderService,
  fetchAllSeries,
  updateSeriesGalleryById,
  reorderSeriesGallery,
} = require("../services/seriesService");
const { asyncHandler } = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");
const { status: httpStatus } = require("http-status");


const createSeries = asyncHandler(async (req, res) => {
  try {
    const series = await createNewSeries(req);
    return res
      .status(200)
      .json(new ApiResponse(200, { series }, "Series created successfully"));
  } catch (err) {
    throw new ApiError(500, err.message || "Series not created");
  }
});

const getSeries = asyncHandler(async (req, res) => {
  try {
    const seriesList = await fetchSeries(req);
    return res
      .status(200)
      .json(
        new ApiResponse(200, { seriesList }, "Series retrieved successfully")
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Could not retrieve series");
  }
});

const getSeriesById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const series = await getSeriesByIdService(id);
    return res
      .status(200)
      .json(new ApiResponse(200, { series }, "Series retrieved successfully"));
  } catch (err) {
    throw new ApiError(500, err.message || "Could not retrieve series");
  }
});

const updateSeries = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatedSeries = await updateSeriesById(id, req);
    return res
      .status(200)
      .json(
        new ApiResponse(200, { updatedSeries }, "Series updated successfully")
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Could not update series");
  }
});

const deleteSeries = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    await deleteSeriesById(id);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Series deleted successfully"));
  } catch (err) {
    throw new ApiError(500, err.message || "Could not delete series");
  }
});

const getSeriesDropdown = asyncHandler(async (req, res) => {
  try {
    const seriesList = await fetchSeriesDropdown(req);
    const options = seriesList?.results?.map((item) => {
      return {
        label: item?.seriesName,
        value: item?._id,
      };
    });

    return res
      .status(200)
      .json(new ApiResponse(200, { options }, "Series retrieved successfully"));
  } catch (err) {
    throw new ApiError(500, err.message || "Could not retrieve series");
  }
});

const updateSeriesOrderController = asyncHandler(async (req, res) => {
  try {
    const updatedSeries = await updateSeriesOrderService(req?.body?.ids || []);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { updatedSeries },
          "Series order updated successfully"
        )
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Could not update series order");
  }
});

const getAllSeries = asyncHandler(async (req, res) => {
  try {
    const series = await fetchAllSeries(req);
    return res
      .status(200)
      .json(
        new ApiResponse(200, { series }, "All series retrieved successfully")
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Could not retrieve series");
  }
});

// Web series

const getWebSeries = asyncHandler(async (req, res) => {
  try {
    const seriesList = await fetchSeries(req, {
      status: "Published",
    });
    return res
      .status(200)
      .json(
        new ApiResponse(200, { seriesList }, "Series retrieved successfully")
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Could not retrieve series");
  }
});

/**
 * Controller to upload images to the product gallery
 */
const updateSeriesGallery = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatedSeries = await updateSeriesGalleryById(id, req);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { updatedSeries },
          "Series gallery updated successfully"
        )
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Could not update Series gallery");
  }
});

/**
 * Controller to reorder images in the product gallery
 */
const reorderGalleryImages = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { newOrder } = req.body; // Expecting an array of image URLs in desired order
    const updatedSeries = await reorderSeriesGallery(id, newOrder);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { updatedSeries },
          "Gallery images reordered successfully"
        )
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Could not reorder gallery images");
  }
});

module.exports = {
  createSeries,
  getSeries,
  getSeriesById,
  updateSeries,
  deleteSeries,
  getSeriesDropdown,
  updateSeriesOrderController,
  getAllSeries,
  getWebSeries,
  updateSeriesGallery,
  reorderGalleryImages,
};
