import { Request, Response } from "express";
import mongoose from "mongoose";
import ApiError from "../../utils/apiError";
import { asyncHandler } from "../../utils/asyncHandler";
import Series from "../../models/Series";
import httpStatus from "http-status";

export const getProductsByCategory = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { categoryId, brandId } = req.query;

    const query: any = {};
    if (categoryId) query.category = new mongoose.Types.ObjectId(categoryId as string);
    if (brandId) query.brand = new mongoose.Types.ObjectId(brandId as string);

    const seriesWithProducts = await Series.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "series",
          as: "products",
        },
      },
      { $unwind: "$products" }, // Unwind products to perform lookup on each product
      {
        $lookup: {
          from: "colormasters",
          localField: "products.color",
          foreignField: "_id",
          as: "products.colorDetails",
        },
      },
      {
        $unwind: {
          path: "$products.colorDetails",
          preserveNullAndEmptyArrays: true, // Preserve products without color info
        },
      },
      {
        $group: {
          _id: "$_id",
          seriesName: { $first: "$seriesName" },
          thumbImageUrl: { $first: "$thumbImageUrl" },
          category: { $first: { _id: "$category._id", categoryName: "$category.categoryName" } },
          products: {
            $push: {
              _id: "$products._id",
              modelNo: "$products.modelNo",
              watt: "$products.watt",
              bodyColor: "$products.bodyColor",
              unitPrice: "$products.unitPrice",
              stock: "$products.stock",
              unitsInBox: "$products.unitsInBox",
              price: "$products.price",
              boxQuantity:"$products.boxQuantity",
              color: {
                _id: "$products.colorDetails._id",
                colorName: "$products.colorDetails.colorName",
                colorCode: "$products.colorDetails.colorCode",
              },
            },
          },
        },
      },
    ]);

    res.status(httpStatus.OK).json({ series: seriesWithProducts });
  } catch (err: any) {
    console.error(err);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error retrieving products");
  }
});
