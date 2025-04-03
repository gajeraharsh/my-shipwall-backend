import express from "express";
import {
    createVisit,
    getVisits,
    getVisitById,
    updateVisit,
    deleteVisit
} from "../controllers/storeVisitController";
import validate from "../middlewares/validate";
import {
    createStoreVisitValidation,
    getStoreVisitValidation,
    updateStoreVisitValidation,
    deleteStoreVisitValidation
} from "../validations/storeVisit";
import { verifyJWT } from "../middlewares/auth.middleware";
import upload from "../middlewares/upload";

const router = express.Router();

router
    .route("/")
    .post(
        verifyJWT,
        upload.array("images", 5), // allow multiple images
        (req, res, next) => {
            if (req.files && Array.isArray(req.files)) {
                req.body.images = req.files.map((file: any) => file.originalname);
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

export default router;
