const { asyncHandler } = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");

const {
  fetchIncentivePayoutReport,
  fetchIncentivePayouts,
} = require("../../services/Seller/IncentivePaoutService");

const getIncentivePayouts = asyncHandler(async (req, res) => {
  const incentives = await fetchIncentivePayouts(req);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { incentives },
        "Incentive payout retrieved successfully"
      )
    );
});

const getIncentivePayoutsReport = asyncHandler(async (req, res) => {
  const incentives = await fetchIncentivePayoutReport(req);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { incentives },
        "Incentive payout report retrieved successfully"
      )
    );
});

module.exports = {
  getIncentivePayouts,
  getIncentivePayoutsReport,
};
