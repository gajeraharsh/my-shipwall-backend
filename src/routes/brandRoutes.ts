import express from "express"; // Use ES module imports for consistency
import {
  createBrand,
  getBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
  getBrandDropdown,
  getAllBrands,
  updateBrandOrderController
} from "../controllers/brandController";
import validate from "../middlewares/validate"; // Import the validate middleware
import {
  createBrandValidation,
  getBrandValidation,
  updateBrandValidation,
  deleteBrandValidation,
  updateBrandOrderValidation,
} from "../validations/brand"; // Import the validation schema

const router = express.Router();

router.route("/").post(validate(createBrandValidation), createBrand);

router.route("/").get(getBrands);

router.route("/all").get(getAllBrands);

router.route("/dropDown").get(getBrandDropdown);

router.route("/:id").get(validate(getBrandValidation), getBrandById);

router.put("/:id", validate(updateBrandValidation), updateBrand);
router.post("/update-order", validate(updateBrandOrderValidation), updateBrandOrderController);

router.delete("/:id", validate(deleteBrandValidation), deleteBrand);

export default router;
