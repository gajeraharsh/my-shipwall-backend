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

colorMasterSchema.methods.softDelete = async function () {
    this.isDeleted = true;
    this.deletedAt = new Date();
    await this.save();
  };
  
colorMasterSchema.plugin(paginate);

module.exports = mongoose.model("ColorMaster", colorMasterSchema);
