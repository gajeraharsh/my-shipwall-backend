const express = require("express");
const {
    getGeneralsetting,
    updateGeneralSetting
} = require("../controllers/generalSettingcontroller");

const validate = require("../middlewares/validate");

const { createValidation } = require("../validations/generalSetting");

const router = express.Router();

router.route("/").get(getGeneralsetting);
router.put("/", validate(createValidation), updateGeneralSetting);

module.exports = router;
