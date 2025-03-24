import { Request, Response } from "express";
import mongoose from "mongoose";
import ApiError from "../../utils/apiError";
import { asyncHandler } from "../../utils/asyncHandler";
import Series from "../../models/Series";
import httpStatus from "http-status";
import Product from "../../models/Product";

// export const getProductsByCategory = asyncHandler(async (req: Request, res: Response) => {
//   try {
//     const { categoryId, brandId } = req.query;

//     const query: any = {};
//     if (categoryId) query.category = new mongoose.Types.ObjectId(categoryId as string);
//     if (brandId) query.brand = new mongoose.Types.ObjectId(brandId as string);
//     query.status = "Published"; // Merge product status filter here

//     const seriesWithProducts = await Series.aggregate([
//       { $match: query },

//       // Sort series by position ASC (before grouping)
//       { $sort: { position: 1 } },

//       {
//         $lookup: {
//           from: "categories",
//           localField: "category",
//           foreignField: "_id",
//           as: "category",
//         },
//       },
//       { $unwind: "$category" },

//       {
//         $lookup: {
//           from: "products",
//           let: { seriesId: "$_id" },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $and: [
//                     { $eq: ["$series", "$$seriesId"] },
//                     { $eq: ["$status", "Published"] }
//                   ]
//                 }
//               }
//             },
//             {
//               $lookup: {
//                 from: "colormasters",
//                 localField: "color",
//                 foreignField: "_id",
//                 as: "colorDetails"
//               }
//             },
//             {
//               $unwind: {
//                 path: "$colorDetails",
//                 preserveNullAndEmptyArrays: true
//               }
//             },
//             { $sort: { position: 1 } }, // Sort products by position inside each series
//             {
//               $project: {
//                 _id: 1,
//                 modelNo: 1,
//                 watt: 1,
//                 bodyColor: 1,
//                 unitPrice: 1,
//                 stock: 1,
//                 unitsInBox: 1,
//                 price: 1,
//                 boxQuantity: 1,
//                 color: {
//                   _id: "$colorDetails._id",
//                   colorName: "$colorDetails.colorName",
//                   colorCode: "$colorDetails.colorCode"
//                 }
//               }
//             }
//           ],
//           as: "products"
//         }
//       },

//       {
//         $project: {
//           _id: 1,
//           seriesName: 1,
//           thumbImageUrl: 1,
//           category: {
//             _id: "$category._id",
//             categoryName: "$category.categoryName"
//           },
//           products: 1
//         }
//       }
//     ]);

//     res.status(httpStatus.OK).json({ series: seriesWithProducts });
//   } catch (err: any) {
//     console.error(err);
//     throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error retrieving products");
//   }
// });

export const getProductsByCategory = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { categoryId, brandId } = req.query;

    const matchStage: any = {
      status: "Published",
    };

    if (categoryId) {
      matchStage.category = new mongoose.Types.ObjectId(categoryId as string);
    }

    if (brandId) {
      matchStage.brand = new mongoose.Types.ObjectId(brandId as string);
    }

    const seriesWithProducts = await Product.aggregate([
      { $match: matchStage },

      // Lookup color details
      {
        $lookup: {
          from: "colormasters",
          localField: "color",
          foreignField: "_id",
          as: "colorDetails",
        },
      },
      {
        $unwind: {
          path: "$colorDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Lookup series details
      {
        $lookup: {
          from: "series",
          localField: "series",
          foreignField: "_id",
          as: "seriesDetails",
        },
      },
      {
        $unwind: {
          path: "$seriesDetails",
        },
      },

      // Lookup category details
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      {
        $unwind: {
          path: "$categoryDetails",
        },
      },

      // Group products by series
      {
        $group: {
          _id: "$series",
          seriesName: { $first: "$seriesDetails.seriesName" },
          thumbImageUrl: { $first: "$seriesDetails.thumbImageUrl" },
          gallery: { $first: "$seriesDetails.gallery" },
          category: {
            $first: {
              _id: "$categoryDetails._id",
              categoryName: "$categoryDetails.categoryName",
            },
          },
          products: {
            $push: {
              _id: "$_id",
              modelNo: "$modelNo",
              watt: "$watt",
              bodyColor: "$bodyColor",
              unitPrice: "$unitPrice",
              stock: "$stock",
              unitsInBox: "$unitsInBox",
              price: "$price",
              boxQuantity: "$boxQuantity",
              structure: "$structure",
              color: {
                _id: "$colorDetails._id",
                colorName: "$colorDetails.colorName",
                colorCode: "$colorDetails.colorCode",
              },
              position: "$position",
            },
          },
        },
      },

      // Sort series by seriesDetails.position and products by product.position
      {
        $sort: {
          "products.position": 1,
          "seriesDetails.position": 1,
        },
      },
    ]);

    res.status(httpStatus.OK).json({ series: seriesWithProducts });
  } catch (err: any) {
    console.error(err);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error retrieving products");
  }
});
