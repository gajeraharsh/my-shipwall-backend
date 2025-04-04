const {
  createNewColorMaster,
  deleteColorMasterById,
  fetchColorMasterDropdown,
  fetchColorMasterService,
  getColorMasterByIdService,
  updateColorMasterById,
} = require("../services/colorMasterService");

const { asyncHandler } = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");

const createColorMaster = asyncHandler(async (req, res) => {
  try {
    const colorMaster = await createNewColorMaster(req.body);
    return res
      .status(200)
      .json(new ApiResponse(200, { colorMaster }, "Created Successfully"));
  } catch (err) {
    throw new ApiError(500, err.message || "Not created");
  }
});

const getColorMasters = asyncHandler(async (req, res) => {
  try {
    const colorMasters = await fetchColorMasterService(req);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { colorMasters },
          "Color master retrieved successfully"
        )
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Could not retrieve hsn codes");
  }
});

const GetColorMasterById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const colorMaster = await getColorMasterByIdService(id);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { colorMaster },
          "Color masterretrieved successfully"
        )
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Could not retrieve color master.");
  }
});

const updateColorMaster = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateColorMaster = await updateColorMasterById(id, req.body);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { updateColorMaster },
          "Color master updated successfully"
        )
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Could not update color master..");
  }
});

const deleteColorMaster = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    await deleteColorMasterById(id);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Color master deleted successfully"));
  } catch (err) {
    throw new ApiError(500, err.message || "Could not delete color master..");
  }
});

const getColorMasterDropDown = asyncHandler(async (req, res) => {
  try {
    const colorMasters = await fetchColorMasterDropdown(req);
    const colorMastersOptions = colorMasters?.results?.map((item) => {
      return {
        label: item?.colorName,
        value: item?._id,
      };
    });
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { options: colorMastersOptions },
          "Color master retrieved successfully"
        )
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Could not retrieve color master.");
  }
});

module.exports = {
  createColorMaster,
  getColorMasters,
  GetColorMasterById,
  updateColorMaster,
  deleteColorMaster,
  getColorMasterDropDown,
};
