const express = require("express");

const {
  GetColorMasterById,
  createColorMaster,
  deleteColorMaster,
  getColorMasterDropDown,
  getColorMasters,
  updateColorMaster,
} = require("../controllers/colorMasterController");

const validate = require("../middlewares/validate");

const {
  createValidation,
  deleteValidation,
  getValidation,
  updateValidation,
} = require("../validations/colorMaster");

const router = express.Router();

router.route("/").post(validate(createValidation), createColorMaster);

router.route("/").get(getColorMasters);

router.route("/dropDown").get(getColorMasterDropDown);

router.route("/:id").get(validate(getValidation), GetColorMasterById);

router.put("/:id", validate(updateValidation), updateColorMaster);
router.delete("/:id", validate(deleteValidation), deleteColorMaster);

module.exports = router;
