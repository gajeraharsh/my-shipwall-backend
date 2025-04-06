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
  },
  {
    timestamps: true,
  }
);

StateSchema.plugin(incrementId);
StateSchema.plugin(paginate);

const StateModel = mongoose.model("State", StateSchema);

module.exports = StateModel;
