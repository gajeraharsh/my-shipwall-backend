const mongoose = require("mongoose");
const paginate = require("./plugins/paginate");
const incrementId = require("./plugins/incrementId");

const storeVisitSchema = new mongoose.Schema(
  {
    fromDate: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: false,
    },
    comments: {
      type: String,
      required: false,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

storeVisitSchema.plugin(paginate);
storeVisitSchema.plugin(incrementId, "QVAPSV");

const StoreVisit = mongoose.model("StoreVisit", storeVisitSchema);

module.exports = StoreVisit;
