import mongoose, { Schema } from 'mongoose';
import { IUserMethods, IUserModal, UserModel } from '../types/IUser';
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import paginate from './plugins/paginate';
import incrementId from './plugins/incrementId';

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
      type: String
    },
    lenguage: {
      type: String
    },
    salary: {
      type: String
    },
    profileImage: {
      type: String,
      required: false,
    },
    note: {
      type: String
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
      enum: ['admin', 'user', 'super_sale_admin', 'sale_admin', 'sale_member'],
    },
    isSuperSaleAdmin: {
      type: Boolean,
      default: false
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
      enum: ['Verified', 'UnVerified'],
      default: 'UnVerified',
    },
    status: {
      type: String,
      enum: ['Verified', 'UnVerified'],
      default: 'UnVerified',
    },
    sap_customer_code: {
      type: String
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
      default: false
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
      default: 0
    },
    adminRole: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      default: null,
    },
    balance: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
  }
);


userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  // this.password = await bcrypt.hash(this.password, 10)
  next()
})

userSchema.methods.isPasswordCorrect = async function (password: string) {
  // return await bcrypt.compare(password, this.password)
  return this.password === password
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

userSchema.plugin(paginate);
userSchema.plugin(incrementId, "QVAPCU");


const User = mongoose.model<IUserModal>('User', userSchema);

export default User;
