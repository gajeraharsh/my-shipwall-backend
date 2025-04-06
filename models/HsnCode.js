const mongoose = require("mongoose");
const { Schema } = mongoose;
const paginate = require("./plugins/paginate");

const HsncodeSchema = new Schema(
    {
        code: {
            type: String,
            required: true,
        },
        percentage: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

HsncodeSchema.plugin(paginate);

const HsnModel = mongoose.model("HsnciodeModel", HsncodeSchema);

module.exports = HsnModel;
