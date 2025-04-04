const {
  getChatById,
  sendAttachmentService,
  sendMessageService,
} = require("../services/chatService");

const ApiResponse = require("../utils/apiResponse");
const { asyncHandler } = require("../utils/asyncHandler");
const Chat = require("../models/Chat");
const ApiError = require("../utils/apiError");
const { uploadFileToS3 } = require("../services/fileUploads3Service");
const ReturnOrder = require("../models/ReturnOrder");
const User = require("../models/User");
const Support = require("../models/Support");
const RejectionOrder = require("../models/RejectionOrder");

/**
 * Get or create chat by relatedToType and relatedToId
 */
const getOrCreateChat = async ({ userId, relatedToType, relatedToId }) => {
  console.log(userId, "userId");

  let chat = await Chat.findOne({
    participants: userId,
    relatedToType,
    relatedTo: relatedToId,
  });

  if (!chat) {
    const participants = new Set();
    participants.add(userId);

    // Always include admin user
    const adminUser = await User.findOne({ role: "admin" });
    if (adminUser) {
      participants.add(adminUser._id.toString());
    }

    if (relatedToType === "ReturnCart") {
      const returnOrder = await ReturnOrder.findById(relatedToId).populate(
        "user"
      );
      if (!returnOrder || !returnOrder.user) {
        throw new ApiError(404, "Return order or associated user not found");
      }

      const returnUserId = returnOrder.user._id.toString();
      participants.add(returnUserId);
    }

    if (relatedToType === "Support") {
      const support = await Support.findById(relatedToId).populate("user");
      if (!support || !support.user) {
        throw new ApiError(404, "Return order or associated user not found");
      }
      const returnUserId = support.user._id.toString();
      participants.add(returnUserId);
    }

    if (relatedToType == "RejectionCart") {
      const support = await RejectionOrder.findById(relatedToId).populate(
        "user"
      );
      if (!support || !support.user) {
        throw new ApiError(404, "Return order or associated user not found");
      }
      const returnUserId = support.user._id.toString();
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
const getChats = asyncHandler(async (req, res) => {
  const { relatedToType, relatedToId } = req.query;
  const { page = 1, limit = 10 } = req.query;

  if (!relatedToType || !relatedToId) {
    throw new ApiError(400, "Invalid input");
  }

  const chat = await getOrCreateChat({
    userId: req.user._id,
    relatedToType: relatedToType,
    relatedToId: relatedToId,
  });

  const result = await getChatById(
    chat._id,
    req.user._id,
    Number(page),
    Number(limit)
  );

  res
    .status(200)
    .json(
      new ApiResponse(200, result, "Chats with messages fetched successfully")
    );
});

/**
 * POST: Send a text message
 */
const sendMessage = asyncHandler(async (req, res) => {
  const { relatedToType, relatedToId, content } = req.body;

  if (!content || !relatedToType || !relatedToId) {
    throw new ApiError(400, "Missing content or identifiers");
  }

  const chat = await getOrCreateChat({
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
const sendAttachment = asyncHandler(async (req, res) => {
  const { relatedToType, relatedToId } = req.body;

  const file = req.file;

  if (!file) {
    throw new ApiError(400, "No file uploaded");
  }

  const chat = await getOrCreateChat({
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

module.exports = {
  getOrCreateChat,
  getChats,
  sendMessage,
  sendAttachment,
};
