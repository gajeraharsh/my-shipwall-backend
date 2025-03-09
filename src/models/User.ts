import mongoose, { Schema } from 'mongoose';
import { IUserMethods, IUserModal, UserModel } from '../types/IUser';
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema: Schema<IUserModal, UserModel, IUserMethods> = new Schema(
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
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // Ensure email is unique
    },
    phone: {
      type: String,
      required: true,
      unique: true, // Ensure phone is unique
    },
    profileImage: {
      type: String,
      required: false,
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
      enum: ['admin', 'user', 'sale_admin', 'sale_member'],
    },
    password: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
    },
    billingAddress: {
      line1: { type: String, required: false },
      line2: { type: String },
      pincode: { type: String, required: true },
      state: { type: String, required: false },
      city: { type: String, required: false },
      country: { type: String, required: false },
      landmark: { type: String, required: false },
    },
    deliveryAddress: {
      line1: { type: String, required: false },
      line2: { type: String },
      pincode: { type: String, required: false },
      state: { type: String, required: false },
      city: { type: String, required: false },
      country: { type: String, required: false },
      location: { type: String, required: false },
      landmark: { type: String, required: false },
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
      enum: ['Verified', 'Pending', 'Rejected'],
      default: 'Pending',
    },
    sameAsBilling: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);


userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10)
  next()
})

userSchema.methods.isPasswordCorrect = async function (password: string) {
  return await bcrypt.compare(password, this.password)
}


userSchema.methods.generateAccessToken = function () {

  if (!process.env.ACCESS_TOKEN_SECRET) {
    throw new Error('ACCESS_TOKEN_SECRET is not defined');
  }

  // Check if ACCESS_TOKEN_EXPIRY is defined
  if (!process.env.ACCESS_TOKEN_EXPIRY) {
    throw new Error('ACCESS_TOKEN_EXPIRY is not defined');
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
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}

userSchema.methods.generateRefreshToken = function () {

  if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new Error('REFRESH_TOKEN_SECRET is not defined');
  }

  // Check if ACCESS_TOKEN_EXPIRY is defined
  if (!process.env.REFRESH_TOKEN_EXPIRY) {
    throw new Error('REFRESH_TOKEN_EXPIRY is not defined');
  }

  // @ts-ignore
  return jwt.sign(
    {
      _id: this._id,

    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}

const User = mongoose.model<IUserModal>('User', userSchema);

export default User;
