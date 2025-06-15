const mongoose = require("mongoose");
const { Schema } = mongoose;
const paginate = require("./plugins/paginate");

const productSchema = new Schema(
  {
    hsnCode: {
      type: Schema.Types.ObjectId,
      ref: "HsnciodeModel",
      required: false,
    },
    name: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    price: {
      type: Number,
      required: true,
    },
    stock: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    thumbImage: {
      type: String,
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

productSchema.methods.softDelete = async function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  await this.save();
};

productSchema.plugin(paginate);

module.exports = mongoose.model("RewardProduct", productSchema);
