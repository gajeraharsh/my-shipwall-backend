const mongoose = require("mongoose");
const { Schema } = mongoose;
const paginate = require("./plugins/paginate");
const incrementId = require("./plugins/incrementId");

const RewardsSchema = new Schema(
  {
    minAmount: {
      type: Number,
      required: true,
    },
    maxAmount: {
      type: Number,
      required: true,
    },
    rewardPoints: {
      type: Number,
      required: true,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

RewardsSchema.plugin(paginate);
RewardsSchema.plugin(incrementId);

const RewardModel = mongoose.model("Reward", RewardsSchema);

module.exports = RewardModel;
