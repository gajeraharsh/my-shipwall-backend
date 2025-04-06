// models/ColorMaster.js
const mongoose = require("mongoose");
const paginate = require("./plugins/paginate");

const { Schema } = mongoose;

const colorMasterSchema = new Schema(
    {
        colorName: {
            type: String,
            required: true,
        },
        colorCode: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

colorMasterSchema.plugin(paginate);

module.exports = mongoose.model("ColorMaster", colorMasterSchema);
