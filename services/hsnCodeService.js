const Brand = require("../models/Brand");
const ApiError = require("../utils/apiError");
const { status: httpStatus } = require("http-status");

const HsnModel = require("../models/HsnCode");

// If IHsnBody is a TypeScript type, it's not needed in CommonJS
// Types are used at compile time and are not included in runtime JavaScript

const createNewHsnCode = async (data) => {
  const input = {
    ...data,
  };
  return await HsnModel.create(input);
};

const fetchhsnCodes = async (req) => {
  try {
    const page = req?.query?.page;
    const limit = req?.query?.limit;
    const query = req?.query?.search;

    const hsncodes = await HsnModel.paginate(
      {
        code: { $regex: query, $options: "i" },
      },
      {
        page,
        limit,
      }
    );

    if (!hsncodes || hsncodes.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, "No hysn code found");
    }

    return hsncodes;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error retrieving brands"
    );
  }
};

const fetchHsnCodeDropdown = async (req) => {
  try {
    const filter = req.query.search
      ? { code: { $regex: req.query.search, $options: "i" } }
      : {};

    const options = {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 5,
      pagination: true,
    };

    const hsncodes = await HsnModel.paginate(filter, options);

    return hsncodes;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error retrieving hsn codes"
    );
  }
};

const getHsnCodeByIdService = async (brandId) => {
  try {
    const hsncode = await HsnModel.findById(brandId);

    if (!hsncode) {
      throw new ApiError(httpStatus.NOT_FOUND, "Hsn code not found");
    }

    return hsncode;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error retrieving Hsn code"
    );
  }
};

const updateHsnCodeById = async (id, updateData) => {
  try {
    const hsnCode = await HsnModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!hsnCode)
      throw new ApiError(httpStatus.NOT_FOUND, "Hsn code not found");
    return hsnCode;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error updating hsn code"
    );
  }
};

const deleteHsnCodeById = async (id) => {
  try {
    const hsnCode = await HsnModel.findByIdAndDelete(id);
    if (!hsnCode)
      throw new ApiError(httpStatus.NOT_FOUND, "Hsn code not found");
    return hsnCode;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error deleting hsn code"
    );
  }
};

module.exports = {
  createNewHsnCode,
  fetchhsnCodes,
  fetchHsnCodeDropdown,
  getHsnCodeByIdService,
  updateHsnCodeById,
  deleteHsnCodeById,
};
