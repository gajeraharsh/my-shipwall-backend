const mongoose = require("mongoose");
const { Schema } = mongoose;
const paginate = require("./plugins/paginate");
const incrementId = require("./plugins/incrementId");

const IncentivePayoutSchema = new Schema(
    {
        salePerson: {
            type: mongoose.Types.ObjectId,
            ref: "User",
        },
        user: {
            type: mongoose.Types.ObjectId,
            ref: "User",
        },
        order: {
            type: mongoose.Types.ObjectId,
            ref: "Order",
        },
        totalOrderAmount: {
            type: Number,
            required: true,
        },
        percentageIncentive: {
            type: Number,
            required: true,
        },
        totalIncentiveAmount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            required: true,
            enum: ["Pending", "Settled"],
            default: "Pending",
        },
    },
    {
        timestamps: true,
    }
);

IncentivePayoutSchema.plugin(paginate);
IncentivePayoutSchema.plugin(incrementId);

const IncentivePayoutModel = mongoose.model("IncentivePayout", IncentivePayoutSchema);

module.exports = IncentivePayoutModel;
