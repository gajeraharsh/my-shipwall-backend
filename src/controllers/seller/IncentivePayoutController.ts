import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import ApiResponse from '../../utils/apiResponse';

import {
    fetchIncentivePayoutReport,
    fetchIncentivePayouts
} from '../../services/Seller/IncentivePaoutService';


export const getIncentivePayouts = asyncHandler(async (req: Request, res: Response) => {
    const incentives = await fetchIncentivePayouts(req);
    return res.status(200).json(new ApiResponse(200, { incentives }, 'Incentive payout retrieved successfully'));
});

export const getIncentivePayoutsReport = asyncHandler(async (req: Request, res: Response) => {
    const incentives = await fetchIncentivePayoutReport(req);
    return res.status(200).json(new ApiResponse(200, { incentives }, 'Incentive payout report retrieved successfully'));
});

