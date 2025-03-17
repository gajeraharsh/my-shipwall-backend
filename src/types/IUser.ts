// /server/models/IUser.ts
import { Types } from 'mongoose';
import { Document, Model } from 'mongoose';

export interface IUserModal extends Document {
  _id: Types.ObjectId; // or string if needed as a string
  userName?: string;         // Optional userName
  logginId?: string;         // Optional logginId
  email: string;             // Email is required and unique
  phone: string;             // Phone is required and unique
  altContactNumber: string;
  gender: string;
  lenguage: string;
  salary: string;
  note: string
  profileImage?: string;     // Optional profile image
  fullName?: string;         // Optional fullName
  businessName?: string;     // Optional business name
  gstNumber?: string;        // Optional GST number
  role: 'admin' | 'user' | 'sale_admin' | 'sale_member';  // Enum for role
  password: string;          // Password is required
  refreshToken: string;      // Refresh token for authentication
  businessType?: string;     // Optional business type
  panNumber?: string;        // Optional PAN number
  billingAddress: {
    line1: string;
    line2?: string;
    pincode: string;
    state: string;
    city: string;
    country: string;
    landmark: string;
  };
  deliveryAddress: {
    line1: string;
    line2?: string;
    pincode: string;
    state: string;
    city: string;
    country: string;
    location: string;
    landmark: string;
  };
  currentAddress: {
    street: string;
    state?: string;
    city: string;
    country: string;
    pinecode: string;
  };
  permenentAddress: {
    street: string;
    state?: string;
    city: string;
    country: string;
    pinecode: string;
  };
  documents: {
    profilePhoto?: string; // URL or file path
    businessFrontPremisesPhoto?: string; // URL or file path
    businessStockWithOwnerPhoto?: string; // URL or file path
    ownerPhoto?: string; // URL or file path
    visitingCardPhoto?: string; // URL or file path
    gstCertificate?: string; // URL or file path
    businessAddressProof?: string; // URL or file path
  };
  docStatus: 'Verified' | 'UnVerified'; // Enum for doc verification status
  status: 'Verified' | 'UnVerified'; // Enum for doc verification status
  sameAsBilling: boolean;
  sameAsCurrent: boolean;

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
  paginate: any
}


export type UserModel = Model<IUserModal, {}, IUserMethods>;
export type UserDocument = Document & IUserModal & IUserMethods;
