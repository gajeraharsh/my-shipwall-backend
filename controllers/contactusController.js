const {
  createContactMessage,
  updateContactMessage,
  deleteContactMessage,
  fetchContactMessages,
} = require("../services/contactusService");

const { asyncHandler } = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");

const getContactsController = asyncHandler(async (req, res) => {
  try {
    const contacts = await fetchContactMessages(req);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { contacts },
          "Contact messages retrieved successfully"
        )
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Error retrieving contact messages");
  }
});

const createContact = asyncHandler(async (req, res) => {
  try {
    const contact = await createContactMessage(req.body);
    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { contact },
          "Contact message created successfully"
        )
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Failed to create contact message");
  }
});

const updateContact = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatedContact = await updateContactMessage(id, req.body);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { updatedContact },
          "Contact message updated successfully"
        )
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Failed to update contact message");
  }
});

const deleteContact = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    await deleteContactMessage(id);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Contact message deleted successfully"));
  } catch (err) {
    throw new ApiError(500, err.message || "Failed to delete contact message");
  }
});

module.exports = {
  getContactsController,
  createContact,
  updateContact,
  deleteContact,
};
