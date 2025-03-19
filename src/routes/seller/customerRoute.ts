import express from 'express';
import {
    createCustomer,
    deleteCustomerById,
    getCustomerById,
    getCustomerOrders,
    getCustomers,
    updateCustomer
} from '../../controllers/seller/customerController';
import { verifyJWT } from '../../middlewares/auth.middleware';
import upload from '../../middlewares/upload';

const router = express.Router();

router.route("/").post(createCustomer);
router.route("/").get(verifyJWT, getCustomers);
router.route('/orders').get(verifyJWT, getCustomerOrders)
router.route('/:id').get(verifyJWT, getCustomerById)


router.route("/:userId").put(verifyJWT, upload.fields([
    { name: 'profileImage', maxCount: 1 },
]), (req: any, res, next) => {
    if (req.files) {
        if (req.files.profileImage) {
            req.body.profileImage = req.files.profileImage[0].originalname;
        }
    }
    next();
}, updateCustomer);

router.route('/:id').delete(verifyJWT, deleteCustomerById)




export default router;
