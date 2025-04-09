const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const brandRoutes = require("./routes/brandRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const seriesRoutes = require("./routes/seriesRoutes");
const productRoutes = require("./routes/productRoutes");
const fileUploadsRoutes = require("./routes/fileUploads3Routes");
const bannerRoutes = require("./routes/bannerRouttes");
const colorMasterRoutes = require("./routes/colorMasterRoutes");
const hsnCodeRoutes = require("./routes/hsnCodeRoutes");
const generalSettingRoutes = require("./routes/generalSettingRoutes");
const supportRoutes = require("./routes/supportRoutes");
const contactusRoute = require("./routes/contactusRoute");
const rejectionOrderRoutes = require("./routes/rejectionOrderRoutes");
const orderRoute = require("./routes/orderRoute");
const chatRoutes = require("./routes/chatRoutes");

const appSettingRoutes = require("./routes/seller/AppSettingRoutes");
const roleRoute = require("./routes/seller/RoleRoute");
const saleUserRoute = require("./routes/seller/saleUserRoutes");
const customerRoute = require("./routes/seller/customerRoute");
const adminUserRoute = require("./routes/seller/AdminUserRotue");
const storeVisitRoutes = require("./routes/storeVisitRotues");
const returnOrderRoutes = require("./routes/returnOrderRoutes");

const webRoutes = require("./routes/webRoutes");

const ApiError = require("./utils/apiError");
const cookieParser = require("cookie-parser");
const {
  getDashboardMetrics,
} = require("./controllers/adminDashboardController");
const { verifyJWT } = require("./middlewares/auth.middleware");

dotenv.config(); // Load environment variables from .env file

const app = express();

// Updated CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
  })
);

app.use(express.json());
app.use(cookieParser());

// MongoDB connection
connectDB();


// Routes
app.use("/api/users", userRoutes);
app.use("/api/brand", brandRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/series", seriesRoutes);
app.use("/api/product", productRoutes);
app.use("/api/filesUpload", fileUploadsRoutes);
app.use("/api/banner", bannerRoutes);
app.use("/api/hsn-code", hsnCodeRoutes);
app.use("/api/color-master", colorMasterRoutes);
app.use("/api/general-setting", generalSettingRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/contact", contactusRoute);
app.use("/api/rejection-order", rejectionOrderRoutes);
app.use("/api/return-order", returnOrderRoutes);
app.use("/api/order", orderRoute);
app.use("/api/chat", chatRoutes);

app.use("/api/dashboard", verifyJWT, getDashboardMetrics);

app.use("/api/web", webRoutes);

app.use("/api/seller/setting", appSettingRoutes);
app.use("/api/seller/admin-role", roleRoute);
app.use("/api/seller/sale-member", saleUserRoute);
app.use("/api/seller/admin-users", adminUserRoute);
app.use("/api/seller/customers", customerRoute);
app.use("/api/seller/store-visit", storeVisitRoutes);

const errorHandler = (
  err, // Explicitly typing the error as ApiError
  req,
  res,
  next
) => {
  // Explicit return type
  console.log(err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      errorDetails: err.error, // Include the error details (custom property of ApiError)
    });
  }
  // Fallback to a generic error handler for any unhandled errors
  return res.status(500).json({
    status: "error",
    message: "An unexpected error occurred",
    err,
  });
};

// @ts-ignore
app.use(errorHandler);

module.exports = app;
