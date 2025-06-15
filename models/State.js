const mongoose = require("mongoose");
const paginate = require("./plugins/paginate");
const incrementId = require("./plugins/incrementId");

const StateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
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

StateSchema.plugin(incrementId);
StateSchema.plugin(paginate);
StateSchema.methods.softDelete = async function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  await this.save();
};

const StateModel = mongoose.model("State", StateSchema);

module.exports = StateModel;
