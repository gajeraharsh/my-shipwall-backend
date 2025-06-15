const Series = require("../models/Series");
const ApiError = require("../utils/apiError");
const { status: httpStatus } = require("http-status");

const { uploadFileToS3 } = require("./fileUploads3Service");
const mongoose = require("mongoose");
const createNewSeries = async (req) => {
  const seriesbody = req?.body;
  const file = req.file;

  let iconImageUrl = null;

  if (file) {
    iconImageUrl = await uploadFileToS3(file, req.body.user?._id);
  }

  const input = {
    ...seriesbody,
    thumbImageUrl: iconImageUrl,
  };
  return await Series.create(input);
};

/**
 * Query for Series with pagination and options
 * @param {Object} options - Query options (e.g., pagination, sort, populate)
 * @returns {Promise<QueryResult>}
 */

const fetchSeries = async (req, filter) => {
  try {
    const page = req?.query?.page;
    const limit = req?.query?.limit;
    const query = req?.query?.search;
    const sortBy = req?.query?.sortBy;
    const isDisplayHome = req?.query?.isDisplayHome;

    const sortOptions = {};

    if (sortBy === "New Added") {
      sortOptions.createdAt = "desc"; // descending order
    } else if (sortBy === "On Sale") {
      filter.onSale = true;
      sortOptions.createdAt = "desc"; // descending order
    }

    const sortField = req?.query?.sortField || "createdAt";
    const sortOrder = req?.query?.sortOrder === "desc" ? "desc" : "asc";

    if (sortField == "brandName") {
      sortOptions["brand.brandName"] = sortOrder;
    }

    if (sortField == "categoryName") {
      sortOptions["category.categoryName"] = sortOrder;
    }

    if (sortField == "seriesName") {
      sortOptions["seriesName"] = sortOrder;
    }

    if (sortField == "status") {
      sortOptions["status"] = sortOrder;
    }

    if (sortField == "createdAt") {
      sortOptions["createdAt"] = sortOrder;
    }

    // Convert sortOptions object to string for aggregation paginate
    const sortByString = Object.entries(sortOptions)
      .map(([key, val]) => `${key}:${val}`)
      .join(",");

    console.log("sortByString", sortByString);

    // @ts-ignore
    const series = await Series.paginate(
      {
        seriesName: { $regex: query ?? "", $options: "i" },
        ...filter,
        ...(isDisplayHome && {
          isDisplayHome: true,
        }),
        isDeleted: false, // Ensure we only fetch non-deleted series
      },
      {
        page,
        limit,
        sortBy: sortByString,
        populate: [
          { path: "brand", select: "_id brandName" },
          { path: "category", select: "_id categoryName" },
        ],
      }
    );

    //   const series = await Series.paginate({}, {});
    // const series = await Series.find().populate('brand', 'brandName').populate('category', 'categoryName');

    if (!series || series.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, "No series found");
    }

    return series;
  } catch (err) {
    console.log(err);

    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error retrieving series"
    );
  }
};

const fetchSeriesDropdown = async (req) => {
  try {
    const filter = req.query.search
      ? {
          seriesName: { $regex: req.query.search, $options: "i" },
          isDeleted: false,
        }
      : { isDeleted: false };

    const category = req?.query?.category;
    const brand = req?.query?.brand;

    if (category) {
      filter.category = new mongoose.Types.ObjectId(category);
    }

    if (brand) {
      filter.brand = new mongoose.Types.ObjectId(brand);;
    }

    const options = {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 5,
      sortBy: "seriesName:asc", // Optional sorting
      select: "_id seriesName",
      pagination: false, // Set to false if you want all results without pagination
    };
    // @ts-ignore
    const series = await Series.paginate(filter, options);

    // const series = await Series.find({}, { _id: 1, seriesName: 1 });

    if (!series || series.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, "No series found");
    }
    return series;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error retrieving brands"
    );
  }
};

const getSeriesByIdService = async (seriesId) => {
  try {
    const series = await Series.findById(seriesId)
      .populate("brand", "brandName")
      .populate("category", "categoryName");

    if (!series) {
      throw new ApiError(httpStatus.NOT_FOUND, "Series not found");
    }

    return series;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error retrieving series"
    );
  }
};

