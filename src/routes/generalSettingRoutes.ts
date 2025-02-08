import express from "express"; // Use ES module imports for consistency
import {
    getGeneralsetting,
    updateGeneralSetting
} from "../controllers/generalSettingcontroller";
import validate from "../middlewares/validate"; // Import the validate middleware
import {
    createValidation
} from "../validations/generalSetting"; // Import the validation schema

const router = express.Router();


router.route("/").get(getGeneralsetting);



router.put("/:id", validate(createValidation), updateGeneralSetting);

export default router;
