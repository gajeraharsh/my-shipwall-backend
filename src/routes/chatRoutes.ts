import express from "express"; // Use ES module imports for consistency

import { verifyJWT } from "../middlewares/auth.middleware";
import {
    getChats,
    sendAttachment,
    sendMessage
} from "../controllers/chatController";
import upload from "../middlewares/upload";

const router = express.Router();


router.route("/").get(verifyJWT, getChats);
router.route("/send-message").post(verifyJWT, sendMessage);

router.route("/send-attachment").post(verifyJWT, upload.single("attachment"), (req, res, next) => {
    if (req.file) {
        req.body.attachment = req.file.originalname;
    }
    next();
}, sendAttachment);


// router.route("/change/:orderId").post(verifyJWT, changeOrderController);
// router.route("/payment/:orderId").post(verifyJWT, chanegPaymentStatusController);


export default router;
