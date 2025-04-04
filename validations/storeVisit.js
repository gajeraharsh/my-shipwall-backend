const Joi = require("joi");

// Validation for creating a Store Visit
 const createStoreVisitValidation = Joi.object({
  fromDate: Joi.string().required().messages({
    "any.required": "From date is required",
    "date.base": "From date must be a valid date",
  }),
  fromTime: Joi.string().optional(), // Hidden for now
  comments: Joi.string().required().messages({
    "any.required": "Comments are required",
    "string.empty": "Comments cannot be empty",
  }),
  images: Joi.array().items(Joi.string()).min(1).required().messages({
    "any.required": "At least one image is required",
    "array.base": "Images must be an array of strings",
    "array.min": "At least one image must be uploaded",
  }),
  user: Joi.string().required().messages({
    "any.required": "User ID is required",
    "string.empty": "User ID cannot be empty",
  }),
});

// Validation for retrieving a single Store Visit
 const getStoreVisitValidation = Joi.object({
  id: Joi.string().required().messages({
    "any.required": "Store Visit ID is required",
    "string.empty": "Store Visit ID cannot be empty",
  }),
});

// Validation for updating a Store Visit
 const updateStoreVisitValidation = Joi.object({
  fromDate: Joi.date().optional().messages({
    "date.base": "From date must be a valid date",
  }),
  fromTime: Joi.string().optional(),
  comments: Joi.string().optional(),
  images: Joi.array().items(Joi.string()).optional().messages({
    "array.base": "Images must be an array of strings",
  }),
  user: Joi.string().optional().messages({
    "any.required": "User ID is required",
    "string.empty": "User ID cannot be empty",
  }),
});

// Validation for deleting a Store Visit
 const deleteStoreVisitValidation = Joi.object({
  id: Joi.string().required().messages({
    "any.required": "Store Visit ID is required",
    "string.empty": "Store Visit ID cannot be empty",
  }),
});



module.exports = {
  createStoreVisitValidation,
  getStoreVisitValidation,
  updateStoreVisitValidation,
  deleteStoreVisitValidation
}