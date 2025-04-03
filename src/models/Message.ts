import mongoose, { Schema, Document } from "mongoose";
import paginate from "./plugins/paginate";
import incrementId from "./plugins/incrementId";

export interface IMessage extends Document {
    chat: mongoose.Schema.Types.ObjectId;
    sender: mongoose.Schema.Types.ObjectId;
    text?: string;
    attachment?: {
        url: string;
        name?: string;
    };
    sentAt: Date;
}

const MessageSchema = new Schema<IMessage>(
    {
        chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        text: { type: String },
        attachment: {
            url: { type: String },
            name: { type: String },
        },
        sentAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);


MessageSchema.plugin(paginate);
MessageSchema.plugin(incrementId, "CHAT");


export default mongoose.model<any, any>("Message", MessageSchema);
