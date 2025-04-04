const express = require("express");

const {
  createBrand,
  getBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
  getBrandDropdown,
  getAllBrands,
  updateBrandOrderController,
} = require("../controllers/brandController");

const validate = require("../middlewares/validate");

const {
  createBrandValidation,
  getBrandValidation,
  updateBrandValidation,
  deleteBrandValidation,
  updateBrandOrderValidation,
} = require("../validations/brand");

const router = express.Router();

router.route("/").post(validate(createBrandValidation), createBrand);

router.route("/").get(getBrands);

router.route("/all").get(getAllBrands);

router.route("/dropDown").get(getBrandDropdown);

router.route("/:id").get(validate(getBrandValidation), getBrandById);

router.put("/:id", validate(updateBrandValidation), updateBrand);
router.post(
  "/update-order",
  validate(updateBrandOrderValidation),
  updateBrandOrderController
);

router.delete("/:id", validate(deleteBrandValidation), deleteBrand);

module.exports = router;
