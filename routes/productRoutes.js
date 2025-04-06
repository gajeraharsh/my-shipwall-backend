const express = require("express");
const {
  createProducts,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsDropdown,
  updateProductGallery,
  reorderGalleryImages,
  getAllProducts,
  updateProductOrderController,
} = require("../controllers/productController");
const validate = require("../middlewares/validate");
const {
  createProductValidation,
  updateProductValidation,
  getProductValidation,
  deleteProductValidation,
  updateProducrtOrderValidation,
} = require("../validations/product");
const { verifyJWT } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload");

const router = express.Router();

router.route("/").post(
  verifyJWT,
  upload.fields([
    { name: "productThumbImage", maxCount: 1 },
    { name: "dataSheet", maxCount: 1 },
  ]),
  (req, res, next) => {
    if (req.files) {
      if (req.files.productThumbImage) {
        req.body.productThumbImage =
          req.files.productThumbImage[0].originalname;
      }
      if (req.files.dataSheet) {
        req.body.dataSheet = req.files.dataSheet[0].originalname;
      }
    }
    next();
  },
  validate(createProductValidation),
  createProducts
);

router.route("/").get(getProducts);
router.route("/dropDown").get(getProductsDropdown);
router.route("/all").get(getAllProducts);

router.route("/:id").get(validate(getProductValidation), getProductById);

router.put(
  "/:id",
  verifyJWT,
  upload.fields([
    { name: "productThumbImage", maxCount: 1 },
    { name: "dataSheet", maxCount: 1 },
    { name: "productImages", maxCount: 10 },
  ]),
  (req, res, next) => {
    if (req.files) {
      if (req.files.productThumbImage) {
        req.body.productThumbImage =
          req.files.productThumbImage[0].originalname;
      }
      if (req.files.dataSheet) {
        req.body.dataSheet = req.files.dataSheet[0].originalname;
      }
      if (req.files.productImages) {
        req.body.productImages = req.files.productImages.map(
          (file) => file.originalname
        );
      }
    }
    next();
  },
  validate(updateProductValidation),
  updateProduct
);

router.post(
  "/update-order",
  validate(updateProducrtOrderValidation),
  updateProductOrderController
);
router.delete("/:id", validate(deleteProductValidation), deleteProduct);
router.post(
  "/update-gallery/:id",
  upload.array("images", 10),
  updateProductGallery
);
router.put("/reorder-gallery/:id", reorderGalleryImages);

module.exports = router;
