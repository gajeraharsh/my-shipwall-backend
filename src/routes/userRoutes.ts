import express from 'express';
import { createUser, loginUser, logoutUser, } from '../controllers/userController';
import { verifyJWT } from '../middlewares/auth.middleware';

const router = express.Router();


router.route("/create").post(createUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);




export default router;
