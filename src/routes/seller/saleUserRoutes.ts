import express from 'express';
import {
    createUser,
    getUserById,
    getUsers,
} from '../../controllers/seller/saleUserController';
import { authorizeRoles, verifyJWT } from '../../middlewares/auth.middleware';
import upload from '../../middlewares/upload';

const router = express.Router();

router.route("/").post(createUser);
router.route("/").get(verifyJWT, getUsers);
router.route('/:id').get(verifyJWT, getUserById)



export default router;
