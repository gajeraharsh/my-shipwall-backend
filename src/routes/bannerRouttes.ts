import express from "express";
import validate from "../middlewares/validate";

import { createBanner, deleteBanner, getBannerById, getBanners, updateBanner } from "../controllers/bannerController";
import { createBannerValidation, deleteBannerValidation, getBannerValidation, updateBannerValidation } from "../validations/banner";
import upload from "../middlewares/upload";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = express.Router();

router.route("/").post(verifyJWT, upload.single("bannerImage"), (req, res, next) => {
    if (req.file) {
        req.body.bannerImage = req.file.originalname;
    }
    next();
}, validate(createBannerValidation), createBanner);

router.route("/").get(verifyJWT, getBanners);


router.route("/:id").get(verifyJWT, validate(getBannerValidation), getBannerById);

router.put("/:id", verifyJWT, upload.single("bannerImage"), (req, res, next) => {
    if (req.file) {
        req.body.bannerImage = req.file.originalname;
    }
    next();
}, validate(updateBannerValidation), updateBanner);
router.delete("/:id", verifyJWT, validate(deleteBannerValidation), deleteBanner);

export default router;
