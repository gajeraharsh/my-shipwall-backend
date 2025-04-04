const express = require("express");
const {
    createHsnCode,
    deleteHsnCode,
    getHsnCodeById,
    getHsnCodes,
    getHsnDropdown,
    updateHsnCode
} = require("../controllers/hsnCodeController");

const validate = require("../middlewares/validate");

const {
    createHsnCodeValidation,
    deleteHsnValidation,
    getHsnValidation,
    updateHsnValidation
} = require("../validations/hsnCode");

const router = express.Router();

router.route("/").post(validate(createHsnCodeValidation), createHsnCode);
router.route("/").get(getHsnCodes);
router.route("/dropDown").get(getHsnDropdown);
router.route("/:id").get(validate(getHsnValidation), getHsnCodeById);
router.put("/:id", validate(updateHsnValidation), updateHsnCode);
router.delete("/:id", validate(deleteHsnValidation), deleteHsnCode);

module.exports = router;
