import express from "express"; // Use ES module imports for consistency
import {
  createSeries,
  getSeries,
  getSeriesById,
  updateSeries,
  deleteSeries,
  getSeriesDropdown
} from "../controllers/seriesController";
import validate from "../middlewares/validate";
import {
  createSeriesValidation,
  updateSeriesValidation,
  getSeriesValidation,
  deleteSeriesValidation,
} from "../validations/series";
import { verifyJWT } from "../middlewares/auth.middleware";
import upload from "../middlewares/upload";

const router = express.Router();

router.route("/").post(verifyJWT, upload.single("thumbImage"), (req, res, next) => {
  if (req.file) {
    req.body.thumbImage = req.file.originalname;
  }
  next();
}, validate(createSeriesValidation), createSeries);

router.route("/").get(getSeries);

router.route("/dropDown").get(getSeriesDropdown);

router.route("/:id").get(validate(getSeriesValidation), getSeriesById);

router.put("/:id", verifyJWT, upload.single("thumbImage"), (req, res, next) => {
  if (req.file) {
    req.body.thumbImage = req.file.originalname;
  }
  next();
}, validate(updateSeriesValidation), updateSeries);
router.delete("/:id", validate(deleteSeriesValidation), deleteSeries);

export default router;
