const express = require("express"); // Use CommonJS require for consistency
const {
  createSeries,
  getSeries,
  getSeriesById,
  updateSeries,
  deleteSeries,
  getSeriesDropdown,
  getAllSeries,
  updateSeriesOrderController,
  updateSeriesGallery,
  reorderGalleryImages,
} = require("../controllers/seriesController");

const validate = require("../middlewares/validate");
const {
  createSeriesValidation,
  updateSeriesValidation,
  getSeriesValidation,
  deleteSeriesValidation,
  updateSeriesOrderValidation,
} = require("../validations/series");

const { verifyJWT } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload");

const router = express.Router();

router.route("/").post(
  verifyJWT,
  upload.single("thumbImage"),
  (req, res, next) => {
    if (req.file) {
      req.body.thumbImage = req.file.originalname;
    }
    next();
  },
  validate(createSeriesValidation),
  createSeries
);

router.route("/").get(getSeries);

router.route("/dropDown").get(getSeriesDropdown);
router.route("/all").get(getAllSeries);

router.route("/:id").get(validate(getSeriesValidation), getSeriesById);

router.put(
  "/:id",
  verifyJWT,
  upload.single("thumbImage"),
  (req, res, next) => {
    if (req.file) {
      req.body.thumbImage = req.file.originalname;
    }
    next();
  },
  validate(updateSeriesValidation),
  updateSeries
);

router.post("/update-order", validate(updateSeriesOrderValidation), updateSeriesOrderController);

// Route to upload new images to the gallery
router.post("/update-gallery/:id", upload.array("images", 10), updateSeriesGallery);

// Route to reorder images
router.put("/reorder-gallery/:id", reorderGalleryImages);

router.delete("/:id", validate(deleteSeriesValidation), deleteSeries);

module.exports = router;
