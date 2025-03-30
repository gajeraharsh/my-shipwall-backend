import express from "express"; // Use ES module imports for consistency
import {
  createCategory,
  getCategories,
  getCatehgoryById,
  updateCategory,
  deleteCategory,
  getCategoryDropdown,
  getAllCategories,
  updateCategoryOrderController
} from "../controllers/categoryController";
import validate from "../middlewares/validate"; // Import the validate middleware
import {
  createCategoryValidation,
  getCategoryValidation,
  updateCategoryValidation,
  deleteCategoryValidation,
  updateCategoryOrderValidation,
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

router.route("/all").get(getAllCategories);


router.route("/dropDown").get(verifyJWT, getCategoryDropdown);

router.route("/:id").get(verifyJWT, validate(getCategoryValidation), getCatehgoryById);

router.put("/:id", verifyJWT, upload.single("iconImage"), (req, res, next) => {
  if (req.file) {
    req.body.iconImage = req.file.originalname;
  }
  next();
}, validate(updateCategoryValidation), updateCategory);
router.post("/update-order", validate(updateCategoryOrderValidation), updateCategoryOrderController);

router.delete("/:id", verifyJWT, validate(deleteCategoryValidation), deleteCategory);

export default router;
