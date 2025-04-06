const mongoose = require("mongoose");
const paginate = require("./plugins/paginate");
const incrementId = require("./plugins/incrementId");

const SupportSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    typeOfComplaint: { type: String, required: true },
    serviceRelatedReason: { type: String, required: true },
    complaintStatus: {
      type: String,
      enum: ["Open", "In Progress", "Closed", "Invalid"],
      default: "Open",
    },
    updateComplaintStatus: { type: String, required: false },
    issueImage: { type: String, required: false },
    issueImageUrl: { type: String, required: false },
    complaintReason: { type: String, required: true },
  },
  { timestamps: true }
);

SupportSchema.plugin(paginate);
SupportSchema.plugin(incrementId, "QVAPCUS");

module.exports = mongoose.model("Support", SupportSchema);
