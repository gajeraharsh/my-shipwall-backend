// cron/rewardCron.js
const cron = require("node-cron");
const Order = require("../models/Order");
const User = require("../models/User");
const GeneralSettingModel = require("../models/generalSetting");
const { calculateTotalRewardByProduct } = require("../utils/helperFunction");
const RewardModel = require("../models/Rewards");
const CustomerRewardCredit = require("../models/CustomerRewardCredit");

const rewardCronJob = cron.schedule("0 0 * * *", async () => {
  console.log("Running Reward Points Cron Job...");

  const generalSettings = await GeneralSettingModel.findOne();

  if (!generalSettings) {
    console.log("⚠️ No general settings found. Skipping reward cron.");
    return;
  }

  const methodOfReward = generalSettings?.methodOfReward;
  const returnDays = generalSettings?.returnDays || 3;

  try {
    const eligibleDate = new Date();

    // eligibleDate.setMinutes(eligibleDate.getMinutes() - 5);
    eligibleDate.setDate(eligibleDate.getDate() - returnDays);

    const orders = await Order.find({
      orderStatus: "delevered",
      rewardStatus: "pending",
      deliveredAt: { $lte: eligibleDate },
    }).populate([
      {
        path: "user",
        select: "_id id salePerson",
      },
      {
        path: "products.product",
        select: "_id id rewardPoints stock",
      },
    ]);

    for (let order of orders) {
      if (methodOfReward) {
        let rewardCount = 0;
        if (methodOfReward == "product") {
          rewardCount = await calculateTotalRewardByProduct(order);
        }

        if (methodOfReward == "orderValue") {
          const reward = await RewardModel.findOne({
            minAmount: { $lte: order.finalTotal },
            maxAmount: { $gte: order.finalTotal },
          }).sort({ minAmount: 1 });

          rewardCount = reward?.rewardPoints || 0;
        }

        if (rewardCount > 0) {
          await CustomerRewardCredit.create({
            amount: rewardCount,
            user: order.user?._id,
            type: "credit",
            description: `Rewards for Order ${order?.id}`,
            referenceId: order._id,
          });

          const user = await User.findByIdAndUpdate(
            order.user?._id,
            {
              $inc: {
                rewards: Number(rewardCount),
              },
            },
            { new: true }
          );

          order.rewardStatus = "given";
          await order.save();

          console.log(
            `✅ Credited ${rewardCount} reward points to user ${order.user} for order ${order._id}`
          );
        }
      }
    }
  } catch (error) {
    console.error("Error in reward cron:", error);
  }
});

module.exports = rewardCronJob;
