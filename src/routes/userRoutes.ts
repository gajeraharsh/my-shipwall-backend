import express from 'express';
import { changePassword, createUser, deleteUserById, getCustomerById, getUser, getUsers, getUsersV2, loginUser, logoutUser, updateUser, updateVerification, } from '../controllers/userController';
import { authorizeRoles, verifyJWT } from '../middlewares/auth.middleware';
import upload from '../middlewares/upload';
import { getUserById } from '../controllers/seller/saleUserController';

const router = express.Router();


router.route("/").get(verifyJWT, getUsers);
router.route("/v2").get(verifyJWT, getUsersV2);
router.route('/user').get(verifyJWT, getUser)
router.route('/:id').get(verifyJWT, getCustomerById)


router.route("/create").post(createUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);


router.route("/change-password").post(verifyJWT, changePassword);

router.route("/:userId").put(verifyJWT, upload.fields([
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
router.route('/verification/:userId').put(verifyJWT, authorizeRoles("admin"), updateVerification)

router.route('/:id').delete(verifyJWT, deleteUserById)




export default router;
