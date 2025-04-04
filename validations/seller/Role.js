const Joi = require("joi");

const createRoleValidation = Joi.object({
  name: Joi.string().required().messages({
    "string.base": "Role name must be a string.",
    "any.required": "Role name is required.",
  }),
});

const updateRoleValidation = Joi.object({
  name: Joi.string().optional().messages({
    "string.base": "Role name must be a string.",
  }),
  permissions: Joi.array().items(Joi.string()).optional().messages({
    "array.base": "Permissions must be an array of strings.",
  }),
});

const deleteRoleValidation = Joi.object({
  id: Joi.string().required().messages({
    "string.base": "Role ID must be a string.",
    "any.required": "Role ID is required.",
  }),
});

const getRoleValidation = Joi.object({
  id: Joi.string().required().messages({
    "string.base": "Role ID must be a string.",
    "any.required": "Role ID is required.",
  }),
});

const updateRolePermissionSchema = Joi.object({
  pageId: Joi.string().hex().length(24).required().messages({
    "string.length": "Page ID must be a valid 24-character MongoDB ObjectId.",
    "any.required": "Page ID is required.",
  }),
  permissionType: Joi.string()
    .valid("view", "add", "edit", "delete")
    .required()
    .messages({
      "any.only": "Permission type must be one of: view, add, edit, delete.",
      "any.required": "Permission type is required.",
    }),
});

module.exports = {
  createRoleValidation,
  updateRoleValidation,
  deleteRoleValidation,
  getRoleValidation,
  updateRolePermissionSchema,
};
