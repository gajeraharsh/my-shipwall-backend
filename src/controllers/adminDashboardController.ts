import { Request, Response } from "express";
import ApiResponse from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import ApiError from "../utils/apiError";
import Order from "../models/Order";
import Product from "../models/Product";
import ContactUs from "../models/ContactUs";
import Support from "../models/Support";
import ReturnOrder from "../models/ReturnOrder";
import RejectionOrder from "../models/RejectionOrder";

const calculateTotalSales = async () => {
    try {
        const result = await Order.aggregate([
            {
                $match: {
                    orderStatus: "delevered" // correct spelling
                }
            },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: "$finalTotal" }
                }
            }
        ]);

        return result[0]?.totalSales || 0;
    } catch (error) {
        console.error("Error calculating total sales:", error);
        throw error;
    }
};

export const getDashboardMetrics = asyncHandler(async (req: Request, res: Response) => {
    try {
        const [
            totalSales,
            totalProducts,
            totalOrders,
            totalEnquirys,
            totalSupports,
            totalReturnOrder,
            totalRejectionOrder
        ] = await Promise.all([
            calculateTotalSales(),
            Product.countDocuments(),
            Order.countDocuments(),
            ContactUs.countDocuments(),
            Support.countDocuments(),
            ReturnOrder.countDocuments(),
            RejectionOrder.countDocuments()
        ]);

        const dashboardData = {
            totalSales,
            totalProducts,
            totalOrders,
            totalEnquirys,
            totalSupports,
            totalReturnOrder,
            totalRejectionOrder
        };

        return res.status(200).json(new ApiResponse(200, dashboardData, 'Dashboard metrics retrieved successfully'));
    } catch (err: any) {
        throw new ApiError(500, err.message || 'Could not retrieve dashboard metrics');
    }
});
