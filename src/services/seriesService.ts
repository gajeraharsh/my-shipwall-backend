import Series from '../models/Series';
import ApiError from '../utils/apiError';
import { ISeriesbody } from '../types/ISeries';
import httpStatus from 'http-status';
import { uploadFileToS3 } from './fileUploads3Service';
import { Request } from 'express';


export const createNewSeries = async (req: Request) => {
  const seriesbody = req?.body
  const file = req.file as Express.Multer.File | undefined;

  let iconImageUrl: string | null = null;

  if (file) {
    iconImageUrl = await uploadFileToS3(file, req.body.user?._id);
  }

  const input = {
    ...seriesbody,
    thumbImageUrl: iconImageUrl
  };
  return await Series.create(input);
};

/**
* Query for Series with pagination and options
* @param {Object} options - Query options (e.g., pagination, sort, populate)
* @returns {Promise<QueryResult>}
*/


export const fetchSeries = async (req: Request, filter: any = {}) => {
  try {
    const page = req?.query?.page;
    const limit = req?.query?.limit;
    const query = req?.query?.search
    const sortBy = req?.query?.sortBy;


    const sortOptions: Record<string, any> = {};

    if (sortBy === 'New Added') {
      sortOptions.createdAt = -1;
    } else if (sortBy === 'On Sale') {
      filter.onSale = true;
    }

    // @ts-ignore
    const series = await Series.paginate({
      seriesName: { $regex: query ?? '', $options: 'i' },
      ...filter
    }, {
      page,
      limit,
      sort: sortOptions,
      populate: [
        { path: 'brand', select: '_id brandName' },
        { path: 'category', select: '_id categoryName' }
      ]
    });


    //   const series = await Series.paginate({}, {});
    // const series = await Series.find().populate('brand', 'brandName').populate('category', 'categoryName');


    if (!series || series.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, 'No series found');
    }

    return series;
  } catch (err: any) {
    console.log(err);

    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving series');
  }
}

export const fetchSeriesDropdown = async (req: Request) => {
  try {
    const filter = req.query.search
      ? { seriesName: { $regex: req.query.search, $options: 'i' } }
      : {};

    const options = {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 5,
      sortBy: 'seriesName:asc', // Optional sorting
      select: '_id seriesName',
      pagination: true, // Set to false if you want all results without pagination
    };
    // @ts-ignore
    const series = await Series.paginate(filter, options);

    // const series = await Series.find({}, { _id: 1, seriesName: 1 });

    if (!series || series.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, 'No series found');
    }
    return series;
  } catch (err: any) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving brands');
  }
};

export const getSeriesByIdService = async (seriesId: string) => {
  try {
    const series = await Series.findById(seriesId).populate('brand', 'brandName').populate('category', 'categoryName');

    if (!series) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Series not found');
    }

    return series;
  } catch (err: any) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving series');
  }
};

export const updateSeriesById = async (seriesId: string, req: Request) => {
  try {

    const data: ISeriesbody = req?.body
    const file = req.file as Express.Multer.File | undefined;

    let iconImageUrl: string | null = null;

    if (file) {
      iconImageUrl = await uploadFileToS3(file, req.body.user?._id);
    }

    const input: any = {
      ...data,
    };

    if (iconImageUrl) {
      input['thumbImageUrl'] = iconImageUrl
    }

    const series = await Series.findByIdAndUpdate(seriesId, input, { new: true, runValidators: true });
    if (!series) throw new ApiError(httpStatus.NOT_FOUND, 'Series not found');
    return series;
  } catch (err: any) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error updating series');
  }
};

export const deleteSeriesById = async (seriesId: string) => {
  try {
    const series = await Series.findByIdAndDelete(seriesId);
    if (!series) throw new ApiError(httpStatus.NOT_FOUND, 'series not found');
    return series;
  } catch (err: any) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error deleting brand');
  }
};


export const fetchAllSeries = async (req: any) => {
  try {
    const { brandId = null, categoryId = null } = req?.query

    const filter = {
      ...(brandId && {
        brand: brandId
      }),
      ...(categoryId && {
        category: categoryId
      })
    };
    const options = {
      sortBy: 'position:asc',
      pagination: false,
    };

    const series = await Series.paginate(filter, options);

    return series.results; // Return only the results array
  } catch (err: any) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving series');
  }
};

export const updateSeriesOrderService = async (seriesList: { _id: string }[]) => {
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

    return { success: true, message: "Series order updated successfully", result };
  } catch (err: any) {
    throw new ApiError(500, "Error updating series order: " + err.message);
  }
};



/**
 * Upload images to the product gallery
 */
export const updateSeriesGalleryById = async (seriesId: string, req: Request) => {
  try {
    const files = req.files as Express.Multer.File[] | undefined;
    let uploadedImages: { url: string; position: number }[] = [];

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
  } catch (err: any) {
    console.log(err);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error updating Series gallery");
  }
};

/**
 * Reorder gallery images based on user input
 */
export const reorderSeriesGallery = async (seriesId: string, newOrder: { url: string }[]) => {
  try {
    const product = await Series.findById(seriesId);
    if (!product) throw new ApiError(httpStatus.NOT_FOUND, "Series not found");

    console.log("New order:", newOrder);
    console.log("Existing gallery:", product.gallery);

    // Normalize URLs before comparison
    const imagesMap = new Map(product.gallery.map((img: any) => [img.url.trim(), img]));

    const reorderedGallery = newOrder.map((item, index) => {
      const trimmedUrl = item.url.trim(); // ✅ Extract `url` properly
      if (!imagesMap.has(trimmedUrl)) {
        console.log(`Skipping URL not found in gallery: ${trimmedUrl}`);
        return null; // Mark for removal
      }
      return { url: trimmedUrl, position: index };
    }).filter(Boolean); // Remove null entries

    console.log("Reordered gallery:", reorderedGallery);

    product.gallery = reorderedGallery;
    await product.save();

    return product;
  } catch (err: any) {
    console.error("Error reordering gallery:", err);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error reordering Series gallery");
  }
};

