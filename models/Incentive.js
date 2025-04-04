const mongoose = require("mongoose");
const { Schema } = mongoose;
const paginate = require("./plugins/paginate");
const incrementId = require("./plugins/incrementId");

const IncentiveSchema = new Schema(
    {
        minAmount: {
            type: Number,
            required: true,
        },
        maxAmount: {
            type: Number,
            required: true,
        },
        incentivePercentage: {
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

IncentiveSchema.plugin(paginate);
IncentiveSchema.plugin(incrementId);

const IncentiveModel = mongoose.model("Incentive", IncentiveSchema);

module.exports = IncentiveModel;
