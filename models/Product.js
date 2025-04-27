const mongoose = require("mongoose");
const { Schema } = mongoose;
const paginate = require("./plugins/paginate");

const productSchema = new Schema(
  {
    brand: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    series: {
      type: Schema.Types.ObjectId,
      ref: "Series",
      required: true,
    },
    hsnCode: {
      type: Schema.Types.ObjectId,
      ref: "HsnciodeModel",
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    productUrl: {
      type: String,
      required: true,
    },
    modelNo: {
      type: String,
      required: true,
    },
    watt: {
      type: String,
      required: true,
    },
    color: {
      type: Schema.Types.ObjectId,
      ref: "ColorMaster",
      required: true,
    },
    bodyColor: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    stock: {
      type: String,
      required: true,
    },
    featureProduct: {
      type: Boolean,
    },
    newArrivals: {
      type: Boolean,
    },
    productThumbImage: {
      type: String,
      required: true,
    },
    productThumbImageUrl: {
      type: String,
      required: true,
    },
    structure: {
      type: String,
    },
    boxQuantity: {
      type: String,
    },
    dataSheet: {
      type: String,
      required: true,
    },
    dataSheetUrl: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Draft", "Published"],
      default: "Draft",
    },
    metaDescription: {
      type: String,
    },
    pageTitle: {
      type: String,
    },
    metaKeys: {
      type: String,
    },
    shortDescription: {
      type: String,
    },
    description: {
      type: String,
    },
    technicalInfo: {
      type: String,
    },
    dimension: {
      type: String,
    },
    packaging: {
      type: String,
    },
    additionalInfo: {
      type: String,
    },
    gallery: [
      {
        url: { type: String, required: true },
        position: { type: Number, required: true },
      },
    ],
    position: {
      type: Number,
      required: true,
      default: 0,
    },
    rewardPoints: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.plugin(paginate);

module.exports = mongoose.model("Product", productSchema);
