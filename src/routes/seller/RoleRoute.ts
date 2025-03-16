import express from "express";
import {
    createRoleController,
    getRolesController,
    getRoleByIdController,
    updateRoleController,
    deleteRoleController,
    updateRolePermissionController
} from "../../controllers/seller/RoleController";

import validate from "../../middlewares/validate";
import {
    createRoleValidation,
    updateRoleValidation,
    getRoleValidation,
    deleteRoleValidation,
    updateRolePermissionSchema
} from "../../validations/seller/Role";

const router = express.Router();

router.route("/role").post(validate(createRoleValidation), createRoleController);
router.route("/role").get(getRolesController);
router.route("/role/:id").get(validate(getRoleValidation), getRoleByIdController);
router.put("/role/:id", validate(updateRoleValidation), updateRoleController);
router.put("/role/:id/permissions", validate(updateRolePermissionSchema), updateRolePermissionController);
router.delete("/role/:id", validate(deleteRoleValidation), deleteRoleController);

export default router;
