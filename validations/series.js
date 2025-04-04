const Joi = require("joi");

const createSeriesValidation = Joi.object({
  brand: Joi.string().required().messages({
    "string.base": "Brand ID must be a string.",
    "any.required": "Brand is required.",
  }),
  category: Joi.string().required().messages({
    "string.base": "Category ID must be a string.",
    "any.required": "Category is required.",
  }),
  seriesName: Joi.string().required().messages({
    "string.base": "Series name must be a string.",
    "any.required": "Series name is required.",
  }),
  seriesUrl: Joi.string().required().uri().messages({
    "string.base": "Category URL must be a string.",
    "string.uri": "Category URL must be a valid URL.",
    "any.required": "Category URL is required.",
  }),
  pageTitle: Joi.string().optional().messages({
    "string.base": "Page title must be a string.",
  }),
  metaDescription: Joi.string().optional().messages({
    "string.base": "Meta description must be a string.",
  }),
  metaKeywords: Joi.string().optional().messages({
    "string.base": "Meta keywords must be a string.",
  }),
  thumbImage: Joi.string().required().uri().messages({
    "string.base": "Thumb image must be a string.",
    "string.uri": "Thumb image must be a valid URL.",
    "any.required": "Thumb image is required.",
  }),
});

const updateSeriesValidation = Joi.object({
  brand: Joi.string().optional().messages({
    "string.base": "Brand ID must be a string.",
  }),
  category: Joi.string().optional().messages({
    "string.base": "Category ID must be a string.",
  }),
  seriesName: Joi.string().optional().messages({
    "string.base": "Category name must be a string.",
  }),
  seriesUrl: Joi.string().optional().uri().messages({
    "string.base": "Category URL must be a string.",
    "string.uri": "Category URL must be a valid URL.",
  }),
  pageTitle: Joi.string().optional().messages({
    "string.base": "Page title must be a string.",
  }),
  metaDescription: Joi.string().optional().messages({
    "string.base": "Meta description must be a string.",
  }),
  metaKeywords: Joi.string().optional().messages({
    "string.base": "Meta keywords must be a string.",
  }),
  thumbImage: Joi.string().optional().uri().messages({
    "string.base": "Thumb image must be a string.",
    "string.uri": "Thumb image must be a valid URL.",
  }),
});

const deleteSeriesValidation = Joi.object({
  id: Joi.string().required().messages({
    "string.base": "Category ID must be a string.",
    "any.required": "Category ID is required.",
  }),
});

const getSeriesValidation = Joi.object({
  id: Joi.string().required().messages({
    "string.base": "Category ID must be a string.",
    "any.required": "Category ID is required.",
  }),
});

const updateSeriesOrderValidation = Joi.object({
  ids: Joi.array().required(),
});

module.exports = {
  createSeriesValidation,
  updateSeriesValidation,
  deleteSeriesValidation,
  getSeriesValidation,
  updateSeriesOrderValidation,
};
