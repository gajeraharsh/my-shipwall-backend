const express = require("express");
const {
  createRoleController,
  getRolesController,
  getRoleByIdController,
  updateRoleController,
  deleteRoleController,
  updateRolePermissionController,
  getRolesDropdown,
} = require("../../controllers/seller/RoleController");

const validate = require("../../middlewares/validate");

const {
  createRoleValidation,
  updateRoleValidation,
  getRoleValidation,
  deleteRoleValidation,
  updateRolePermissionSchema,
} = require("../../validations/seller/Role");

const router = express.Router();

router
  .route("/role")
  .post(validate(createRoleValidation), createRoleController);
router.route("/role").get(getRolesController);
router.route("/dropdown").get(getRolesDropdown);

router
  .route("/role/:id")
  .get(validate(getRoleValidation), getRoleByIdController);
router.put("/role/:id", validate(updateRoleValidation), updateRoleController);
router.put(
  "/role/:id/permissions",
  validate(updateRolePermissionSchema),
  updateRolePermissionController
);
router.delete(
  "/role/:id",
  validate(deleteRoleValidation),
  deleteRoleController
);

module.exports = router;
