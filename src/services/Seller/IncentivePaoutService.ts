import mongoose from "mongoose";
import IncentivePayoutModel from "../../models/IncentivePayout";
import { Request } from "express";
import ApiError from "../../utils/apiError";

export const fetchIncentivePayouts = async (req: any) => {
    const {
        page = 1,
        limit = 10,
        search = '',
        state,
        city,
        salePerson,
    } = req.query;

    const matchStage: any = {};

    // Filter by salePersonId
    if (salePerson) {
        matchStage["userInfo.salePerson"] = new mongoose.Types.ObjectId(salePerson);
    }

    if (search) {
        matchStage.$or = [
            { id: search }, // Search by orderId (if number)
            { "salePersonInfo.phone": { $regex: search, $options: "i" } }, // Search by user name
            { "salePersonInfo.fullName": { $regex: search, $options: "i" } }, // Search by salesperson name
            { "salePersonInfo.id": { $regex: search, $options: "i" } }, // Search by user name
            { "salePersonInfo.email": { $regex: search, $options: "i" } }, // Search by user name

        ];
    }

    // Filter by state (user billing address state)
    if (state) {
        matchStage["salePersonInfo.permenentAddress.state._id"] = new mongoose.Types.ObjectId(state);
    }

    // Filter by city (user billing address city)
    if (city) {
        matchStage["salePersonInfo.permenentAddress.city._id"] = new mongoose.Types.ObjectId(city);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const basePipeline = [
        {
            $lookup: {
                from: "users",
                localField: "salePerson",
                foreignField: "_id",
                as: "salePersonInfo"
            }
        },
        {
            $unwind: {
                path: "$salePersonInfo",
                preserveNullAndEmptyArrays: true
            }
        },

        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "userInfo"
            }
        },
        { $unwind: "$userInfo" },

        {
            $lookup: {
                from: "cities",
                localField: "salePersonInfo.permenentAddress.city",
                foreignField: "_id",
                as: "salePersonInfo.permenentAddress.city"
            }
        },
        {
            $unwind: {
                path: "$salePersonInfo.permenentAddress.city",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "states",
                localField: "salePersonInfo.permenentAddress.state",
                foreignField: "_id",
                as: "salePersonInfo.permenentAddress.state"
            }
        },
        {
            $unwind: {
                path: "$salePersonInfo.permenentAddress.state",
                preserveNullAndEmptyArrays: true
            }
        },
        { $match: matchStage }
    ];

    // Count total documents before applying pagination
    const totalResult = await IncentivePayoutModel.aggregate([
        ...basePipeline,
        { $count: "total" }
    ]);

    const totalDocs = totalResult[0]?.total || 0;
    const totalPages = Math.ceil(totalDocs / limit);

    // Apply pagination after count
    const pipeline = [
        ...basePipeline,
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: Number(limit) },
        {
            $project: {
                _id: 1,
                id: 1,
                totalOrderAmount: 1,
                percentageIncentive: 1,
                totalIncentiveAmount: 1,
                status: 1,
                createdAt: 1,
                updatedAt: 1,
                user: "$userInfo",
                salePerson: "$salePersonInfo"
            }
        }
    ];

    const docs = await IncentivePayoutModel.aggregate(pipeline);

    return {
        docs,
        totalDocs,
        page: Number(page),
        limit: Number(limit),
        totalPages
    };
};



