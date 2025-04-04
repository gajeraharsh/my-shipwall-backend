const ApiError = require("../utils/apiError");
const { status: httpStatus } = require("http-status");

const StoreVisit = require("../models/StoreVisit");
const { uploadFileToS3 } = require("./fileUploads3Service");

const createStoreVisit = async (req) => {
  const body = req.body;
  const files = req.files;

  let images = [];

  if (files && files.length > 0) {
    images = await Promise.all(
      files.map((file) => uploadFileToS3(file, req.user?._id))
    );
  }

  const storeVisitData = {
    ...body,
    images,
  };

  return await StoreVisit.create(storeVisitData);
};

const fetchStoreVisits = async (req) => {
  try {
    const page = req?.query?.page || 1;
    const limit = req?.query?.limit || 10;
    const search = req?.query?.search ?? "";
    const { startDate = "", endDate = "", user } = req?.query;

    const filter = {};

    if (search) {
      filter.comments = { $regex: search, $options: "i" };
    }

    if (startDate || endDate) {
      filter.fromDate = {};
      if (startDate) filter.fromDate.$gte = new Date(startDate);
      if (endDate) filter.fromDate.$lte = new Date(endDate);
    }

    if (user) {
      filter.user = user;
    }

    const visits = await StoreVisit.paginate(filter, {
      page,
      limit,
      sort: { createdAt: -1 },
    });

    return visits;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error retrieving store visits"
    );
  }
};

const getStoreVisitById = async (id) => {
  try {
    const visit = await StoreVisit.findById(id);
    if (!visit)
      throw new ApiError(httpStatus.NOT_FOUND, "Store visit not found");
    return visit;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error retrieving store visit"
    );
  }
};

const updateStoreVisitById = async (id, updateData) => {
  try {
    const visit = await StoreVisit.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!visit)
      throw new ApiError(httpStatus.NOT_FOUND, "Store visit not found");
    return visit;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error updating store visit"
    );
  }
};

const deleteStoreVisitById = async (id) => {
  try {
    const visit = await StoreVisit.findByIdAndDelete(id);
    if (!visit)
      throw new ApiError(httpStatus.NOT_FOUND, "Store visit not found");
    return visit;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error deleting store visit"
    );
  }
};

module.exports = {
  createStoreVisit,
  fetchStoreVisits,
  getStoreVisitById,
  updateStoreVisitById,
  deleteStoreVisitById,
};
