const mongoose = require("mongoose");
const paginate = require("./plugins/aggregatePaginate");

const seriesSchema = new mongoose.Schema(
  {
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    seriesName: {
      type: String,
      required: true,
    },
    seriesUrl: {
      type: String,
      required: true,
    },
    metaDescription: {
      type: String,
    },
    pageTitle: {
      type: String,
    },
    metaKeywords: {
      type: String,
    },
    thumbImage: {
      type: String,
      required: true,
    },
    thumbImageUrl: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Draft", "Published"],
      default: "Draft",
    },
    position: {
      type: Number,
      required: true,
      default: 0,
    },
    isDisplayHome: {
      type: Boolean,
      default: false,
    },
    gallery: [
      {
        url: { type: String, required: true },
        position: { type: Number, required: true },
      },
    ],
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

seriesSchema.plugin(paginate);
seriesSchema.methods.softDelete = async function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  await this.save();
};

const Series = mongoose.model("Series", seriesSchema);

module.exports = Series;
