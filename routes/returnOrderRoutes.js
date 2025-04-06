const express = require("express"); // Use CommonJS require for consistency

const { verifyJWT } = require("../middlewares/auth.middleware");
const {
  getAllReturnOrders,
  getReturnOrderbyId,
  orderReturnApproveController,
  updateReturnOrderStatus,
} = require("../controllers/returnOrderController");

const router = express.Router();

router.route("/").get(verifyJWT, getAllReturnOrders);
router.route("/:orderId").get(verifyJWT, getReturnOrderbyId);

router.route("/change-status/:orderId").post(verifyJWT, updateReturnOrderStatus);
router.route("/approve-refund/:orderId").post(verifyJWT, orderReturnApproveController);

module.exports = router;
