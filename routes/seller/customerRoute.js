const express = require("express");
const {
  assignSaleUser,
  createCustomer,
  deleteCustomerById,
  getCustomerById,
  getCustomerOrders,
  getCustomerPotentialReport,
  getCustomers,
  getStoreVisits,
  updateCustomer,
  createUserByAdmin,
  dashboardMatrix,
  getTopCustomersPerformance,
} = require("../../controllers/seller/customerController");

const { verifyJWT } = require("../../middlewares/auth.middleware");
const upload = require("../../middlewares/upload");

const {
  getIncentivePayouts,
  getIncentivePayoutsReport,
} = require("../../controllers/seller/IncentivePayoutController");

const router = express.Router();

router.route("/").post(createCustomer);
router.route("/create-user-by-admin").post(verifyJWT, createUserByAdmin);
router.route("/").get(verifyJWT, getCustomers);
router.route("/sale-dashboard-matrix").get(verifyJWT, dashboardMatrix);
router.route("/top-customer-performance").get(verifyJWT, getTopCustomersPerformance);


router.route("/store-visit").get(verifyJWT, getStoreVisits);
router.route("/potential-report").get(verifyJWT, getCustomerPotentialReport);
router.route("/incentive-payouts").get(verifyJWT, getIncentivePayouts);
router.route("/incentive-report").get(verifyJWT, getIncentivePayoutsReport);

router.route("/orders").get(verifyJWT, getCustomerOrders);
router.route("/:id").get(verifyJWT, getCustomerById);

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
  updateCustomer
);
router.route("/assign-sale-perssosn/:userId").put(verifyJWT, assignSaleUser);

router.route("/:id").delete(verifyJWT, deleteCustomerById);

module.exports = router;
