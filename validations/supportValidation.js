const Joi = require("joi");

// Support Validation Schema
const createSupportValidation = Joi.object({
  typeOfComplaint: Joi.string()
    .valid("Service Related", "Technical Issue", "Billing Issue")
    .required()
    .messages({
      "any.required": "Type of complaint is required",
      "any.only":
        "Invalid complaint type. Must be 'Service Related', 'Technical Issue', or 'Billing Issue'.",
    }),
  complaintReason: Joi.string().required().messages({
    "any.required": "Complaint reason is required",
    "string.empty": "Complaint reason cannot be empty",
  }),
});

// Validation for retrieving a single support record
const getSupportValidation = Joi.object({
  id: Joi.string().required().messages({
    "any.required": "Support ID is required",
    "string.empty": "Support ID cannot be empty",
  }),
});

// Validation for updating a support record
const updateSupportValidation = Joi.object({
  typeOfComplaint: Joi.string()
    .valid("Service Related", "Technical Issue", "Billing Issue")
    .optional()
    .messages({
      "any.only":
        "Invalid complaint type. Must be 'Service Related', 'Technical Issue', or 'Billing Issue'.",
    }),
  complaintStatus: Joi.string()
    .valid("Open", "In Progress", "Closed", "Resolved")
    .optional()
    .messages({
      "any.only":
        "Invalid complaint status. Must be 'Open', 'In Progress', 'Closed', or 'Resolved'.",
    }),
  updateComplaintStatus: Joi.string().optional(),
  complaintReason: Joi.string().optional(),
});

// Validation for deleting a support record
const deleteSupportValidation = Joi.object({
  id: Joi.string().required().messages({
    "any.required": "Support ID is required",
    "string.empty": "Support ID cannot be empty",
  }),
});

module.exports = {
  createSupportValidation,
  getSupportValidation,
  updateSupportValidation,
  deleteSupportValidation,
};
