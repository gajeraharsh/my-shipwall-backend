import mongoose, { Schema, Document } from "mongoose";
import { ISupport, SupportModel } from "../types/support";
import paginate from "./plugins/paginate";


const SupportSchema: Schema = new Schema<ISupport, SupportModel>(
    {
        complaintId: { type: String, required: true, unique: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        serviceRelatedReasonType: { type: String, required: true },
        typeOfComplaint: { type: String, required: true },
        complaintStatus: {
            type: String,
            enum: ["Open", "In Progress", "Closed", "Resolved"],
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


export default mongoose.model<ISupport, any>("Support", SupportSchema);
