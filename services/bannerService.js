const ApiError = require("../utils/apiError");
const { status: httpStatus } = require("http-status");

const Banner = require("../models/Banner");
const { uploadFileToS3 } = require("./fileUploads3Service");

const createNewBanner = async (req) => {
  const data = req?.body;
  const file = req.file;

  let bannerImageUrl;

  if (file) {
    bannerImageUrl = await uploadFileToS3(file, req.body.user?._id);
  }

  const input = {
    ...data,
    bannerImageUrl,
  };
  return await Banner.create(input);
};

/**
 * Query for banner with pagination and options
 * @param {Object} options - Query options (e.g., pagination, sort, populate)
 * @returns {Promise<QueryResult>}
 */

const fetchBanners = async (req) => {
  try {
    const page = req?.query?.page;
    const limit = req?.query?.limit;
    const query = req?.query?.search || "";

    const banners = await Banner.paginate(
      {
        bannerName: { $regex: query, $options: "i" },
      },
      {
        page,
        limit,
      }
    );

    if (!banners || banners.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, "No Banner found");
    }

    return banners;
  } catch (err) {
    console.log(err);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error retrieving banners"
    );
  }
};

const getBannerByIdService = async (id) => {
  try {
    const banner = await Banner.findById(id);

    if (!banner) {
      throw new ApiError(httpStatus.NOT_FOUND, "Banner not found");
    }

    return banner;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error retrieving banner"
    );
  }
};

const updateBannerById = async (id, req) => {
  try {
    const data = req?.body;
    const file = req.res.sendFile("path");

    let bannerImageUrl = null;

    if (file) {
      bannerImageUrl = await uploadFileToS3(file, req.body.user?._id);
    }

    const input = {
      ...data,
    };

    if (bannerImageUrl) {
      input["bannerImageUrl"] = bannerImageUrl;
    }

    const banner = await Banner.findByIdAndUpdate(id, input, {
      new: true,
      runValidators: true,
    });
    if (!banner) throw new ApiError(httpStatus.NOT_FOUND, "Banner not found");
    return banner;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error updating banner"
    );
  }
};

const deleteBannerById = async (id) => {
  try {
    const banner = await Banner.findByIdAndDelete(id);
    if (!banner) throw new ApiError(httpStatus.NOT_FOUND, "Banner not found");
    return banner;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error deleting banner"
    );
  }
};

module.exports = {
  createNewBanner,
  fetchBanners,
  getBannerByIdService,
  updateBannerById,
  deleteBannerById,
};
