const express = require("express");
const {
  createAdminUser,
  deleteAdminUserById,
  getAdminUserById,
  getAdminUsers,
  getAdminUsersDropdown,
  updateAdminUser,
} = require("../../controllers/seller/adminUserController");
const { verifyJWT } = require("../../middlewares/auth.middleware");
const upload = require("../../middlewares/upload");

const router = express.Router();

router.route("/").post(
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
  createAdminUser
);
router.route("/").get(verifyJWT, getAdminUsers);
router.route("/dropdown").get(verifyJWT, getAdminUsersDropdown);
router.route("/:id").get(verifyJWT, getAdminUserById);

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
  updateAdminUser
);

router.route("/:id").delete(verifyJWT, deleteAdminUserById);

module.exports = router;
