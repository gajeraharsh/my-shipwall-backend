import express from "express";
import { authorizeRoles, verifyJWT } from "../middlewares/auth.middleware";
import { getBanners } from "../controllers/bannerController";
import { getProductById, getProducts } from "../controllers/productController";
import { createUser, getUser, loginUser, logoutUser, updateUser } from "../controllers/userController";
import { getSeries } from "../controllers/seriesController";
import { getCategories } from "../controllers/categoryController";
import { getProductsByCategory } from "../controllers/Web/seariestController";
import { addToCart, getCart, removeFromCart } from "../controllers/cartController";
import { createOrder, getOrderbyId, getOrders } from "../controllers/orderController";
import { getBrands } from "../controllers/brandController";
import { getCategoriesByBrand } from "../controllers/Web/categoriesController";
import upload from "../middlewares/upload";
import validate from "../middlewares/validate";
import { createSupportValidation, deleteSupportValidation, getSupportValidation, updateSupportValidation } from "../validations/supportValidation";
import { createSupport, deleteSupport, getSupportById, getSupports, updateSupport } from "../controllers/supportController";

const router = express.Router();


// Auth

router.route("/auth/create").post(createUser);
router.route("/auth/login").post(loginUser);
router.route("/auth/logout").post(verifyJWT, logoutUser);

router.route("/auth/user/:userId").put(verifyJWT, upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'businessFrontPremisesPhoto', maxCount: 1 },
    { name: 'businessStockWithOwnerPhoto', maxCount: 1 },
    { name: 'ownerPhoto', maxCount: 1 },
    { name: 'visitingCardPhoto', maxCount: 1 },
    { name: 'gstCertificate', maxCount: 1 },
    { name: 'businessAddressProof', maxCount: 1 }
]), (req: any, res, next) => {
    if (req.files) {
        if (req.files.profileImage) {
            req.body.profileImage = req.files.profileImage[0].originalname;
        }
        if (req.files.businessFrontPremisesPhoto) {
            req.body.businessFrontPremisesPhoto = req.files.businessFrontPremisesPhoto[0].originalname;
        }
        if (req.files.businessStockWithOwnerPhoto) {
            req.body.businessStockWithOwnerPhoto = req.files.businessStockWithOwnerPhoto[0].originalname;
        }
        if (req.files.ownerPhoto) {
            req.body.ownerPhoto = req.files.ownerPhoto[0].originalname;
        }
        if (req.files.visitingCardPhoto) {
            req.body.visitingCardPhoto = req.files.visitingCardPhoto[0].originalname;
        }
        if (req.files.gstCertificate) {
            req.body.gstCertificate = req.files.gstCertificate[0].originalname;
        }
        if (req.files.businessAddressProof) {
            req.body.businessAddressProof = req.files.businessAddressProof[0].originalname;
        }
    }
    next();
}, updateUser);


// User
router.route('/user').get(verifyJWT, authorizeRoles('user'), getUser)

//Banners
router.route("/banners").get(getBanners);

//brands
router.route("/brand").get(getBrands)

// series
router.route("/series").get(getSeries);
router.route("/get-product-list").get(getProductsByCategory);


// categories
router.route("/category").get(getCategories);
router.route("/categoryBybrand").get(getCategoriesByBrand);



//Proudcts
router.route("/products").get(getProducts);
router.route("/products-details/:id").get(getProductById);


// Carts
router.post("/cart/add", verifyJWT, addToCart);
router.delete("/cart/remove/:productId", verifyJWT, removeFromCart);
router.get("/cart/", verifyJWT, getCart);


// Orders
router.get("/order", verifyJWT, getOrders);
router.get("/order/orderId", verifyJWT, getOrderbyId);
router.post("/order/create", verifyJWT, createOrder);


// support
router.route("/support").post(verifyJWT, upload.single("issueImage"), (req, res, next) => {
    if (req.file) {
        req.body.issueImage = req.file.originalname;
    }
    next();
}, validate(createSupportValidation), createSupport);
router.route("/support").get(verifyJWT, getSupports);
router.route("/support/:id").get(verifyJWT, validate(getSupportValidation), getSupportById);
router.put("/support/:id", verifyJWT, validate(updateSupportValidation), updateSupport);
router.delete("/support/:id", verifyJWT, validate(deleteSupportValidation), deleteSupport);




export default router;
