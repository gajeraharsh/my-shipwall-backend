const express = require("express");
const validate = require("../middlewares/validate");

const {
  createBanner,
  deleteBanner,
  getBannerById,
  getBanners,
  updateBanner,
} = require("../controllers/bannerController");

const {
  createBannerValidation,
  deleteBannerValidation,
  getBannerValidation,
  updateBannerValidation,
} = require("../validations/banner");

const upload = require("../middlewares/upload");
const { verifyJWT } = require("../middlewares/auth.middleware");

const router = express.Router();

router.route("/").post(
  verifyJWT,
  upload.single("bannerImage"),
  (req, res, next) => {
    if (req.file) {
      req.body.bannerImage = req.file.originalname;
    }
    next();
  },
  validate(createBannerValidation),
  createBanner
);

router.route("/").get(verifyJWT, getBanners);

router
  .route("/:id")
  .get(verifyJWT, validate(getBannerValidation), getBannerById);

router.put(
  "/:id",
  verifyJWT,
  upload.single("bannerImage"),
  (req, res, next) => {
    if (req.file) {
      req.body.bannerImage = req.file.originalname;
    }
    next();
  },
  validate(updateBannerValidation),
  updateBanner
);
router.delete(
  "/:id",
  verifyJWT,
  validate(deleteBannerValidation),
  deleteBanner
);

module.exports = router;
