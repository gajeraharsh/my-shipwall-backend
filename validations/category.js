const Joi = require("joi");

const createCategoryValidation = Joi.object({
  brand: Joi.string().required().messages({
    "string.base": "Brand ID must be a string.",
    "any.required": "Brand is required.",
  }),
  categoryName: Joi.string().required().messages({
    "string.base": "Category name must be a string.",
    "any.required": "Category name is required.",
  }),
  categoryUrl: Joi.string().required().uri().messages({
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
  iconImage: Joi.string().required().uri().messages({
    "string.base": "Icon image must be a string.",
    "string.uri": "Icon image must be a valid URL.",
    "any.required": "Icon image is required.",
  }),
  displayHome: Joi.boolean().optional().messages({
    "boolean.base": "Display home must be a boolean value.",
  }),
});

const updateCategoryValidation = Joi.object({
  brand: Joi.string().optional().messages({
    "string.base": "Brand ID must be a string.",
  }),
  categoryName: Joi.string().optional().messages({
    "string.base": "Category name must be a string.",
  }),
  categoryUrl: Joi.string().optional().uri().messages({
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
  iconImage: Joi.string().optional().uri().messages({
    "string.base": "Icon image must be a string.",
    "string.uri": "Icon image must be a valid URL.",
  }),
  displayHome: Joi.boolean().optional().messages({
    "boolean.base": "Display home must be a boolean value.",
  }),
});

const deleteCategoryValidation = Joi.object({
  id: Joi.string().required().messages({
    "string.base": "Category ID must be a string.",
    "any.required": "Category ID is required.",
  }),
});

const getCategoryValidation = Joi.object({
  id: Joi.string().required().messages({
    "string.base": "Category ID must be a string.",
    "any.required": "Category ID is required.",
  }),
});

const updateCategoryOrderValidation = Joi.object({
  ids: Joi.array().required(),
});

module.exports = {
  createCategoryValidation,
  updateCategoryValidation,
  deleteCategoryValidation,
  getCategoryValidation,
  updateCategoryOrderValidation,
};
