const mongoose = require("mongoose");
const { Schema } = mongoose;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const paginate = require("./plugins/paginate");
const incrementId = require("./plugins/incrementId");
const crypto = require("crypto"); // For generating OTP
const nodemailer = require("nodemailer");

const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: false,
    },
    fullName: {
      type: String,
    },
    logginId: {
      type: String,
      required: false,
      unique: false,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    altContactNumber: {
      type: String,
    },
    gender: {
      type: String,
    },
    dob: {
      type: Date,
      required: false,
    },
    lenguage: {
      type: String,
    },
    salary: {
      type: String,
    },
    profileImage: {
      type: String,
      required: false,
    },
    note: {
      type: String,
    },
    businessName: {
      type: String,
      required: false,
    },
    businessType: {
      type: String,
      required: false,
    },
    gstNumber: {
      type: String,
      required: false,
    },
    panNumber: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      required: true,
      enum: [
        "admin",
        "admin_support",
        "admin_rejection",
        "user",
        "super_sale_admin",
        "sale_admin",
        "sale_member",
      ],
    },
    isSuperSaleAdmin: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
    },
    otp: {
      type: String,
      required: false,
    },
    otpExpiresAt: {
      type: Date,
      required: false,
    },
    otpVerified: {
      type: Boolean,
      default: false,
    },
    billingAddress: {
      line1: { type: String, required: false },
      line2: { type: String },
      pincode: { type: String, required: false },
      state: { type: mongoose.Types.ObjectId, ref: "State", default: null },
      city: { type: mongoose.Types.ObjectId, ref: "City", default: null },
      country: { type: String, required: false },
      landmark: { type: String, required: false },
    },
    deliveryAddress: {
      line1: { type: String, required: false },
      line2: { type: String },
      pincode: { type: String, required: false },
      state: { type: mongoose.Types.ObjectId, ref: "State", default: null },
      city: { type: mongoose.Types.ObjectId, ref: "City", default: null },
      country: { type: String, required: false },
      location: { type: String, required: false },
      landmark: { type: String, required: false },
    },
    currentAddress: {
      street: { type: String, required: false },
      state: { type: mongoose.Types.ObjectId, ref: "State", default: null },
      city: { type: mongoose.Types.ObjectId, ref: "City", default: null },
      country: { type: String, required: false },
      pincode: { type: String, required: false },
    },
    permenentAddress: {
      street: { type: String, required: false },
      state: { type: mongoose.Types.ObjectId, ref: "State", default: null },
      city: { type: mongoose.Types.ObjectId, ref: "City", default: null },
      country: { type: String, required: false },
      pincode: { type: String, required: false },
    },
    documents: {
      profilePhoto: { type: String },
      businessFrontPremisesPhoto: { type: String },
      businessStockWithOwnerPhoto: { type: String },
      ownerPhoto: { type: String },
      visitingCardPhoto: { type: String },
      gstCertificate: { type: String },
      businessAddressProof: { type: String },
    },
    docStatus: {
      type: String,
      enum: ["Verified", "UnVerified"],
      default: "UnVerified",
    },
    status: {
      type: String,
      enum: ["Verified", "UnVerified"],
      default: "UnVerified",
    },
    sap_customer_code: {
      type: String,
    },
    sameAsBilling: {
      type: Boolean,
      default: false,
    },
    sameAsCurrent: {
      type: Boolean,
      default: false,
    },
    isBlock: {
      type: Boolean,
      required: true,
      default: false,
    },
    salePerson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    salePersonDocument: {
      type: String,
    },
    salePersonDocType: {
      type: String,
    },
    potential: {
      type: Number,
      required: false,
      default: 0,
    },
    adminRole: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      default: null,
    },
    balance: {
      type: Number,
      default: 0,
    },
    rewards: {
      type: Number,
      default: 0,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordTokenExpiresAt: {
      type: Date,
    },
    typeDocument: {
      type: String,
    },
    saleUserDocument: {
      type: String,
    },
    saleUserStatus: {
      type: String,
      default: "Pending",
      enum: ["Active", "Pending", "Rejected", "Blocked"],
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  // this.password = await bcrypt.hash(this.password, 10)
  next();
});

userSchema.methods.generatePasswordResetToken = async function (
  isSeller = false
) {
  // Generate a random token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Set token expiration time (e.g., 1 hour)
  this.resetPasswordTokenExpiresAt = Date.now() + 3600000; // 1 hour

  // Store the token
  this.resetPasswordToken = resetToken;
  await this.save({
    validateBeforeSave: false,
  });

  // Send password reset email
  await this.sendPasswordResetEmail(resetToken, isSeller);
};

userSchema.methods.sendPasswordResetEmail = async function (token, isSeller) {
  const resetUrl = `${
    isSeller ? process.env.SALE_FRONTEND_URL : process.env.FRONTEND_URL
  }/reset-password/${token}`;

  // Setup email transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Compose email
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: this.email,
    subject: "Password Reset Request",
    text: `Click the following link to reset your password: ${resetUrl}`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error("Error sending password reset email: " + error.message);
  }
};

// Generate OTP and send it via email
userSchema.methods.generateAndSendOtp = async function () {
  const otp = Array.from({ length: 5 }, () => crypto.randomInt(0, 10)).join("");

  // Store OTP and expiration time (e.g., 5 minutes)
  this.otp = otp;
  this.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
  this.otpVerified = false;
  await this.save();

  // Setup email transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Compose email
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: this.email,
    subject: "Your OTP for Login",
    text: `Your OTP for login is: ${otp}. It is valid for 5 minutes.`,
  };

  // Send OTP email
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error("Error sending OTP email: " + error.message);
  }
};

// Verify OTP provided by the user
userSchema.methods.verifyOtp = async function (otp) {
  // Check if OTP is expired
  if (new Date() > this.otpExpiresAt) {
    throw new Error("OTP has expired");
  }

  // Check if OTP is correct
  if (this.otp !== otp) {
    throw new Error("Invalid OTP");
  }

  // Mark OTP as verified
  this.otpVerified = true;
  await this.save();
};

userSchema.methods.isPasswordCorrect = async function (password) {
  // return await bcrypt.compare(password, this.password)
  return this.password === password;
};

userSchema.methods.generateAccessToken = function () {
  if (!process.env.ACCESS_TOKEN_SECRET) {
    throw new Error("ACCESS_TOKEN_SECRET is not defined");
  }

  // Check if ACCESS_TOKEN_EXPIRY is defined
  if (!process.env.ACCESS_TOKEN_EXPIRY) {
    throw new Error("ACCESS_TOKEN_EXPIRY is not defined");
  }

  // @ts-ignore
  return jwt.sign(
    {
      userName: this.userName,
      phone: this.phone,
      email: this.email,
      _id: this._id,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new Error("REFRESH_TOKEN_SECRET is not defined");
  }

  // Check if ACCESS_TOKEN_EXPIRY is defined
  if (!process.env.REFRESH_TOKEN_EXPIRY) {
    throw new Error("REFRESH_TOKEN_EXPIRY is not defined");
  }

  // @ts-ignore
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

userSchema.plugin(paginate);
userSchema.plugin(incrementId, "QVAPCU");

const User = mongoose.model("User", userSchema);

module.exports = User;
