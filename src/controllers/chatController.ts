import { Request, Response } from "express";
import {
    getChatById,
    sendAttachmentService,
    sendMessageService,
} from "../services/chatService";
import ApiResponse from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import Chat from "../models/Chat";
import ApiError from "../utils/apiError";
import { uploadFileToS3 } from "../services/fileUploads3Service";
import ReturnOrder from "../models/ReturnOrder";
import User from "../models/User";
import Support from "../models/Support";
import RejectionOrder from "../models/RejectionOrder";

/**
 * Get or create chat by relatedToType and relatedToId
 */
export const getOrCreateChat = async ({
    userId,
    relatedToType,
    relatedToId,
}: {
    userId: string;
    relatedToType: "Support" | "ReturnCart" | "RejectionCart";
    relatedToId: string;
}) => {
    console.log(userId, "userId");

    let chat = await Chat.findOne({
        participants: userId,
        relatedToType,
        relatedTo: relatedToId,
    });

    if (!chat) {
        const participants = new Set<string>();
        participants.add(userId);

        // Always include admin user
        const adminUser = await User.findOne({ role: "admin" });
        if (adminUser) {
            participants.add(adminUser._id.toString());
        }

        if (relatedToType === "ReturnCart") {
            const returnOrder: any = await ReturnOrder.findById(relatedToId).populate("user");
            if (!returnOrder || !returnOrder.user) {
                throw new ApiError(404, "Return order or associated user not found");
            }

            const returnUserId: string = returnOrder.user._id.toString();
            participants.add(returnUserId);
        }


        if (relatedToType === "Support") {
            const support: any = await Support.findById(relatedToId).populate("user");
            if (!support || !support.user) {
                throw new ApiError(404, "Return order or associated user not found");
            }
            const returnUserId: string = support.user._id.toString();
            participants.add(returnUserId);
        }

        if (relatedToType == "RejectionCart") {
            const support: any = await RejectionOrder.findById(relatedToId).populate("user");
            if (!support || !support.user) {
                throw new ApiError(404, "Return order or associated user not found");
            }
            const returnUserId: string = support.user._id.toString();
            participants.add(returnUserId);

        }


        chat = await Chat.create({
            participants: Array.from(participants),
            relatedToType,
            relatedTo: relatedToId,
            messages: [],
        });
    }

    return chat;
};

/**
 * GET: Get chat and paginated messages
 */
export const getChats = asyncHandler(async (req: Request, res: Response) => {
    const { relatedToType, relatedToId } = req.query;
    const { page = 1, limit = 10 } = req.query;

    if (!relatedToType || !relatedToId) {
        throw new ApiError(400, "Invalid input");
    }

    const chat: any = await getOrCreateChat({
        userId: req.user._id,
        relatedToType: relatedToType as "Support" | "ReturnCart" | "RejectionCart",
        relatedToId: relatedToId as string,
    });

    const result = await getChatById(
        chat._id,
        req.user._id,
        Number(page),
        Number(limit)
    );

    res
        .status(200)
        .json(new ApiResponse(200, result, "Chats with messages fetched successfully"));
});

/**
 * POST: Send a text message
 */
export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
    const { relatedToType, relatedToId, content } = req.body;

    if (!content || !relatedToType || !relatedToId) {
        throw new ApiError(400, "Missing content or identifiers");
    }

    const chat: any = await getOrCreateChat({
        userId: req.user._id,
        relatedToType,
        relatedToId,
    });

    const message = await sendMessageService({
        chatId: chat._id,
        senderId: req.user._id,
        content,
    });

    res.status(200).json(new ApiResponse(200, message, "Message sent"));
});

/**
 * POST: Send an attachment
 */
export const sendAttachment = asyncHandler(async (req: Request, res: Response) => {
    const { relatedToType, relatedToId } = req.body;

    const file = req.file as Express.Multer.File | undefined;

    if (!file) {
        throw new ApiError(400, "No file uploaded");
    }

    const chat: any = await getOrCreateChat({
        userId: req.user._id,
        relatedToType,
        relatedToId,
    });

    const fileUrl = await uploadFileToS3(file, req.user._id.toString());

    const message = await sendAttachmentService({
        chatId: chat._id,
        senderId: req.user._id,
        fileUrl: fileUrl,
        fileName: file.originalname,
    });

    res.status(200).json(new ApiResponse(200, message, "Attachment sent"));
});
