import mongoose, { Schema } from 'mongoose';
import { IUserMethods, IUserModal, UserModel } from '../types/IUser';
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema: Schema<IUserModal, UserModel, IUserMethods> = new Schema({
  userName: {
    type: String,
    required: false,
    unique: true,
  },
  logginId: {
    type: String,
    required: false,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  profileImage: {
    type: String,
    required: false,
  },
  businessName: {
    type: String,
    required: false,
  },
  gstNumber: {
    type: String,
    required: false,
  },
  role: {
    type: String,
    require: true,
    enum: ["admin", "user", 'sale_admin', "sale_member"]
  },
  password: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: String
  }
}, {
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
