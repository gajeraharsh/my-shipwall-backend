// /server/models/IUser.ts
import { Types } from 'mongoose';
import { Document, Model } from 'mongoose';

export interface IUserModal extends Document {
  _id: Types.ObjectId; // or string if needed as a string
  userName?: string;        // Optional userName
  logginId?: string;        // Optional logginId
  email: string;            // Email is required and unique
  phone: string;            // Phone is required and unique
  profileImage?: string;    // Optional profile image
  fullName?: string;        // Optional fullName
  businessName?: string;    // Optional business name
  gstNumber?: string;       // Optional GST number
  role: 'admin' | 'user' | 'sale_admin' | 'sale_member';  // Enum for role
  password: string;         // Password is required
  refreshToken: string;
}



export interface IUserBody {
  userName?: string;
  logginId?: string;
  email: string;
  phone: string;
  profileImage?: string;
  businessName?: string;
  gstNumber?: string;
  role: 'admin' | 'user' | 'sale_admin' | 'sale_member';
  password: string;
  confirmPassword: string,
  fullName?: string;        // Optional fullName
}


export interface IUserMethods {
  isPasswordCorrect: (password: string) => Promise<boolean>;
  generateAccessToken: () => string;
  generateRefreshToken: () => string;
}


export type UserModel = Model<IUserModal, {}, IUserMethods>;
export type UserDocument = Document & IUserModal & IUserMethods;
