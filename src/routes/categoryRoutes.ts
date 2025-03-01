import express from "express"; // Use ES module imports for consistency
import {
  createCategory,
  getCategories,
  getCatehgoryById,
  updateCategory,
  deleteCategory,
  getCategoryDropdown
} from "../controllers/categoryController";
import validate from "../middlewares/validate"; // Import the validate middleware
import {
  createCategoryValidation,
  getCategoryValidation,
  updateCategoryValidation,
  deleteCategoryValidation,
} from "../validations/category";
import { verifyJWT } from "../middlewares/auth.middleware";
import upload from "../middlewares/upload";

const router = express.Router();

router.route("/").post(verifyJWT, upload.single("iconImage"), (req, res, next) => {
  if (req.file) {
    req.body.iconImage = req.file.originalname;
  }
  next();
}, validate(createCategoryValidation), createCategory);

router.route("/").get(verifyJWT, getCategories);

router.route("/dropDown").get(verifyJWT, getCategoryDropdown);

router.route("/:id").get(verifyJWT, validate(getCategoryValidation), getCatehgoryById);

router.put("/:id", verifyJWT, upload.single("iconImage"), (req, res, next) => {
  if (req.file) {
    req.body.iconImage = req.file.originalname;
  }
  next();
}, validate(updateCategoryValidation), updateCategory);
router.delete("/:id", verifyJWT, validate(deleteCategoryValidation), deleteCategory);

export default router;
