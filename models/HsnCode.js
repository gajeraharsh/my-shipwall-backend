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

HsncodeSchema.plugin(paginate);
HsncodeSchema.methods.softDelete = async function () {
    this.isDeleted = true;
    this.deletedAt = new Date();
    await this.save();
  };
  
const HsnModel = mongoose.model("HsnciodeModel", HsncodeSchema);

module.exports = HsnModel;
