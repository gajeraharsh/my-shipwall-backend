const Brand = require("../models/Brand");
const ApiError = require("../utils/apiError");
const { status: httpStatus } = require("http-status");

const createNewBrand = async (brandBody) => {
  const brandData = {
    ...brandBody,
  };
  return await Brand.create(brandData);
};

/**
 * Query for brands with pagination and options
 * @param {Object} options - Query options (e.g., pagination, sort, populate)
 * @returns {Promise<QueryResult>}
 */

const fetchBrands = async (req) => {
  try {
    const page = req?.query?.page;
    const limit = req?.query?.limit;
    const query = req?.query?.search ?? "";
    const sortField = req?.query?.sortField || "createdAt";
    const sortOrder = req?.query?.sortOrder === "asc" ? "asc" : "desc";
    const sortOptions = {};

    sortOptions[sortField] = sortOrder;

    sortByString = Object.entries(sortOptions)
      .map(([key, val]) => `${key}:${val}`)
      .join(",");

    const brands = await Brand.paginate(
      {
        brandName: { $regex: query, $options: "i" },
        isDeleted: false, // Ensure we only fetch non-deleted brands
      },
      {
        page,
        limit,
        sortBy: sortByString,
      }
    );

    // const brands = await Brand.find();

    if (!brands || brands.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, "No brands found");
    }

    return brands;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error retrieving brands"
    );
  }
};

const fetchBrandsDropdown = async (req) => {
  try {
    const filter = req.query.search
      ? {
          brandName: { $regex: req.query.search, $options: "i" },
          isDeleted: false,
        }
      : {
          isDeleted: false,
        };

    const options = {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 5,
      select: "_id brandName",
      pagination: false,
    };

    const brands = await Brand.paginate(filter, options);

    // if (!brands || brands.length === 0) {
    //   throw new ApiError(httpStatus.NOT_FOUND, 'No brands found');
    // }
    return brands;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error retrieving brands"
    );
  }
};

const getBrandByIdService = async (brandId) => {
  try {
    const brand = await Brand.findById(brandId);

    if (!brand) {
      throw new ApiError(httpStatus.NOT_FOUND, "Brand not found");
    }

    return brand;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error retrieving brand"
    );
  }
};

const updateBrandById = async (brandId, updateData) => {
  try {
    const brand = await Brand.findByIdAndUpdate(brandId, updateData, {
      new: true,
      runValidators: true,
    });
    if (!brand) throw new ApiError(httpStatus.NOT_FOUND, "Brand not found");
    return brand;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error updating brand"
    );
  }
};

const deleteBrandById = async (brandId) => {
  try {
    const brand = await Brand.findById(brandId);

    if (!brand) throw new ApiError(httpStatus.NOT_FOUND, "Brand not found");
    if (brand) {
      brand.softDelete();
    }
    return brand;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error deleting brand"
    );
  }
};

const fetchAllBrands = async (req) => {
  try {
    const filter = {
      isDeleted: false,
    }; // No specific filter to get all brands
    const options = {
      sortBy: "position:asc", // Sort by position in ascending order
      pagination: false,
    };

    const brands = await Brand.paginate(filter, options);

    return brands.results; // Return only the results array
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error retrieving brands"
    );
  }
};

const updateBrandOrderService = async (brands) => {
  try {
    if (!brands || brands.length === 0) {
      throw new ApiError(400, "Invalid brand list");
    }

    const bulkOps = brands.map((brand, index) => ({
      updateOne: {
        filter: { _id: brand },
        update: { $set: { position: index + 1 } }, // Change the value slightly
        upsert: true, // Ensures update happens even if no change detected
      },
    }));

    const result = await Brand.bulkWrite(bulkOps);

    return {
      success: true,
      message: "Brand order updated successfully",
      result,
    };
  } catch (err) {
    throw new ApiError(500, "Error updating brand order: " + err.message);
  }
};

module.exports = {
  createNewBrand,
  fetchBrands,
  fetchBrandsDropdown,
  getBrandByIdService,
  updateBrandById,
  deleteBrandById,
  fetchAllBrands,
  updateBrandOrderService,
};
