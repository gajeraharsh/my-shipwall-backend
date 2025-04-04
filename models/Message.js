const mongoose = require("mongoose");
const { Schema } = mongoose;
const paginate = require("./plugins/paginate");
const incrementId = require("./plugins/incrementId");

const MessageSchema = new Schema(
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

module.exports = mongoose.model("Message", MessageSchema);
