const Joi = require("joi");

const createHsnCodeValidation = Joi.object({
  code: Joi.string().required().messages({
    "string.base": "Hsn code must be a string.",
    "any.required": "Hsn code is required.",
  }),
  percentage: Joi.string().required().messages({
    "string.base": "Hsn percentage must be a string.",
    "any.required": "Hsn percentage is required.",
  }),
});

const updateHsnValidation = Joi.object({
  code: Joi.string().required().messages({
    "string.base": "Hsn code must be a string.",
    "any.required": "Hsn code is required.",
  }),
  percentage: Joi.string().required().messages({
    "string.base": "Hsn percentage must be a string.",
    "any.required": "Hsn percentage is required.",
  }),
});

const deleteHsnValidation = Joi.object({
  id: Joi.string().required().messages({
    "string.base": "Hsn ID must be a string.",
    "any.required": "Hsn ID is required.",
  }),
});

const getHsnValidation = Joi.object({
  id: Joi.string().required().messages({
    "string.base": "Hsn ID must be a string.",
    "any.required": "Hsn ID is required.",
  }),
});

module.exports = {
  createHsnCodeValidation,
  updateHsnValidation,
  deleteHsnValidation,
  getHsnValidation,
};
