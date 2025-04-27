const ApiError = require("../utils/apiError");
const { status: httpStatus } = require("http-status");

const RewardProducts = require("../models/RewardProducts");
const { uploadFileToS3 } = require("./fileUploads3Service");

const createRewarProductsService = async (req) => {
  const data = req?.body;
  const file = req.file;

  let thumbImage = null;

  if (file) {
    thumbImage = await uploadFileToS3(file, req.body.user?._id);
  }

  const input = {
    ...data,
    thumbImage,
  };
  return await RewardProducts.create(input);
};

/**
 * Query for banner with pagination and options
 * @param {Object} options - Query options (e.g., pagination, sort, populate)
 * @returns {Promise<QueryResult>}
 */

const fetchRewardsProdcts = async (req) => {
  try {
    const page = req?.query?.page;
    const limit = req?.query?.limit;
    const query = req?.query?.search || "";

    const rewardsProducts = await RewardProducts.paginate(
      {
        name: { $regex: query, $options: "i" },
      },
      {
        page,
        limit,
      }
    );

    if (!rewardsProducts || rewardsProducts.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, "No rewards products not found");
    }

    return rewardsProducts;
  } catch (err) {
    console.log(err);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error retrieving rewards products"
    );
  }
};

const getRewardProductsByIdService = async (id) => {
  try {
    const rewardProduct = await RewardProducts.findById(id);

    if (!rewardProduct) {
      throw new ApiError(httpStatus.NOT_FOUND, "Rewards products not found");
    }

    return rewardProduct;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error rewards product"
    );
  }
};

const updateRewardProductById = async (id, req) => {
  try {
    const data = req?.body;
    const file = req.file;

    let thumbImage = null;

    if (file) {
      thumbImage = await uploadFileToS3(file, req.body.user?._id);
    }

    const input = {
      ...data,
    };

    if (thumbImage) {
      input["thumbImage"] = thumbImage;
    }

    const rewardProduct = await RewardProducts.findByIdAndUpdate(id, input, {
      new: true,
      runValidators: true,
    });
    if (!rewardProduct)
      throw new ApiError(httpStatus.NOT_FOUND, "Reward products not found");
    return rewardProduct;
  } catch (err) {
    console.log(err,'err')

    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error updating reward products"
    );
  }
};

const deleteRewardProductById = async (id) => {
  try {
    const rewardProduct = await RewardProducts.findByIdAndDelete(id);
    if (!rewardProduct)
      throw new ApiError(httpStatus.NOT_FOUND, "Reward products not found");
    return rewardProduct;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error deleting rewqard products"
    );
  }
};

module.exports = {
  createRewarProductsService,
  fetchRewardsProdcts,
  getRewardProductsByIdService,
  updateRewardProductById,
  deleteRewardProductById,
};
