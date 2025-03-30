import express from "express";
import {
    createContact,
    deleteContact,
    getContactsController,
    updateContact
} from "../controllers/contactusController";
import validate from "../middlewares/validate";
import {
    createContactValidation,
    updateContactValidation,
    deleteContactValidation
} from "../validations/contactus";

const router = express.Router();

router.route("/").post(validate(createContactValidation), createContact);
router.route("/").get(getContactsController);
router.route("/:id").put(validate(updateContactValidation), updateContact);
router.route("/:id").delete(validate(deleteContactValidation), deleteContact);

export default router;
