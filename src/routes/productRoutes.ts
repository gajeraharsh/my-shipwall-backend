import express from "express"; // Use ES module imports for consistency
import {
    createProducts,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsDropdown
} from "../controllers/productController";
import validate from "../middlewares/validate"; 
import {
  createProductValidation,
  updateProductValidation,
  getProductValidation,
  deleteProductValidation,
} from "../validations/product"; 

const router = express.Router();

router.route("/").post(validate(createProductValidation), createProducts);

router.route("/").get(getProducts);

router.route("/dropDown").get(getProductsDropdown);

router.route("/:id").get(validate(getProductValidation), getProductById);

router.put("/:id", validate(updateProductValidation), updateProduct);
router.delete("/:id", validate(deleteProductValidation), deleteProduct);

export default router;
