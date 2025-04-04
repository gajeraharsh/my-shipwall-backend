const express = require("express");
const {
    createVisit,
    getVisits,
    getVisitById,
    updateVisit,
    deleteVisit
} = require("../controllers/storeVisitController");

const validate = require("../middlewares/validate");
const {
    createStoreVisitValidation,
    getStoreVisitValidation,
    updateStoreVisitValidation,
    deleteStoreVisitValidation
} = require("../validations/storeVisit");

const { verifyJWT } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload");

const router = express.Router();

router
    .route("/")
    .post(
        verifyJWT,
        upload.array("images", 5), // allow multiple images
        (req, res, next) => {
            if (req.files && Array.isArray(req.files)) {
                req.body.images = req.files.map((file) => file.originalname);
            }
            next();
        },
        validate(createStoreVisitValidation),
        createVisit
    )
    .get(verifyJWT, getVisits);

router
    .route("/:id")
    .get(verifyJWT, validate(getStoreVisitValidation), getVisitById)
    .put(verifyJWT, validate(updateStoreVisitValidation), updateVisit)
    .delete(verifyJWT, validate(deleteStoreVisitValidation), deleteVisit);

module.exports = router;
