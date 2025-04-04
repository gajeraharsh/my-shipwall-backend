const express = require("express"); // Use CommonJS require for consistency

const {
  getAllRejectionOrders,
  getRejectionOrderbyId,
  orderRejectionApproveController,
  updateRejectionOrderStatus,
} = require("../controllers/orderRejectionController");

const { verifyJWT } = require("../middlewares/auth.middleware");

const router = express.Router();

router.route("/").get(verifyJWT, getAllRejectionOrders);
router.route("/:orderId").get(verifyJWT, getRejectionOrderbyId);

router.route("/change-status/:orderId").post(verifyJWT, updateRejectionOrderStatus);
router.route("/approve-refund/:orderId").post(verifyJWT, orderRejectionApproveController);

module.exports = router;
