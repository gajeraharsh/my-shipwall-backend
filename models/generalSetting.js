// models/GeneralSetting.js
const mongoose = require("mongoose");
const paginate = require("./plugins/paginate");

const { Schema } = mongoose;

const generalSettingSchema = new Schema(
    {
        generalshippingcost: {
            type: Number,
        },
        returnDays: {
            type: Number,
        },
    },
    {
        timestamps: true,
    }
);

generalSettingSchema.plugin(paginate);

module.exports = mongoose.model("GeneralSetting", generalSettingSchema);
