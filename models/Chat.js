// models/Chat.js
const mongoose = require("mongoose");
const paginate = require("./plugins/paginate");
const incrementId = require("./plugins/incrementId");

const { Schema } = mongoose;

const ChatSchema = new Schema(
    {
        participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
        relatedToType: {
            type: String,
            enum: ["Support", "ReturnCart", "RejectionCart"],
            required: true,
        },
        relatedTo: {
            type: Schema.Types.ObjectId,
            required: true,
            refPath: "relatedToType",
        },
    },
    { timestamps: true }
);

ChatSchema.plugin(paginate);
ChatSchema.plugin(incrementId, "CHAT");

module.exports = mongoose.model("Chat", ChatSchema);
