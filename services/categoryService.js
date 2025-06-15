const Category = require("../models/Category");
const ApiError = require("../utils/apiError");
const { status: httpStatus } = require("http-status");

const { uploadFileToS3 } = require("./fileUploads3Service");
const { default: mongoose } = require("mongoose");

const createNewCategory = async (req) => {
  const data = req?.body;
  const file = req.file;

  let iconImageUrl;

  if (file) {
    iconImageUrl = await uploadFileToS3(file, req.body.user?._id);
  }

  const input = {
    ...data,
    iconImageUrl,
  };

  return await Category.create(input);
};

/**
 * Query for categories with pagination and options
 * @param {Object} options - Query options (e.g., pagination, sort, populate)
 * @returns {Promise<QueryResult>}
 */
const getCategoryByIdService = async (categoryId) => {
  try {
    const category = await Category.findById(categoryId).populate(
      "brand",
      "brandName"
    );

    if (!category) {
      throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
    }

    return category;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error retrieving category"
    );
  }
};

const fetchCategories = async (req) => {
  try {
    const page = req?.query?.page;
    const limit = req?.query?.limit;
    const query = req?.query?.search;

    const sortField = req?.query?.sortField || "createdAt";
    const sortOrder = req?.query?.sortOrder === "asc" ? "asc" : "desc";
    const sortOptions = {};

    if (sortField == "brandName") {
      sortOptions["brand.brandName"] = sortOrder;
    } else {
      sortOptions[sortField] = sortOrder;
    }

    sortByString = Object.entries(sortOptions)
      .map(([key, val]) => `${key}:${val}`)
      .join(",");

    /// @ts-ignore
    const categories = await Category.paginate(
      {
        categoryName: { $regex: query ?? "", $options: "i" },
        isDeleted: false,
      },
      {
        page,
        limit,
        populate: [{ path: "brand", select: "_id brandName" }],
        sortBy: sortByString,
      }
    );

    if (!categories || categories.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, "No categories found");
    }

    return categories;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error retrieving categories"
    );
  }
};

const fetchCategoriesDropdown = async (req) => {
  try {
    const filter = req.query.search
      ? {
          isDeleted: false,
          categoryName: { $regex: req.query.search, $options: "i" },
        }
      : {
          isDeleted: false,
        };

    const brand = req?.query?.brand;

    if (brand) {
      filter.brand = new mongoose.Types.ObjectId(brand);
    }

    console.log(filter,"filter new");

    const options = {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 5,
      sortBy: "categoryName:asc", // Optional sorting
      select: "_id categoryName",
      pagination: false,
    };
    // @ts-ignore
    const categories = await Category.paginate(filter, options);

    if (!categories || categories.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, "No categories found");
    }
    return categories;
  } catch (err) {
    console.log(err)
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error retrieving categories"
    );
  }
};

const updateCategoryIdById = async (categoryId, req) => {
  try {
    const data = req?.body;
    const file = req.file;

    let iconImageUrl;

    if (file) {
      iconImageUrl = await uploadFileToS3(file, req.body.user?._id);
    }

    const input = {
      ...data,
    };

    if (iconImageUrl) {
      input["iconImageUrl"] = iconImageUrl;
    }

    const category = await Category.findByIdAndUpdate(categoryId, input, {
      new: true,
      runValidators: true,
    });
    if (!category)
      throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
    return category;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error updating category"
    );
  }
};

const deleteCategoryIdById = async (categoryId) => {
  try {
    const category = await Category.findById(categoryId);
    if (!category)
      throw new ApiError(httpStatus.NOT_FOUND, "Category not found");

    await category.softDelete();

    return category;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error deleting category"
    );
  }
};

const fetchAllCategories = async (req) => {
  try {
    const { brandId = null } = req?.query;

    const filter = {
      ...(brandId && {
        brand: new mongoose.Types.ObjectId(brandId),
      }),
      isDeleted: false,
    };

    const options = {
      sortBy: "position:asc",
      pagination: false,
    };

    const categories = await Category.paginate(filter, options);

    return categories.results;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error retrieving categories"
    );
  }
};

const fetchAllWebCategories = async (req) => {
  try {
    const { brandId = null } = req?.query;

    const filter = {
      ...(brandId && {
        brand: new mongoose.Types.ObjectId(brandId),
      }),
      status: "Published",
      isDeleted: false,
    };

    const options = {
      sortBy: "position:asc",
      pagination: false,
    };

    const categories = await Category.paginate(filter, options);

    return categories.results;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error retrieving categories"
    );
  }
};

const updateCategoryOrderService = async (categories) => {
  try {
    if (!categories || categories.length === 0) {
      throw new ApiError(400, "Invalid categorries list");
    }

    const bulkOps = categories.map((category, index) => ({
      updateOne: {
        filter: { _id: category },
        update: { $set: { position: index + 1 } },
        upsert: true,
      },
    }));

    const result = await Category.bulkWrite(bulkOps);

    return {
      success: true,
      message: "Category order updated successfully",
      result,
    };
  } catch (err) {
    throw new ApiError(500, "Error updating category order: " + err.message);
  }
};

module.exports = {
  createNewCategory,
  getCategoryByIdService,
  fetchCategories,
  fetchCategoriesDropdown,
  updateCategoryIdById,
  deleteCategoryIdById,
  fetchAllCategories,
  updateCategoryOrderService,
  fetchAllWebCategories,
};
