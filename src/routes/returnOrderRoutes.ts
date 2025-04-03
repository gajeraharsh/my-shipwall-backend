import express from "express"; // Use ES module imports for consistency

import { verifyJWT } from "../middlewares/auth.middleware";
import { getAllReturnOrders, getReturnOrderbyId, orderReturnApproveController, updateReturnOrderStatus } from "../controllers/returnOrderController";

const router = express.Router();


router.route("/").get(verifyJWT, getAllReturnOrders);
router.route("/:orderId").get(verifyJWT, getReturnOrderbyId);


router.route("/change-status/:orderId").post(verifyJWT, updateReturnOrderStatus);
router.route("/approve-refund/:orderId").post(verifyJWT, orderReturnApproveController);



export default router;
