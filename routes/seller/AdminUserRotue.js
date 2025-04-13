const express = require("express");
const {
  createAdminUser,
  deleteAdminUserById,
  getAdminUserById,
  getAdminUsers,
  getAdminUsersDropdown,
  updateAdminUser,
  adminDashboardMatrix,
  getTopSellingProducts,
  getTopSalesPersons,
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
router.route("/admin-dashboard-matrix").get(verifyJWT, adminDashboardMatrix);
router.route("/top-selling-products").get(verifyJWT, getTopSellingProducts);
router.route("/top-selling-person").get(verifyJWT, getTopSalesPersons);


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
