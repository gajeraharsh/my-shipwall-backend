import { Types, Document, Model } from "mongoose";

export interface ISupport extends Document {
  _id: Types.ObjectId;
  complaintId: string; // Unique complaint ID
  user: Types.ObjectId; // Reference to User
  serviceRelatedReasonType: string; // e.g., "Technical issue complaint"
  typeOfComplaint: string; // e.g., "Service Related"
  complaintStatus: "Open" | "In Progress" | "Closed" | "Resolved"; // Status of the complaint
  updateComplaintStatus?: string; // Optional updates on complaint status
  complaintReason: string; // Detailed reason for the complaint
  issueImage: string;
  issueImageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISupportBody {
  complaintId: string;
  user: Types.ObjectId;
  serviceRelatedReasonType: string;
  typeOfComplaint: string;
  complaintStatus?: "Open" | "In Progress" | "Closed" | "Resolved";
  updateComplaintStatus?: string;
  complaintReason: string;
}

export interface ISupportMethods {
  paginate: any;
}

export type SupportModel = Model<ISupport, {}, ISupportMethods>;
export type SupportDocument = Document & ISupport & ISupportMethods;
