// models/ContactUs.js
const mongoose = require("mongoose");
const paginate = require("./plugins/paginate");

const { Schema } = mongoose;

const contactUsSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        subject: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

contactUsSchema.plugin(paginate);

module.exports = mongoose.model("ContactUs", contactUsSchema);
