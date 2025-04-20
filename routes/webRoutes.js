const express = require("express");
const { authorizeRoles, verifyJWT } = require("../middlewares/auth.middleware");
const { getBanners } = require("../controllers/bannerController");
const {
  getProductById,
  getProducts,
  getWebAllProducts,
} = require("../controllers/productController");
const {
  changePassword,
  createUser,
  forgotPasswordController,
  getUser,
  loginUser,
  logoutUser,
  resendOtp,
  resetPasswordController,
  updateUser,
  verifyOtp,
  getCreditHistory,
} = require("../controllers/userController");
const { getSeries, getWebSeries } = require("../controllers/seriesController");
const {
  getAllCategories,
  getCategories,
  getAllWebCategories,
} = require("../controllers/categoryController");
const {
  getOrderProductsGroupedBySeries,
  getProductsByCategory,
} = require("../controllers/Web/seariestController");
const {
  addToCart,
  getCart,
  removeFromCart,
} = require("../controllers/cartController");
const {
  addToCartRjection,
  getCartRjection,
  removeFromCartRjection,
} = require("../controllers/rjectionCartController");
const {
  createOrder,
  getOrderbyId,
  getOrders,
} = require("../controllers/orderController");
const {
  createRejectionOrder,
  getRejectionOrderbyId,
  getRejectionOrders,
  cancelRejectionOrderWebController,
} = require("../controllers/orderRejectionController");
const { getBrands } = require("../controllers/brandController");
const {
  getCategoriesByBrand,
} = require("../controllers/Web/categoriesController");
const upload = require("../middlewares/upload");
const validate = require("../middlewares/validate");
const {
  createSupportValidation,
  deleteSupportValidation,
  getSupportValidation,
  updateSupportValidation,
} = require("../validations/supportValidation");
const {
  createSupport,
  deleteSupport,
  getSupportById,
  getSupports,
  updateSupport,
} = require("../controllers/supportController");
const { createContactValidation } = require("../validations/contactus");
const { createContact } = require("../controllers/contactusController");
const {
  addToCartReturn,
  getCartReturn,
  removeFromCartReturn,
} = require("../controllers/returnCartController");
const {
  createReturnOrder,
  getReturnOrderbyId,
  getReturnOrders,
  cancelReturnOrderController,
} = require("../controllers/returnOrderController");
const {
  getChats,
  sendAttachment,
  sendMessage,
} = require("../controllers/chatController");

const router = express.Router();

// Auth
router.post("/auth/create", createUser);
router.post("/auth/login", loginUser);
router.post("/auth/verifyopt", verifyOtp);
router.post("/auth/forgotpassword", forgotPasswordController);
router.post("/auth/resetpassword", resetPasswordController);
router.post("/auth/resendotp", resendOtp);
router.post("/auth/logout", verifyJWT, logoutUser);
router.post("/auth/changepassword", verifyJWT, changePassword);

router.put(
  "/auth/user/:userId",
  verifyJWT,
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "businessFrontPremisesPhoto", maxCount: 1 },
    { name: "businessStockWithOwnerPhoto", maxCount: 1 },
    { name: "ownerPhoto", maxCount: 1 },
    { name: "visitingCardPhoto", maxCount: 1 },
    { name: "gstCertificate", maxCount: 1 },
    { name: "businessAddressProof", maxCount: 1 },
  ]),
  (req, res, next) => {
    if (req.files) {
      Object.keys(req.files).forEach((key) => {
        req.body[key] = req.files[key][0].originalname;
      });
    }
    next();
  },
  updateUser
);

// User
router.get("/user", verifyJWT, authorizeRoles("user"), getUser);

// credit history
router.get(
  "/credit-history",
  verifyJWT,
  authorizeRoles("user"),
  getCreditHistory
);

// Banners
router.get("/banners", getBanners);

// Brands
router.get("/brand", getBrands);

// Series
router.get("/series", getWebSeries);
router.get("/get-product-list", getProductsByCategory);

// Categories
router.get("/category", getAllWebCategories);
router.get("/categoryBybrand", getCategoriesByBrand);

// Products
router.get("/products", getWebAllProducts);
router.get("/products-details/:id", getProductById);

// Carts
router.post("/cart/add", verifyJWT, addToCart);
router.delete("/cart/remove/:productId", verifyJWT, removeFromCart);
router.get("/cart", verifyJWT, getCart);

router.post("/rejection-cart/add", verifyJWT, addToCartRjection);
router.delete(
  "/rejection-cart/remove/:productId",
  verifyJWT,
  removeFromCartRjection
);
router.get("/rejection-cart", verifyJWT, getCartRjection);

// Orders
router.get("/order", verifyJWT, getOrders);
router.get("/order/:orderId", verifyJWT, getOrderbyId);
router.post("/order/create", verifyJWT, createOrder);
router.get("/invoice/:orderId", getOrderbyId);

router.get("/rejection-orders", verifyJWT, getRejectionOrders);
router.get("/rejection-orders/:orderId", verifyJWT, getRejectionOrderbyId);
router.post(
  "/rejection-orders/create",
  verifyJWT,
  upload.single("issueImage"),
  (req, res, next) => {
    if (req.file) req.body.issueImage = req.file.originalname;
    next();
  },
  createRejectionOrder
);
router.post(
  "/rejection-order/cancel",
  verifyJWT,
  cancelRejectionOrderWebController
);

// Support
router.post(
  "/support",
  verifyJWT,
  upload.single("issueImage"),
  (req, res, next) => {
    if (req.file) req.body.issueImage = req.file.originalname;
    next();
  },
  validate(createSupportValidation),
  createSupport
);
router.get("/support", verifyJWT, getSupports);
router.get(
  "/support/:id",
  verifyJWT,
  validate(getSupportValidation),
  getSupportById
);
router.put(
  "/support/:id",
  verifyJWT,
  validate(updateSupportValidation),
  updateSupport
);
router.delete(
  "/support/:id",
  verifyJWT,
  validate(deleteSupportValidation),
  deleteSupport
);

// Contact us
router.post("/contact-us", validate(createContactValidation), createContact);

// Return orders
router.get("/products-by-return-orders", getOrderProductsGroupedBySeries);

// Return cart
router.get("/return-cart", verifyJWT, getCartReturn);
router.post("/return-cart/add", verifyJWT, addToCartReturn);
router.delete(
  "/return-cart/remove/:productId",
  verifyJWT,
  removeFromCartReturn
);

// Return orders
router.get("/return-orders", verifyJWT, getReturnOrders);
router.get("/return-orders/:orderId", verifyJWT, getReturnOrderbyId);
router.post(
  "/return-orders/create",
  verifyJWT,
  upload.single("issueImage"),
  (req, res, next) => {
    if (req.file) req.body.issueImage = req.file.originalname;
    next();
  },
  createReturnOrder
);
router.post("/return/cancel", verifyJWT, cancelReturnOrderController);

// Chat
router.get("/chat", verifyJWT, getChats);
router.post("/chat/send-message", verifyJWT, sendMessage);
router.post(
  "/chat/send-attachment",
  verifyJWT,
  upload.single("attachment"),
  (req, res, next) => {
    if (req.file) req.body.attachment = req.file.originalname;
    next();
  },
  sendAttachment
);

module.exports = router;
