const express = require("express");

const {
  createReward,
  deleteReward,
  getRewardById,
  getRewards,
  updateReward,
  getRewardCreditHistory,
} = require("../controllers/rewardController");

const {
  createRewardProduct,
  deleteRewardProduct,
  getRewardProductById,
  getRewardProducts,
  updateRewardProduct,
} = require("../controllers/rewardProductController");

const {
  getRewardOrders,
  getRewardOrderById,
  updateRewardOrderStatusController,
} = require("../controllers/rewardOrderController");

const { verifyJWT } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload");

const router = express.Router();

router.route("/").post(verifyJWT, createReward);

router.route("/").get(verifyJWT, getRewards);
router.route("/products").get(verifyJWT, getRewardProducts);
router.route("/reward-orders").get(verifyJWT, getRewardOrders);
router.route("/reward-orders/:id").get(verifyJWT, getRewardOrderById);
router
  .route("/reward-orders/:id")
  .put(verifyJWT, updateRewardOrderStatusController);

router.route('/user-reward/:id').get(getRewardCreditHistory)


router.route("/:id").get(verifyJWT, getRewardById);

router.put("/:id", verifyJWT, updateReward);
router.delete("/:id", verifyJWT, deleteReward);

// reward products

router.route("/products").post(
  verifyJWT,
  upload.single("thumbImage"),
  (req, res, next) => {
    if (req.file) {
      req.body.thumbImage = req.file.originalname;
    }
    next();
  },
  createRewardProduct
);

router.route("/products/:id").get(verifyJWT, getRewardProductById);

router.put(
  "/products/:id",
  verifyJWT,
  upload.single("thumbImage"),
  (req, res, next) => {
    if (req.file) {
      req.body.thumbImage = req.file.originalname;
    }
    next();
  },
  updateRewardProduct
);
router.delete("/products/:id", verifyJWT, deleteRewardProduct);

// Reward Orders

module.exports = router;
