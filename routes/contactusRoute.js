const express = require("express");
const {
    createContact,
    deleteContact,
    getContactsController,
    updateContact
} = require("../controllers/contactusController");

const validate = require("../middlewares/validate");

const {
    createContactValidation,
    updateContactValidation,
    deleteContactValidation
} = require("../validations/contactus");

const router = express.Router();

router.route("/").post(validate(createContactValidation), createContact);
router.route("/").get(getContactsController);
router.route("/:id").put(validate(updateContactValidation), updateContact);
router.route("/:id").delete(validate(deleteContactValidation), deleteContact);

module.exports = router;
