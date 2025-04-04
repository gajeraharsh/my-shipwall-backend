const { Request, Response } = require("express");
const {
  createStoreVisit,
  deleteStoreVisitById,
  fetchStoreVisits,
  getStoreVisitById,
  updateStoreVisitById,
} = require("../services/storeVisitService");
const { asyncHandler } = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");

const createVisit = asyncHandler(async (req, res) => {
  try {
    const visit = await createStoreVisit(req);
    return res
      .status(200)
      .json(
        new ApiResponse(200, { visit }, "Store visit created successfully")
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Store visit creation failed");
  }
});

const getVisits = asyncHandler(async (req, res) => {
  try {
    const visits = await fetchStoreVisits(req);
    return res
      .status(200)
      .json(
        new ApiResponse(200, { visits }, "Store visits retrieved successfully")
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Could not retrieve store visits");
  }
});

const getVisitById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const visit = await getStoreVisitById(id);
    return res
      .status(200)
      .json(
        new ApiResponse(200, { visit }, "Store visit retrieved successfully")
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Could not retrieve store visit");
  }
});

const updateVisit = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatedVisit = await updateStoreVisitById(id, req.body);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { updatedVisit },
          "Store visit updated successfully"
        )
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Could not update store visit");
  }
});

const deleteVisit = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    await deleteStoreVisitById(id);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Store visit deleted successfully"));
  } catch (err) {
    throw new ApiError(500, err.message || "Could not delete store visit");
  }
});

module.exports = {
  createVisit,
  getVisits,
  getVisitById,
  updateVisit,
  deleteVisit,
};
