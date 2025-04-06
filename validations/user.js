const Joi = require("joi");

const userValidationSchema = Joi.object({
  userName: Joi.string().when("role", {
    is: Joi.valid("sale_admin", "sale_member"),
    then: Joi.required().messages({
      "string.base": "Username must be a string.",
      "any.required":
        "Username is required for sale_admin or sale_member role.",
    }),
    otherwise: Joi.optional(),
  }),
  logginId: Joi.string().when("role", {
    is: Joi.valid("admin"),
    then: Joi.required().messages({
      "string.base": "Login ID must be a string.",
      "any.required":
        "Login ID is required for sale_admin, sale_member, or admin role.",
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
  altContactNumber: Joi.string().when("role", {
    is: Joi.valid("sale_member"),
    then: Joi.required().messages({
      "string.base": "Alternative number must be a string.",
      "any.required": "Alternative is required for sale_member role.",
    }),
    otherwise: Joi.optional(),
  }),
  gender: Joi.string().when("role", {
    is: Joi.valid("sale_member"),
    then: Joi.required().messages({
      "string.base": "gender number must be a string.",
      "any.required": "gender is required for sale_member role.",
    }),
    otherwise: Joi.optional(),
  }),
  lenguage: Joi.string().when("role", {
    is: Joi.valid("sale_member"),
    then: Joi.required().messages({
      "string.base": "lenguage number must be a string.",
      "any.required": "lenguage is required for sale_member role.",
    }),
    otherwise: Joi.optional(),
  }),
  salary: Joi.string().when("role", {
    is: Joi.valid("sale_member"),
    then: Joi.required().messages({
      "string.base": "salary number must be a string.",
      "any.required": "salary is required for sale_member role.",
    }),
    otherwise: Joi.optional(),
  }),

  note: Joi.string().when("role", {
    is: Joi.valid("sale_member"),
    then: Joi.required().messages({
      "string.base": "note number must be a string.",
      "any.required": "note is required for sale_member role.",
    }),
    otherwise: Joi.optional(),
  }),
  sameAsCurrent: Joi.boolean().when("role", {
    is: Joi.valid("sale_member"),
    then: Joi.required().messages({
      "string.base": "Same as current number must be a string.",
      "any.required": "Same as current is required for sale_member role.",
    }),
    otherwise: Joi.optional(),
  }),
  currentAddress: Joi.any().when("role", {
    is: Joi.valid("sale_member"),
    then: Joi.required().messages({
      "string.base": "currentAddress number must be a string.",
      "any.required": "currentAddress is required for sale_member role.",
    }),
    otherwise: Joi.optional(),
  }),
  permenentAddress: Joi.any().when("role", {
    is: Joi.valid("sale_member"),
    then: Joi.optional(),
    otherwise: Joi.optional(),
  }),
  profileImage: Joi.string().optional().messages({
    "string.base": "Profile image must be a string.",
  }),
  businessName: Joi.string().when("role", {
    is: Joi.valid("user"),
    then: Joi.required().messages({
      "string.base": "Business name must be a string.",
      "any.required": "Business name is required for roles other than user.",
    }),
    otherwise: Joi.optional(),
  }),
  gstNumber: Joi.string().when("role", {
    is: Joi.valid("user"),
    then: Joi.required().messages({
      "string.base": "Gst Number must be a string.",
      "any.required": "Gst Number is required for roles other than user.",
    }),
    otherwise: Joi.optional(),
  }),
  role: Joi.string()
    .valid("admin", "user", "sale_admin", "sale_member")
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
  potential: Joi.any(),
  salePerson: Joi.any(),
  billingAddress: Joi.any(),

  typeDocument: Joi.string().when("role", {
    is: Joi.valid("sale_member"),
    then: Joi.required().messages({
      "any.required": "note is required for sale_member role.",
    }),
    otherwise: Joi.optional(),
  }),
  saleUserDocument: Joi.any().optional(),
});

const userValidationLoginSchema = Joi.object({
  phone: Joi.string().optional(),
  userName: Joi.string().optional(),
  logginId: Joi.string().optional(),
  password: Joi.string().required(), // Always required
  role: Joi.string().required(),
}).or("phone", "userName", "logginId"); // Ensures at least one of these is provided

const userChangePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().required(),
  confirmPassword: Joi.string().required(),
});

const saleUserCreateValidation = Joi.object({
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
  altContactNumber: Joi.string().when("role", {
    is: Joi.valid("sale_member"),
    then: Joi.required().messages({
      "string.base": "Alternative number must be a string.",
      "any.required": "Alternative is required for sale_member role.",
    }),
    otherwise: Joi.optional(),
  }),
  gender: Joi.string().when("role", {
    is: Joi.valid("sale_member"),
    then: Joi.required().messages({
      "string.base": "gender number must be a string.",
      "any.required": "gender is required for sale_member role.",
    }),
    otherwise: Joi.optional(),
  }),
  lenguage: Joi.string().when("role", {
    is: Joi.valid("sale_member"),
    then: Joi.required().messages({
      "string.base": "lenguage number must be a string.",
      "any.required": "lenguage is required for sale_member role.",
    }),
    otherwise: Joi.optional(),
  }),
  sameAsCurrent: Joi.boolean().when("role", {
    is: Joi.valid("sale_member"),
    then: Joi.required().messages({
      "string.base": "Same as current number must be a string.",
      "any.required": "Same as current is required for sale_member role.",
    }),
    otherwise: Joi.optional(),
  }),
  currentAddress: Joi.any().when("role", {
    is: Joi.valid("sale_member"),
    then: Joi.required().messages({
      "string.base": "currentAddress number must be a string.",
      "any.required": "currentAddress is required for sale_member role.",
    }),
    otherwise: Joi.optional(),
  }),
  permenentAddress: Joi.any().when("role", {
    is: Joi.valid("sale_member"),
    then: Joi.optional(),
    otherwise: Joi.optional(),
  }),
  profileImage: Joi.string().optional().messages({
    "string.base": "Profile image must be a string.",
  }),

  role: Joi.string()
    .valid("admin", "user", "sale_admin", "sale_member")
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
  typeDocument: Joi.string().when("role", {
    is: Joi.valid("sale_member"),
    then: Joi.required().messages({
      "any.required": "typeDocument is required for sale_member role.",
    }),
    otherwise: Joi.optional(),
  }),
  saleUserDocument: Joi.any().optional(),
  dob: Joi.string().required(),
});

module.exports = {
  userValidationSchema,
  userValidationLoginSchema,
  userChangePasswordSchema,
  saleUserCreateValidation,
};
