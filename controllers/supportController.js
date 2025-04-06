const { Request, Response } = require("express");
const {
  createNewTicket,
  deleteTicketById,
  fetchTickets,
  getTicketByIdService,
  updateTicketById,
} = require("../services/supportService");
const { asyncHandler } = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");

const createSupport = asyncHandler(async (req, res) => {
  try {
    const support = await createNewTicket(req);
    return res
      .status(200)
      .json(
        new ApiResponse(200, { support }, "Support ticket created successfully")
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Support ticket creation failed");
  }
});

const getSupports = asyncHandler(async (req, res) => {
  try {
    const supports = await fetchTickets(req);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { supports },
          "Support tickets retrieved successfully"
        )
      );
  } catch (err) {
    throw new ApiError(
      500,
      err.message || "Could not retrieve support tickets"
    );
  }
});

const getSupportById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const support = await getTicketByIdService(id);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { support },
          "Support ticket retrieved successfully"
        )
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Could not retrieve support ticket");
  }
});

const updateSupport = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatedSupport = await updateTicketById(id, req.body);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { updatedSupport },
          "Support ticket updated successfully"
        )
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Could not update support ticket");
  }
});

const deleteSupport = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    await deleteTicketById(id);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Support ticket deleted successfully"));
  } catch (err) {
    throw new ApiError(500, err.message || "Could not delete support ticket");
  }
});

module.exports = {
  createSupport,
  getSupports,
  getSupportById,
  updateSupport,
  deleteSupport,
};
