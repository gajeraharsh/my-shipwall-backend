import Chat from "../models/Chat";
import httpStatus from "http-status";
import ApiError from "../utils/apiError";
import Message from "../models/Message";
import mongoose from "mongoose";

export const getChatById = async (
    chatId: string,
    userId: mongoose.Types.ObjectId,
    page: number = 1,
    limit: number = 10
) => {
    try {
        const chat = await Chat.findOne({
            _id: chatId,
            participants: userId,
        })
            .populate("participants", "fullName email profileImage role")
            .populate("relatedTo");

        if (!chat) {
            throw new ApiError(httpStatus.NOT_FOUND, "Chat not found");
        }

        const otherParticipant = chat.participants.find(
            (p: any) => String(p._id) !== String(userId)
        );

        // Count total messages
        const totalMessages = await Message.countDocuments({ chat });

        // Fetch paginated messages (latest first)
        const messages = await Message.find({ chat })
            .sort({ createdAt: -1 }) // latest first
            .skip((page - 1) * limit)
            .limit(limit)
            .populate("sender", "fullName email ");

        // Format messages for frontend
        const formattedMessages = messages.map((msg: any) => ({
            _id: msg._id,
            sender: {
                _id: msg.sender._id,
                fullName: msg.sender.fullName,
                email: msg.sender.email,
            },
            text: msg.text,
            attachment: msg.attachment,
            createdAt: msg.createdAt,
            isSender: String(msg.sender._id) === String(userId),
        }));



        return {
            chat: {
                _id: chat._id,
                participants: chat.participants,
                relatedToType: chat.relatedToType,
                relatedTo: chat.relatedTo,
                otherParticipant
            },
            messages: formattedMessages,
            pagination: {
                totalMessages,
                page,
                limit,
                totalPages: Math.ceil(totalMessages / limit),
            },
        };
    } catch (error) {
        console.error("Get Chat Error:", error);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to fetch chat");
    }
};


export const sendMessageService = async ({
    chatId,
    senderId,
    content,
}: {
    chatId: string;
    senderId: string;
    content: string;
}) => {
    const message = await Message.create({
        chat: chatId,
        sender: senderId,
        text: content,
    });

    await Chat.findByIdAndUpdate(chatId, { updatedAt: new Date() });

    return message;
};

export const sendAttachmentService = async ({
    chatId,
    senderId,
    fileUrl,
    fileName,
}: {
    chatId: string;
    senderId: string;
    fileUrl: string;
    fileName?: string;
}) => {
    const message = await Message.create({
        chat: chatId,
        sender: senderId,
        attachment: {
            url: fileUrl,
            name: fileName || "attachment",
        },
    });

    await Chat.findByIdAndUpdate(chatId, { updatedAt: new Date() });

    return message;
};
