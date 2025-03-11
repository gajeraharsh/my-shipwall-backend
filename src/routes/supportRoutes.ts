import express from "express";
import {
    createSupport,
    getSupports,
    getSupportById,
    updateSupport,
    deleteSupport,
} from "../controllers/supportController";
import validate from "../middlewares/validate";
import {
    createSupportValidation,
    getSupportValidation,
    updateSupportValidation,
    deleteSupportValidation,
} from "../validations/supportValidation";
import { verifyJWT } from "../middlewares/auth.middleware";
import upload from "../middlewares/upload";

const router = express.Router();

router.route("/").post(verifyJWT, upload.single("issueImage"), (req, res, next) => {
    if (req.file) {
        req.body.issueImage = req.file.originalname;
    }
    next();
}, validate(createSupportValidation), createSupport);
router.route("/").get(verifyJWT, getSupports);
router.route("/:id").get(verifyJWT, validate(getSupportValidation), getSupportById);
router.put("/:id", verifyJWT, validate(updateSupportValidation), updateSupport);
router.delete("/:id", verifyJWT, validate(deleteSupportValidation), deleteSupport);

export default router;
