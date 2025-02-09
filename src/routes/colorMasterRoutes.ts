import express from "express"; // Use ES module imports for consistency
import {
    GetColorMasterById,
    createColorMaster,
    deleteColorMaster,
    getColorMasterDropDown,
    getColorMasters,
    updateColorMaster
} from "../controllers/colorMasterController";
import validate from "../middlewares/validate"; // Import the validate middleware
import {
    createValidation,
    deleteValidation,
    getValidation,
    updateValidation
} from "../validations/colorMaster"; // Import the validation schema

const router = express.Router();

router.route("/").post(validate(createValidation), createColorMaster);

router.route("/").get(getColorMasters);

router.route("/dropDown").get(getColorMasterDropDown);

router.route("/:id").get(validate(getValidation), GetColorMasterById);

router.put("/:id", validate(updateValidation), updateColorMaster);
router.delete("/:id", validate(deleteValidation), deleteColorMaster);

export default router;
