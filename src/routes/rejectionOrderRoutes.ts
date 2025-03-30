import express from "express"; // Use ES module imports for consistency

import { getAllRejectionOrders, getRejectionOrderbyId, orderRejectionApproveController, updateRejectionOrderStatus } from "../controllers/orderRejectionController";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = express.Router();


router.route("/").get(verifyJWT, getAllRejectionOrders);
router.route("/:orderId").get(verifyJWT, getRejectionOrderbyId);


router.route("/change-status/:orderId").post(verifyJWT, updateRejectionOrderStatus);
router.route("/approve-refund/:orderId").post(verifyJWT, orderRejectionApproveController );



export default router;
