const Joi = require("joi");

const createValidation = Joi.object({
  generalshippingcost: Joi.string().optional().messages({
    "string.base": "Color name must be a string.",
    "any.required": "Color name is required.",
  }),
  returnDays: Joi.string().optional(),
});

module.exports = { createValidation };
