const express = require("express");

const { verifyJWT } = require("../middlewares/auth.middleware");

const {
  getChats,
  sendAttachment,
  sendMessage,
} = require("../controllers/chatController");

const upload = require("../middlewares/upload");

const router = express.Router();

router.route("/").get(verifyJWT, getChats);
router.route("/send-message").post(verifyJWT, sendMessage);

router.route("/send-attachment").post(
  verifyJWT,
  upload.single("attachment"),
  (req, res, next) => {
    if (req.file) {
      req.body.attachment = req.file.originalname;
    }
    next();
  },
  sendAttachment
);

// router.route("/change/:orderId").post(verifyJWT, changeOrderController);
// router.route("/payment/:orderId").post(verifyJWT, chanegPaymentStatusController);

module.exports = router;