export const fetchIncentivePayoutReport = async (req: Request) => {
    const {
        month,
        year,
        page = 1,
        limit = 10,
        search,
        state,
        city,
        salePerson
    }: any = req.query;

    // Validate if month and year are provided
    if (!month || !year) {
        throw new ApiError(400, `Month and Year are required`);
    }

    // Ensure valid month and year
    if (isNaN(Number(month)) || isNaN(Number(year))) {
        throw new ApiError(400, `Invalid month or year`);
    }

    // Get the first and last date of the month in UTC format
    const startDate = new Date(Date.UTC(Number(year), Number(month) - 1, 1));
    const endDate = new Date(Date.UTC(Number(year), Number(month), 0, 23, 59, 59, 999));

    // Match conditions for filtering orders by createdAt
    const matchConditions: any = {
        createdAt: { $gte: startDate, $lte: endDate },
    };

    // User match conditions for search, state, city, salePerson
    const userMatchConditions: any = {};

    // Handle search query
    if (search) {
        userMatchConditions.$or = [
            { "salePersonInfo.fullName": { $regex: search, $options: "i" } },
            { "salePersonInfo.email": { $regex: search, $options: "i" } },
            { "salePersonInfo.phone": { $regex: search, $options: "i" } },
            { "salePersonInfo.id": { $regex: search, $options: "i" } }
        ];
    }

    // Handle state filter
    if (state) {
        userMatchConditions["salePersonInfo.permenentAddress.state"] = new mongoose.Types.ObjectId(state);
    }

    // Handle city filter
    if (city) {
        userMatchConditions["salePersonInfo.permenentAddress.city"] = new mongoose.Types.ObjectId(city);
    }

    // Handle salePerson filter
    if (salePerson) {
        userMatchConditions["salePerson"] = new mongoose.Types.ObjectId(salePerson);
    }

    console.log(userMatchConditions, 'userMatchConditions');

    // Aggregation pipeline
    const aggregationPipeline = [
        { $match: matchConditions },
        {
            $group: {
                _id: "$salePerson",
                totalPurchaseAmount: { $sum: "$totalIncentiveAmount" },
                totalOrderAmount: { $sum: "$totalOrderAmount" },  // Added this line
                orderCount: { $sum: 1 }
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "_id", // Fixed from "salePerson"
                foreignField: "_id",
                as: "salePersonInfo"
            }
        },
        { $unwind: { path: "$salePersonInfo", preserveNullAndEmptyArrays: true } },
        { $match: userMatchConditions },

        // Lookup city information
        {
            $lookup: {
                from: "cities",
                localField: "salePersonInfo.permenentAddress.city",
                foreignField: "_id",
                as: "cityInfo"
            }
        },
        { $unwind: { path: "$cityInfo", preserveNullAndEmptyArrays: true } },

        // Lookup state information
        {
            $lookup: {
                from: "states",
                localField: "salePersonInfo.permenentAddress.state",
                foreignField: "_id",
                as: "stateInfo"
            }
        },
        { $unwind: { path: "$stateInfo", preserveNullAndEmptyArrays: true } },

        {
            $project: {
                _id: 0,
                userId: "$salePersonInfo._id",
                userName: "$salePersonInfo.fullName",
                email: "$salePersonInfo.email",
                phone: "$salePersonInfo.phone",
                state: "$stateInfo.name",
                city: "$cityInfo.name",
                salePerson: "$salePersonInfo.fullName",
                salePersonEmail: "$salePersonInfo.email",
                salePersonPhone: "$salePersonInfo.phone",
                id: "$salePersonInfo.id",
                totalPurchaseAmount: { $round: ["$totalPurchaseAmount", 2] }, // Rounded to 2 decimal places
                totalOrderAmount: { $round: ["$totalOrderAmount", 2] }, // Rounded to 2 decimal places
                orderCount: 1,
            }
        },
        { $sort: { totalPurchaseAmount: -1 } },
        { $skip: (Number(page) - 1) * Number(limit) },
        { $limit: Number(limit) }
    ];

    // Total count query
    const totalCountQuery = [
        { $match: matchConditions },
        { $group: { _id: "$salePerson" } },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "salePersonInfo"
            }
        },
        { $unwind: "$salePersonInfo" },
        { $match: userMatchConditions },
        { $count: "totalResults" }
    ];

    const [customerReport, totalCountResult] = await Promise.all([
        IncentivePayoutModel.aggregate(aggregationPipeline),
        IncentivePayoutModel.aggregate(totalCountQuery)
    ]);

    const totalResults = totalCountResult.length > 0 ? totalCountResult[0].totalResults : 0;
    const totalPages = limit > 0 ? Math.ceil(totalResults / limit) : 0;

    const monthName = new Date(Date.UTC(Number(year), Number(month) - 1, 1))
        .toLocaleString('default', { month: 'short', year: 'numeric' });

    return {
        report: customerReport,
        monthYear: monthName,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            totalResults,
            totalPages
        }
    };
};
