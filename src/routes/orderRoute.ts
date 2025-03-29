import express from "express"; // Use ES module imports for consistency

import { verifyJWT } from "../middlewares/auth.middleware";
import {
    UploadLrController,
    chanegPaymentStatusController,
    changeOrderController,
    getOrderbyId,
    getOrders,
    updateOrderStatusController
} from "../controllers/orderController";
import upload from "../middlewares/upload";

const router = express.Router();


router.route("/").get(verifyJWT, getOrders);
router.route("/:orderId").get(verifyJWT, getOrderbyId);


router.route("/change-status/:orderId").post(verifyJWT, updateOrderStatusController);
router.route("/change/:orderId").post(verifyJWT, changeOrderController);
router.route("/payment/:orderId").post(verifyJWT, chanegPaymentStatusController);

router.route("/uploadlr/:orderId").post(verifyJWT, upload.single("uploadlr"), (req, res, next) => {
    if (req.file) {
        req.body.uploadlr = req.file.originalname;
    }
    next();
}, UploadLrController);


export default router;
