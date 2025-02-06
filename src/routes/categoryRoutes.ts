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

const router = express.Router();

router.route("/").post(validate(createCategoryValidation), createCategory);

router.route("/").get(getCategories);

router.route("/dropDown").get(getCategoryDropdown);

router.route("/:id").get(validate(getCategoryValidation), getCatehgoryById);

router.put("/:id", validate(updateCategoryValidation), updateCategory);
router.delete("/:id", validate(deleteCategoryValidation), deleteCategory);

export default router;
