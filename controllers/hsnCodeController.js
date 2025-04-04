const {
  createNewHsnCode,
  deleteHsnCodeById,
  fetchHsnCodeDropdown,
  fetchhsnCodes,
  getHsnCodeByIdService,
  updateHsnCodeById,
} = require("../services/hsnCodeService");

const { asyncHandler } = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");

const createHsnCode = asyncHandler(async (req, res) => {
  try {
    const hsnCode = await createNewHsnCode(req.body);
    return res
      .status(200)
      .json(new ApiResponse(200, { hsnCode }, "Created Successfully"));
  } catch (err) {
    throw new ApiError(500, err.message || "Not created");
  }
});

const getHsnCodes = asyncHandler(async (req, res) => {
  try {
    const hsnCodes = await fetchhsnCodes(req);
    return res
      .status(200)
      .json(
        new ApiResponse(200, { hsnCodes }, "Hsn codes retrieved successfully")
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Could not retrieve hsn codes");
  }
});

const getHsnCodeById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const hsnCode = await getHsnCodeByIdService(id);
    return res
      .status(200)
      .json(
        new ApiResponse(200, { hsnCode }, "Hsn code retrieved successfully")
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Could not retrieve brand");
  }
});

const updateHsnCode = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatedHsnCode = await updateHsnCodeById(id, req.body);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { updatedHsnCode },
          "Hsn code updated successfully"
        )
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Could not update hsn code.");
  }
});

const deleteHsnCode = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    await deleteHsnCodeById(id);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Hsn code deleted successfully"));
  } catch (err) {
    throw new ApiError(500, err.message || "Could not delete hsn code.");
  }
});

const getHsnDropdown = asyncHandler(async (req, res) => {
  try {
    const hsnCodes = await fetchHsnCodeDropdown(req);
    const hsnCodesOptions = hsnCodes?.results?.map((item) => {
      return {
        label: item?.code,
        value: item?._id,
      };
    });
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { options: hsnCodesOptions },
          "Hsn code retrieved successfully"
        )
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Could not retrieve hsn codes.");
  }
});

module.exports = {
  createHsnCode,
  getHsnCodes,
  getHsnCodeById,
  updateHsnCode,
  deleteHsnCode,
  getHsnDropdown,
};
