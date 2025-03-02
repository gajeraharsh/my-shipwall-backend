import express from "express";
import { authorizeRoles, verifyJWT } from "../middlewares/auth.middleware";
import { getBanners } from "../controllers/bannerController";
import { getProducts } from "../controllers/productController";
import { createUser, getUser, loginUser, logoutUser } from "../controllers/userController";

const router = express.Router();


// Auth

router.route("/auth/create").post(createUser);
router.route("/auth/login").post(loginUser);
router.route("/auth/logout").post(verifyJWT, logoutUser);


// User
router.route('/user').get(verifyJWT,authorizeRoles('user'), getUser)

//Banners
router.route("/banners").get(getBanners);


//brands


//Proudcts
router.route("/products").get(getProducts);


export default router;