const updateSeriesById = async (seriesId, req) => {
  try {
    const data = req?.body;
    const file = req.file;

    let iconImageUrl = null;

    if (file) {
      iconImageUrl = await uploadFileToS3(file, req.body.user?._id);
    }

    const input = {
      ...data,
    };

    if (iconImageUrl) {
      input["thumbImageUrl"] = iconImageUrl;
    }

    const series = await Series.findByIdAndUpdate(seriesId, input, {
      new: true,
      runValidators: true,
    });
    if (!series) throw new ApiError(httpStatus.NOT_FOUND, "Series not found");
    return series;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error updating series"
    );
  }
};

const deleteSeriesById = async (seriesId) => {
  try {
    const series = await Series.findById(seriesId);
    if (!series) throw new ApiError(httpStatus.NOT_FOUND, "series not found");
    await series.softDelete(); // Call the soft delete method
    return series;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error deleting brand"
    );
  }
};

const fetchAllSeries = async (req) => {
  try {
    const { brandId = null, categoryId = null } = req?.query;

    const filter = {
      ...(brandId && {
        brand: new mongoose.Types.ObjectId(brandId),
      }),
      ...(categoryId && {
        category: new mongoose.Types.ObjectId(categoryId),
      }),
    };
    const options = {
      sortBy: "position:asc",
      pagination: false,
    };

    const series = await Series.paginate(filter, options);

    return series.results; // Return only the results array
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error retrieving series"
    );
  }
};

const updateSeriesOrderService = async (seriesList) => {
  try {
    if (!seriesList || seriesList.length === 0) {
      throw new ApiError(400, "Invalid series list");
    }

    const bulkOps = seriesList.map((series, index) => ({
      updateOne: {
        filter: { _id: series },
        update: { $set: { position: index + 1 } }, // Change the value slightly
        upsert: true, // Ensures update happens even if no change detected
      },
    }));

    const result = await Series.bulkWrite(bulkOps);

    return {
      success: true,
      message: "Series order updated successfully",
      result,
    };
  } catch (err) {
    throw new ApiError(500, "Error updating series order: " + err.message);
  }
};

/**
 * Upload images to the product gallery
 */
const updateSeriesGalleryById = async (seriesId, req) => {
  try {
    const files = req.files;
    let uploadedImages = [];

    const product = await Series.findById(seriesId);
    if (!product) throw new ApiError(httpStatus.NOT_FOUND, "Series not found");

    const existingImages = product.gallery || [];
    let newPosition = existingImages.length; // Append new images at the end

    if (files && files.length > 0) {
      const uploadedUrls = await Promise.all(
        files.map((file) => uploadFileToS3(file, req.user?._id))
      );

      uploadedImages = uploadedUrls.map((url, index) => ({
        url,
        position: newPosition + index, // Maintain position
      }));
    }

    product.gallery.push(...uploadedImages);
    await product.save();

    return product;
  } catch (err) {
    console.log(err);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error updating Series gallery"
    );
  }
};

/**
 * Reorder gallery images based on user input
 */
const reorderSeriesGallery = async (seriesId, newOrder) => {
  try {
    const product = await Series.findById(seriesId);
    if (!product) throw new ApiError(httpStatus.NOT_FOUND, "Series not found");

    console.log("New order:", newOrder);
    console.log("Existing gallery:", product.gallery);

    // Normalize URLs before comparison
    const imagesMap = new Map(
      product.gallery.map((img) => [img.url.trim(), img])
    );

    const reorderedGallery = newOrder
      .map((item, index) => {
        const trimmedUrl = item.url.trim(); // ✅ Extract `url` properly
        if (!imagesMap.has(trimmedUrl)) {
          console.log(`Skipping URL not found in gallery: ${trimmedUrl}`);
          return null; // Mark for removal
        }
        return { url: trimmedUrl, position: index };
      })
      .filter(Boolean); // Remove null entries

    console.log("Reordered gallery:", reorderedGallery);

    product.gallery = reorderedGallery;
    await product.save();

    return product;
  } catch (err) {
    console.error("Error reordering gallery:", err);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error reordering Series gallery"
    );
  }
};

module.exports = {
  createNewSeries,
  fetchSeries,
  fetchSeriesDropdown,
  getSeriesByIdService,
  updateSeriesById,
  deleteSeriesById,
  fetchAllSeries,
  updateSeriesOrderService,
  updateSeriesGalleryById,
  reorderSeriesGallery,
};
