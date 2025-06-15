const ApiError = require("../utils/apiError");
const { status: httpStatus } = require("http-status");

const Support = require("../models/Support");
const { uploadFileToS3 } = require("./fileUploads3Service");

const createNewTicket = async (req) => {
  const body = req.body;

  const file = req.file;

  let issueImageUrl = null;

  if (file) {
    issueImageUrl = await uploadFileToS3(file, req.user?._id);
  }

  const ticketData = {
    ...body,
    issueImageUrl,
    user: req?.user?._id,
  };
  return await Support.create(ticketData);
};

/**
 * Query for tickets with pagination and options
 * @param {Object} options - Query options (e.g., pagination, sort, populate)
 * @returns {Promise<QueryResult>}
 */

const fetchTickets = async (req) => {
  try {
    const page = req?.query?.page || 1;
    const limit = req?.query?.limit || 10;
    const query = req?.query?.search ?? "";
    const sortField = req?.query?.sortField || "createdAt";
    const sortOrder = req?.query?.sortOrder === "desc" ? "desc" : "asc";
  
    const {
      status = "",
      typeOfComplaint = "",
      user = "",
      startDate = "",
      endDate = "",
    } = req?.query;

    // Construct the filter query
    const filter = {};

    if (query) {
      filter.$or = [
        { complaintReason: { $regex: query, $options: "i" } },
        { id: { $regex: query, $options: "i" } },
      ];

    }

    if (status) {
      filter.complaintStatus = status;
    }

    if (typeOfComplaint) {
      filter.typeOfComplaint = typeOfComplaint;
    }

    if (user) {
      filter.user = user;
    }

    // Date Range Filtering (Handles only startDate, only endDate, or both)
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const sortOptions = {};
    sortOptions[sortField] = sortOrder;
  
  // Convert sortOptions object to string for aggregation paginate
  const sortByString = Object.entries(sortOptions)
    .map(([key, val]) => `${key}:${val}`)
    .join(",");

    const tickets = await Support.paginate(filter, {
      page,
      limit,
      sortBy: "createdAt:desc",
      populate: [{ path: "user", select: "_id id" }],
      sortBy: sortByString
    });

    return tickets;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error retrieving tickets"
    );
  }
};

const getTicketByIdService = async (ticketId) => {
  try {
    const ticket = await Support.findById(ticketId).populate({
      path: "user",
      select:
        "fullName email phone billingAddress deliveryAddress id _id businessName phone email gstNumber status docStatus",
      populate: [
        {
          path: "billingAddress.city",
          model: "City", // Replace with your actual city model name
          select: "name",
        },
        {
          path: "billingAddress.state",
          model: "State", // Replace with your actual state model name
          select: "name",
        },
        {
          path: "salePerson",
          model: "User", // Replace with your actual state model name
          select: "fullName",
        },
        {
          path: "deliveryAddress.city",
          model: "City", // Replace with your actual city model name
          select: "name",
        },
        {
          path: "deliveryAddress.state",
          model: "State", // Replace with your actual state model name
          select: "name",
        },
      ],
    });

    if (!ticket) {
      throw new ApiError(httpStatus.NOT_FOUND, "Ticket not found");
    }

    return ticket;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error retrieving tickets"
    );
  }
};

const updateTicketById = async (ticketId, updateData) => {
  try {
    const ticket = await Support.findByIdAndUpdate(ticketId, updateData, {
      new: true,
      runValidators: true,
    });
    if (!ticket) throw new ApiError(httpStatus.NOT_FOUND, "Ticket not found");
    return ticket;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error updating tickets"
    );
  }
};

const deleteTicketById = async (ticketId) => {
  try {
    const ticket = await Support.findByIdAndDelete(ticketId);
    if (!ticket) throw new ApiError(httpStatus.NOT_FOUND, "Ticket not found");
    return ticket;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error deleting tickets"
    );
  }
};

module.exports = {
  createNewTicket,
  fetchTickets,
  getTicketByIdService,
  updateTicketById,
  deleteTicketById,
};
