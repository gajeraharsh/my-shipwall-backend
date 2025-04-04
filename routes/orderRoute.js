const express = require("express");
const { verifyJWT } = require("../middlewares/auth.middleware");
const {
  UploadLrController,
  chanegPaymentStatusController,
  changeOrderController,
  getAllOrders,
  getOrderbyId,
  updateOrderStatusController,
} = require("../controllers/orderController");
const upload = require("../middlewares/upload");

const router = express.Router();

router.route("/").get(verifyJWT, getAllOrders);
router.route("/:orderId").get(verifyJWT, getOrderbyId);
router
  .route("/change-status/:orderId")
  .post(verifyJWT, updateOrderStatusController);
router.route("/change/:orderId").post(verifyJWT, changeOrderController);
router
  .route("/payment/:orderId")
  .post(verifyJWT, chanegPaymentStatusController);

router.route("/uploadlr/:orderId").post(
  verifyJWT,
  upload.single("uploadlr"),
  (req, res, next) => {
    if (req.file) {
      req.body.uploadlr = req.file.originalname;
    }
    next();
  },
  UploadLrController
);

module.exports = router;
