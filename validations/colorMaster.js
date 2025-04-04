const Joi = require("joi");

const createValidation = Joi.object({
  colorName: Joi.string().required().messages({
    "string.base": "Color name must be a string.",
    "any.required": "Color name is required.",
  }),
  colorCode: Joi.string().required().messages({
    "string.base": "Color code percentage must be a string.",
    "any.required": "Color code percentage is required.",
  }),
});

const updateValidation = Joi.object({
  colorName: Joi.string().required().messages({
    "string.base": "Color name must be a string.",
    "any.required": "Color name is required.",
  }),
  colorCode: Joi.string().required().messages({
    "string.base": "Color code percentage must be a string.",
    "any.required": "Color code percentage is required.",
  }),
});

const deleteValidation = Joi.object({
  id: Joi.string().required().messages({
    "string.base": "Color ID must be a string.",
    "any.required": "Color ID is required.",
  }),
});

const getValidation = Joi.object({
  id: Joi.string().required().messages({
    "string.base": "Color ID must be a string.",
    "any.required": "Color ID is required.",
  }),
});

module.exports = {
  createValidation,
  updateValidation,
  deleteValidation,
  getValidation,
};
