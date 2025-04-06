const express = require("express");
const {
    createSupport,
    getSupports,
    getSupportById,
    updateSupport,
    deleteSupport,
} = require("../controllers/supportController");

const validate = require("../middlewares/validate");
const {
    createSupportValidation,
    getSupportValidation,
    updateSupportValidation,
    deleteSupportValidation,
} = require("../validations/supportValidation");

const { verifyJWT } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload");

const router = express.Router();

router.route("/").post(
    verifyJWT,
    upload.single("issueImage"),
    (req, res, next) => {
        if (req.file) {
            req.body.issueImage = req.file.originalname;
        }
        next();
    },
    validate(createSupportValidation),
    createSupport
);
router.route("/").get(verifyJWT, getSupports);
router.route("/:id").get(verifyJWT, validate(getSupportValidation), getSupportById);
router.put("/:id", verifyJWT, validate(updateSupportValidation), updateSupport);
router.delete("/:id", verifyJWT, validate(deleteSupportValidation), deleteSupport);

module.exports = router;
