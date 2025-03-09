import express from 'express';
import { createUser, loginUser, logoutUser, updateUser, } from '../controllers/userController';
import { verifyJWT } from '../middlewares/auth.middleware';
import upload from "../middlewares/upload";

const router = express.Router();


router.route("/create").post(createUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);





export default router;
