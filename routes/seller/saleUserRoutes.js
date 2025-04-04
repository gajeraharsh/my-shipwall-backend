const express = require("express");
const {
  createUser,
  deleteUserById,
  getUserById,
  getUsers,
  updateUser,
  getSaleUserDropdown,
  getSaleUserDetailsById,
} = require("../../controllers/seller/saleUserController");

const { verifyJWT } = require("../../middlewares/auth.middleware");
const upload = require("../../middlewares/upload");

const {
  getOrderbyId,
  getOrderBySalePerson,
} = require("../../controllers/orderController");

const router = express.Router();

router.route("/").post(createUser);
router.route("/").get(verifyJWT, getUsers);
router.route("/dropdown").get(verifyJWT, getSaleUserDropdown);
router.route("/orders").get(verifyJWT, getOrderBySalePerson);
router.route("/orders/:orderId").get(verifyJWT, getOrderbyId);
router.route("/:id").get(verifyJWT, getUserById);
router.route("/details/:id").get(verifyJWT, getSaleUserDetailsById);

router.route("/:userId").put(
  verifyJWT,
  upload.fields([{ name: "profileImage", maxCount: 1 }]),
  (req, res, next) => {
    if (req.files) {
      if (req.files.profileImage) {
        req.body.profileImage = req.files.profileImage[0].originalname;
      }
    }
    next();
  },
  updateUser
);

router.route("/:id").delete(verifyJWT, deleteUserById);

module.exports = router;
