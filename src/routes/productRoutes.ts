import express from "express"; // Use ES module imports for consistency
import {
  createProducts,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsDropdown,
  updateProductGallery,
  reorderGalleryImages
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
  { name: 'productThumbImage', maxCount: 1 },
  { name: 'dataSheet', maxCount: 1 },
  { name: 'productImages', maxCount: 10 } // Allow up to 10 images
]), (req: any, res, next) => {
  if (req.files) {
    if (req.files.productThumbImage) {
      req.body.productThumbImage = req.files.productThumbImage[0].originalname;
    }

    if (req.files.dataSheet) {
      req.body.dataSheet = req.files.dataSheet[0].originalname;
    }

    if (req.files.productImages) {
      req.body.productImages = req.files.productImages.map((file: any) => file.originalname);
    }
  }
  next();
}, validate(updateProductValidation), updateProduct);
router.delete("/:id", validate(deleteProductValidation), deleteProduct);


// Route to upload new images to the gallery
router.post("/update-gallery/:id", upload.array("images", 10), updateProductGallery);

// Route to reorder images
router.put("/reorder-gallery/:id", reorderGalleryImages);


export default router;
