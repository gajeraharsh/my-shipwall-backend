import express from 'express';
import {
    createUser,
    deleteUserById,
    getUserById,
    getUsers,
    updateUser,
    getSaleUserDropdown
} from '../../controllers/seller/saleUserController';
import { verifyJWT } from '../../middlewares/auth.middleware';
import upload from '../../middlewares/upload';

const router = express.Router();

router.route("/").post(createUser);
router.route("/").get(verifyJWT, getUsers);
router.route("/dropdown").get(verifyJWT, getSaleUserDropdown);
router.route('/:id').get(verifyJWT, getUserById)

router.route("/:userId").put(verifyJWT, upload.fields([
    { name: 'profileImage', maxCount: 1 },
]), (req: any, res, next) => {
    if (req.files) {
        if (req.files.profileImage) {
            req.body.profileImage = req.files.profileImage[0].originalname;
        }
    }
    next();
}, updateUser);

router.route('/:id').delete(verifyJWT, deleteUserById)




export default router;
