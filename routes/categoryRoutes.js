const express = require("express");

const {
  createCategory,
  getCategories,
  getCatehgoryById,
  updateCategory,
  deleteCategory,
  getCategoryDropdown,
  getAllCategories,
  updateCategoryOrderController,
} = require("../controllers/categoryController");

const validate = require("../middlewares/validate");

const {
  createCategoryValidation,
  getCategoryValidation,
  updateCategoryValidation,
  deleteCategoryValidation,
  updateCategoryOrderValidation,
} = require("../validations/category");

const { verifyJWT } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload");

const router = express.Router();

router.route("/").post(
  verifyJWT,
  upload.single("iconImage"),
  (req, res, next) => {
    if (req.file) {
      req.body.iconImage = req.file.originalname;
    }
    next();
  },
  validate(createCategoryValidation),
  createCategory
);

router.route("/").get(verifyJWT, getCategories);

router.route("/all").get(getAllCategories);

router.route("/dropDown").get(verifyJWT, getCategoryDropdown);

router
  .route("/:id")
  .get(verifyJWT, validate(getCategoryValidation), getCatehgoryById);

router.put(
  "/:id",
  verifyJWT,
  upload.single("iconImage"),
  (req, res, next) => {
    if (req.file) {
      req.body.iconImage = req.file.originalname;
    }
    next();
  },
  validate(updateCategoryValidation),
  updateCategory
);
router.post(
  "/update-order",
  validate(updateCategoryOrderValidation),
  updateCategoryOrderController
);

router.delete(
  "/:id",
  verifyJWT,
  validate(deleteCategoryValidation),
  deleteCategory
);

module.exports = router;
