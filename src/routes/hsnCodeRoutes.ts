import express from "express"; // Use ES module imports for consistency
import {
    createHsnCode,
    deleteHsnCode,
    getHsnCodeById,
    getHsnCodes,
    getHsnDropdown,
    updateHsnCode
} from "../controllers/hsnCodeController";
import validate from "../middlewares/validate"; // Import the validate middleware
import {
    createHsnCodeValidation,
    deleteHsnValidation,
    getHsnValidation,
    updateHsnValidation
} from "../validations/hsnCode"; // Import the validation schema

const router = express.Router();

router.route("/").post(validate(createHsnCodeValidation), createHsnCode);

router.route("/").get(getHsnCodes);

router.route("/dropDown").get(getHsnDropdown);

router.route("/:id").get(validate(getHsnValidation), getHsnCodeById);

router.put("/:id", validate(updateHsnValidation), updateHsnCode);
router.delete("/:id", validate(deleteHsnValidation), deleteHsnCode);

export default router;
