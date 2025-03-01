import express from "express"; // Use ES module imports for consistency
import {
  createProducts,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsDropdown
} from "../controllers/productController";
import validate from "../middlewares/validate";
import {
  createProductValidation,
  updateProductValidation,
  getProductValidation,
  deleteProductValidation,
} from "../validations/product";
import { verifyJWT } from "../middlewares/auth.middleware";
import upload from "../middlewares/upload";

const router = express.Router();

router.route("/").post(verifyJWT, upload.fields([
  {
    name: 'productThumbImage',
    maxCount: 1
  },
  {
    name: 'dataSheet',
    maxCount: 1
  }
]), (req: any, res, next) => {
  if (req.files) {
    if (req.files.productThumbImage) {
      req.body.productThumbImage = req.files.productThumbImage[0].originalname;
    }

    if (req.files.dataSheet) {
      req.body.dataSheet = req.files.dataSheet[0].originalname;
    }
  }
  next();
}, validate(createProductValidation), createProducts);

router.route("/").get(getProducts);

router.route("/dropDown").get(getProductsDropdown);

router.route("/:id").get(validate(getProductValidation), getProductById);

router.put("/:id", verifyJWT, upload.fields([
  {
    name: 'productThumbImage',
    maxCount: 1
  },
  {
    name: 'dataSheet',
    maxCount: 1
  }
]), (req: any, res, next) => {
  if (req.files) {
    if (req.files.productThumbImage) {
      req.body.productThumbImage = req.files.productThumbImage[0].originalname;
    }

    if (req.files.dataSheet) {
      req.body.dataSheet = req.files.dataSheet[0].originalname;
    }
  }
  next();
}, validate(updateProductValidation), updateProduct);
router.delete("/:id", validate(deleteProductValidation), deleteProduct);

export default router;
