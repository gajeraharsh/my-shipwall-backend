const Chat = require("../models/Chat");
const { status: httpStatus } = require("http-status");

const ApiError = require("../utils/apiError");
const Message = require("../models/Message");
const mongoose = require("mongoose");
const Brand = require("../models/Brand");
const ColorMaster = require("../models/ColorMaster");

const createNewColorMaster = async (data) => {
  const input = {
    ...data,
  };
  return await ColorMaster.create(input);
};

const fetchColorMasterService = async (req) => {
  try {
    const page = req?.query?.page;
    const limit = req?.query?.limit;
    const query = req?.query?.search;

    const colorsMasters = await ColorMaster.paginate(
      {
        colorName: { $regex: query, $options: "i" },
      },
      {
        page,
        limit,
      }
    );

    if (!colorsMasters || colorsMasters.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, "No color master found");
    }

    return colorsMasters;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error retrieving color master"
    );
  }
};

const fetchColorMasterDropdown = async (req) => {
  try {
    const filter = req.query.search
      ? { colorName: { $regex: req.query.search, $options: "i" } }
      : {};

    const options = {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 1,
      pagination: true,
    };

    const colorMasters = await ColorMaster.paginate(filter, options);

    return colorMasters;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error retrieving color master"
    );
  }
};

const getColorMasterByIdService = async (id) => {
  try {
    const colorMaster = await ColorMaster.findById(id);

    if (!colorMaster) {
      throw new ApiError(httpStatus.NOT_FOUND, "Color master not found");
    }

    return colorMaster;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error retrieving color master"
    );
  }
};

const updateColorMasterById = async (id, updateData) => {
  try {
    const colorMaster = await ColorMaster.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!colorMaster)
      throw new ApiError(httpStatus.NOT_FOUND, "Color master not found");
    return colorMaster;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error updating color master"
    );
  }
};

const deleteColorMasterById = async (id) => {
  try {
    const colorMaster = await ColorMaster.findByIdAndDelete(id);
    if (!colorMaster)
      throw new ApiError(httpStatus.NOT_FOUND, "Color master not found");
    return colorMaster;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error deleting color master"
    );
  }
};

module.exports = {
  createNewColorMaster,
  fetchColorMasterService,
  fetchColorMasterDropdown,
  getColorMasterByIdService,
  updateColorMasterById,
  deleteColorMasterById,
};
