import express from "express";
import {
    createStateController,
    getStatesController,
    getStateByIdController,
    updateStateController,
    deleteStateController,

    createCityController,
    getCitiesController,
    getCityByIdController,
    updateCityController,
    deleteCityController,

    createIncentiveController,
    getIncentivesController,
    getIncentiveByIdController,
    updateIncentiveController,
    deleteIncentiveController,
    getStatesDropdown
} from "../../controllers/seller/AppSettingController";
import validate from "../../middlewares/validate";
import {
    createStateValidation,
    getStateValidation,
    updateStateValidation,
    deleteStateValidation,

    createCityValidation,
    getCityValidation,
    updateCityValidation,
    deleteCityValidation,

    createIncentiveValidation,
    getIncentiveValidation,
    updateIncentiveValidation,
    deleteIncentiveValidation
} from "../../validations/seller/AppSetting";

const router = express.Router();

router.route("/state").post(validate(createStateValidation), createStateController);
router.route("/state").get(getStatesController);
router.route("/state/dropDown").get(getStatesDropdown);

router.route("/state/:id").get(validate(getStateValidation), getStateByIdController);
router.put("/state/:id", validate(updateStateValidation), updateStateController);
router.delete("/state/:id", validate(deleteStateValidation), deleteStateController);

router.route("/city").post(validate(createCityValidation), createCityController);
router.route("/city").get(getCitiesController);
router.route("/city/:id").get(validate(getCityValidation), getCityByIdController);
router.put("/city/:id", validate(updateCityValidation), updateCityController);
router.delete("/city/:id", validate(deleteCityValidation), deleteCityController);


router.route("/incentive").post(validate(createIncentiveValidation), createIncentiveController);
router.route("/incentive").get(getIncentivesController);
router.route("/incentive/:id").get(validate(getIncentiveValidation), getIncentiveByIdController,
);
router.put("/incentive/:id", validate(updateIncentiveValidation), updateIncentiveController);
router.delete("/incentive/:id", validate(deleteIncentiveValidation), deleteIncentiveController);

export default router;
