const Joi = require("joi");

const supportTeamValidation = Joi.object({
  userName: Joi.string().when("role", {
    is: Joi.valid("sale_admin", "sale_member"),
    then: Joi.required().messages({
      "string.base": "Username must be a string.",
      "any.required":
        "Username is required for sale_admin or sale_member role.",
    }),
    otherwise: Joi.optional(),
  }),
  fullName: Joi.string().when("role", {
    is: Joi.valid("user"),
    then: Joi.required().messages({
      "string.base": "Full name must be a string.",
      "any.required": "Full name is required for user role.",
    }),
    otherwise: Joi.optional(),
  }),
  email: Joi.string().email().required().messages({
    "string.base": "Email must be a string.",
    "string.email": "Please provide a valid email address.",
    "any.required": "Email is required.",
  }),
  phone: Joi.string().required().messages({
    "string.base": "Phone number must be a string.",
    "any.required": "Phone number is required.",
  }),
  profileImage: Joi.string().optional().messages({
    "string.base": "Profile image must be a string.",
  }),
  role: Joi.string()
    .valid("admin_support", "admin_rejection")
    .required()
    .messages({
      "string.base": "Role must be a string.",
      "any.required": "Role is required.",
      "any.only":
        'Role must be one of "admin", "user", "sale_admin", or "sale_member".',
    }),
  password: Joi.string().required().messages({
    "string.base": "Password must be a string.",
    "any.required": "Password is required.",
  }),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "string.base": "Confirm Password must be a string.",
    "any.required": "Confirm Password is required.",
    "any.only": "Confirm Password must match the Password.",
  }),
});

module.exports = {
    supportTeamValidation,
};
