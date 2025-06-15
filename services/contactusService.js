const Chat = require("../models/Chat");
const { status: httpStatus } = require("http-status");

const ApiError = require("../utils/apiError");
const Message = require("../models/Message");
const mongoose = require("mongoose");
const Brand = require("../models/Brand");
const ContactUs = require("../models/ContactUs");

const fetchContactMessages = async (req) => {
  try {
    const page = Number(req?.query?.page) || 1;
    const limit = Number(req?.query?.limit) || 10;
    const query = req?.query?.search
      ? { name: { $regex: req.query.search, $options: "i" } }
      : {};

    const sortField = req?.query?.sortField || "createdAt";
    const sortOrder = req?.query?.sortOrder === "desc" ? "desc" : "asc";

    const sortBy = `${sortField}:${sortOrder}`;

    const options = {
      page,
      limit,
      sortBy: sortBy,
    };

    const contacts = await ContactUs.paginate(query, options);
    return contacts;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error retrieving contact messages"
    );
  }
};

const createContactMessage = async (contactBody) => {
  return await ContactUs.create(contactBody);
};

const updateContactMessage = async (contactId, updateData) => {
  try {
    const contact = await ContactUs.findByIdAndUpdate(contactId, updateData, {
      new: true,
      runValidators: true,
    });
    if (!contact)
      throw new ApiError(httpStatus.NOT_FOUND, "Contact message not found");
    return contact;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error updating contact message"
    );
  }
};

const deleteContactMessage = async (contactId) => {
  try {
    const contact = await ContactUs.findByIdAndDelete(contactId);
    if (!contact)
      throw new ApiError(httpStatus.NOT_FOUND, "Contact message not found");
    return contact;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error deleting contact message"
    );
  }
};

module.exports = {
  fetchContactMessages,
  createContactMessage,
  updateContactMessage,
  deleteContactMessage,
};
