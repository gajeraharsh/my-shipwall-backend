const mongoose = require("mongoose");
const paginate = require("./plugins/aggregatePaginate");

const { Schema } = mongoose;

const brandSchema = new Schema(
  {
    brandName: {
      type: String,
      required: true,
    },
    pageTitle: {
      type: String,
    },
    metaDescription: {
      type: String,
    },
    metaKeywords: {
      type: String,
    },
    displayHome: {
      type: Boolean,
      default: false,
    },
    position: {
      type: Number,
      required: true,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

brandSchema.plugin(paginate);

brandSchema.methods.softDelete = async function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  await this.save();
};

const Brand = mongoose.model("Brand", brandSchema);

module.exports = Brand;
