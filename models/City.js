// models/City.js
const mongoose = require("mongoose");
const paginate = require("./plugins/paginate");
const incrementId = require("./plugins/incrementId");

const { Schema } = mongoose;

const CitySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: Schema.Types.ObjectId,
      ref: "State",
      required: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
      default: "india",
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

CitySchema.plugin(paginate);
CitySchema.plugin(incrementId);
CitySchema.methods.softDelete = async function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  await this.save();
};

module.exports = mongoose.model("City", CitySchema);
