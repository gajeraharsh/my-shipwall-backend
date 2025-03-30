// models/Chat.ts
import mongoose, { Schema, Document } from "mongoose";
import paginate from "./plugins/paginate";
import incrementId from "./plugins/incrementId";

export interface IChat extends Document {
    participants: mongoose.Schema.Types.ObjectId[]; // [user, admin]
    relatedToType: "Support" | "ReturnCart";
    relatedTo: mongoose.Schema.Types.ObjectId;
}

const ChatSchema = new Schema<IChat>(
    {
        participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        relatedToType: {
            type: String,
            enum: ["Support", "ReturnCart", "RejectionCart"],
            required: true,
        },
        relatedTo: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: "relatedToType",
        },
    },
    { timestamps: true }
);

ChatSchema.plugin(paginate);
ChatSchema.plugin(incrementId, "CHAT");

export default mongoose.model<IChat>("Chat", ChatSchema);
