import mongoose, { Schema, Document } from "mongoose";
import { ISupport, SupportModel } from "../types/support";
import paginate from "./plugins/paginate";
import incrementId from "./plugins/incrementId";

const SupportSchema: Schema = new Schema<any, any>(
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

export default mongoose.model<any, any>("Support", SupportSchema);
