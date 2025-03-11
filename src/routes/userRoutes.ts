import express from 'express';
import { changePassword, createUser, getUsers, loginUser, logoutUser, updateUser, } from '../controllers/userController';
import { verifyJWT } from '../middlewares/auth.middleware';

const router = express.Router();


router.route("/").get(verifyJWT, getUsers);
router.route("/create").post(createUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);


router.route("/change-password").post(verifyJWT, changePassword);




export default router;
