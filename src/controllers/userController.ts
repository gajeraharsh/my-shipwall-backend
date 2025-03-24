import { NextFunction, Request, Response } from 'express';
import User from '../models/User';
import { userValidationSchema, userValidationLoginSchema, userChangePasswordSchema } from '../validations/user';
import { asyncHandler } from '../utils/asyncHandler';
import ApiResponse from '../utils/apiResponse';
import { IUserBody, UserDocument } from '../types/IUser';
import ApiError from '../utils/apiError';
import { generateAccessAndRefereshTokens } from '../handlers/user';
import { uploadFileToS3 } from '../services/fileUploads3Service';
import mongoose from 'mongoose';


export const createUser = asyncHandler(async (req: Request<IUserBody>, res: Response) => {
  const { error, value } = userValidationSchema.validate(req?.body, { abortEarly: false });

  if (error) {
    console.log(error.details);

    throw new ApiError(400, "Validation failed.", error?.details);
  }

  const { phone, userName, logginId, role } = value

  const query: any[] = [];

  if (userName) query.push({ userName, role });
  if (phone) query.push({ phone, role });
  if (logginId) query.push({ logginId, role });


  const existedUser = await User.findOne({
    $or: query
  })

  if (existedUser) {
    throw new ApiError(409, "User already exist.")
  }


  const user = await User.create(value)
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user")
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered Successfully")
  )

});


export const changePassword = asyncHandler(async (req: Request<IUserBody>, res: Response) => {
  const { error, value } = userChangePasswordSchema.validate(req?.body, { abortEarly: false });

  if (error) {
    throw new ApiError(400, "Validation failed.", error?.details);
  }

  const { currentPassword, newPassword, confirmPassword } = value;

  const user = req.user

  const existingUser = await User.findById(user?._id) as UserDocument

  const isPasswordValid = await existingUser.isPasswordCorrect(currentPassword)

  if (!isPasswordValid) {
    throw new ApiError(500, "Invalid user current password.")
  }

  existingUser.password = confirmPassword;

  await existingUser.save({ validateBeforeSave: false });


  return res.status(201).json(
    new ApiResponse(200, user, "User password change successfully.")
  )

});



export const loginUser = asyncHandler(async (req, res) => {

  const { error, value } = userValidationLoginSchema.validate(req?.body, { abortEarly: false });


  if (error) {
    console.log(error.details);

    throw new ApiError(400, "Validation failed.", error?.details);
  }


  const { phone, userName, logginId, password, role } = value

  const query: any[] = [];

  if (userName) query.push({ userName, role });
  if (phone) query.push({ phone, role });
  if (logginId) query.push({ logginId, role });


  const user = await User.findOne({
    $or: query
  }) as UserDocument

  if (!user) {
    throw new ApiError(404, "User does not exist")
  }

  console.log(query, 'query')


  const isPasswordValid = await user.isPasswordCorrect(password)

  if (!isPasswordValid) {
    throw new ApiError(500, "Invalid user credentials")
  }



  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser, accessToken, refreshToken
        },
        "User logged In Successfully"
      )
    )


})


interface CustomRequest extends Request {
  user?: { _id: string }; // Ensure `user` object contains the _id property (as per your previous code)
}

export const logoutUser = asyncHandler(async (req: CustomRequest, res: Response, next: NextFunction) => {
  if (!req.user || !req.user._id) {
    return res.status(400).json(new ApiResponse(400, {}, "User not logged in"));
  }

  // Remove refreshToken field from the user's document
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // This removes the field from the document
      },
    },
    {
      new: true,
    }
  );

  // Clear cookies
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Ensure this is set to true in production
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});



export const getUsers = asyncHandler(async (req: Request, res: Response) => {

  const {
    search,
    page = 1,
    limit = 10,
    startDate = '',
    endDate = '',
    days,
    state,
    city,
    salePerson
  } = req.query;

  const andConditions: any[] = [{ role: 'user' }];

  // Search across multiple fields
  if (search) {
    const searchOrConditions = [
      { userName: { $regex: search, $options: 'i' } },
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
    andConditions.push({ $or: searchOrConditions });
  }

  // isCustomerPool = true => user has no salePerson

  // Date range filter
  if (startDate || endDate) {
    const createdAt: any = {};
    if (startDate) createdAt.$gte = new Date(startDate as string);
    if (endDate) createdAt.$lte = new Date(endDate as string);
    andConditions.push({ createdAt });
  }

  // Filter by "last X days"
  if (days) {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - Number(days));
    andConditions.push({ createdAt: { $gte: daysAgo } });
  }

  if (salePerson) {
    andConditions.push({
      salePerson: salePerson
    })
  }

  // State filter
  if (state) {
    andConditions.push({ 'currentAddress.state': state });
  }

  // City filter
  if (city) {
    andConditions.push({ 'currentAddress.city': city });
  }

  // Final query object
  const where = andConditions.length > 1 ? { $and: andConditions } : andConditions[0];

  // @ts-ignore
  const users = await User.paginate(where, {
    page,
    limit,
    populate: [
      { path: 'billingAddress.state', select: '_id name' },
      { path: 'billingAddress.city', select: '_id name' },],

  });

  return res.status(200).json(new ApiResponse(200, { customerList: users }, 'customers retrieved successfully'));
})

export const getUsersV2 = asyncHandler(async (req: Request, res: Response) => {
  const {
    search,
    page = 1,
    limit = 10,
    startDate = '',
    endDate = '',
    days,
    state,
    city,
    salePerson
  } = req.query;

  const matchStage: any = {
    role: 'user',
  };

  // Search filter
  if (search) {
    matchStage.$or = [
      { userName: { $regex: search, $options: 'i' } },
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }

  // CreatedAt date filter
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate as string);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate as string);
  }

  // "Last X days" filter
  if (days) {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - Number(days));
    matchStage.createdAt = { ...(matchStage.createdAt || {}), $gte: daysAgo };
  }

  if (salePerson) {
    // @ts-ignore
    matchStage.salePerson = new mongoose.Types.ObjectId(salePerson);
  }

  if (state) {
    matchStage['currentAddress.state'] = state;
  }

  if (city) {
    matchStage['currentAddress.city'] = city;
  }

  const skip = (Number(page) - 1) * Number(limit);

  console.log(matchStage)

  const usersWithOrders = await User.aggregate([
    { $match: matchStage },

    // Join orders
    {
      $lookup: {
        from: 'orders',
        localField: '_id',
        foreignField: 'user',
        as: 'orders'
      }
    },

    // Calculate totalSpent and orderCount
    {
      $addFields: {
        totalSpent: { $sum: '$orders.finalTotal' },
        orderCount: { $size: '$orders' }
      }
    },

    // Optional: populate billingAddress.state and billingAddress.city (needs $lookup if needed)

    // Sort by creation (or customize as needed)
    { $sort: { createdAt: -1 } },

    // Pagination
    { $skip: skip },
    { $limit: Number(limit) }
  ]);

  // Count total for pagination
  const totalCount = await User.countDocuments(matchStage);

  return res.status(200).json(new ApiResponse(200, {
    customerList: {
      docs: usersWithOrders,
      page: Number(page),
      limit: Number(limit),
      totalDocs: totalCount,
      totalPages: Math.ceil(totalCount / Number(limit)),
    }
  }, 'customers retrieved successfully'));
});



export const getUser = asyncHandler(async (req: Request<IUserBody>, res: Response) => {

  const user: any = await User.findById(req.user._id)
    .populate({
      path: 'billingAddress.city',
      model: 'City'
    })
    .populate({
      path: 'billingAddress.state',
      model: 'State'
    })
    .populate({
      path: 'deliveryAddress.city',
      model: 'City'
    })
    .populate({
      path: 'deliveryAddress.state',
      model: 'State'
    })
    .populate({
      path: 'adminRole',
      select: 'name  permissions',
      populate: {
        path: 'permissions.page', // Assuming the reference to Page is in `permissions.page`
        select: 'pageGroup pageName pageLink' // You can adjust the fields you want to select from the Page model
      }

    })


  if (!user) {
    return res.status(404).json(new ApiResponse(404, {}, "User not found"));
  }
  return res.status(200).json(
    new ApiResponse(200, { user: user }, "User retrivied successfully")
  )
});



export const updateUser = asyncHandler(async (req: Request<IUserBody>, res: Response) => {

  const { userId }: any = req.params;

  const existingUser = await User.findById(userId);

  if (!existingUser) {
    throw new ApiError(404, "User not found");
  }

  const {
    userName,
    fullName,
    logginId,
    email,
    phone,
    businessName,
    businessType,
    gstNumber,
    role,
    password,
    panNumber,
    billingAddress,
    deliveryAddress,
    sameAsBilling,
  } = req.body;

  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

  let profileImageUrl: string | null = null;
  let businessFrontPremisesPhotoUrl: string | null = null;
  let businessStockWithOwnerPhotoUrl: string | null = null;
  let ownerPhotoUrl: string | null = null;
  let visitingCardPhotoUrl: string | null = null;
  let gstCertificateUrl: string | null = null;
  let businessAddressProofUrl: string | null = null;

  // Handle file uploads
  if (files?.profileImage?.[0]) {
    profileImageUrl = await uploadFileToS3(files.profileImage[0], req.user?._id);
  }

  if (files?.businessFrontPremisesPhoto?.[0]) {
    businessFrontPremisesPhotoUrl = await uploadFileToS3(files.businessFrontPremisesPhoto[0], req.user?._id);
  }

  if (files?.businessStockWithOwnerPhoto?.[0]) {
    businessStockWithOwnerPhotoUrl = await uploadFileToS3(files.businessStockWithOwnerPhoto[0], req.user?._id);
  }

  if (files?.ownerPhoto?.[0]) {
    ownerPhotoUrl = await uploadFileToS3(files.ownerPhoto[0], req.user?._id);
  }

  if (files?.visitingCardPhoto?.[0]) {
    visitingCardPhotoUrl = await uploadFileToS3(files.visitingCardPhoto[0], req.user?._id);
  }

  if (files?.gstCertificate?.[0]) {
    gstCertificateUrl = await uploadFileToS3(files.gstCertificate[0], req.user?._id);
  }

  if (files?.businessAddressProof?.[0]) {
    businessAddressProofUrl = await uploadFileToS3(files.businessAddressProof[0], req.user?._id);
  }

  const updateData: any = {};

  if (userName) updateData.userName = userName;
  if (fullName) updateData.fullName = fullName;
  if (logginId) updateData.logginId = logginId;
  if (email) updateData.email = email;
  if (phone) updateData.phone = phone;
  if (profileImageUrl) updateData.profileImage = profileImageUrl;
  if (businessName) updateData.businessName = businessName;
  if (businessType) updateData.businessType = businessType;
  updateData.gstNumber = gstNumber;
  if (role) updateData.role = role;
  if (password) updateData.password = password;
  if (panNumber) updateData.panNumber = panNumber;
  if (sameAsBilling) updateData.sameAsBilling = sameAsBilling;

  if (billingAddress) updateData.billingAddress = billingAddress;

  if (!updateData.documents) {
    updateData.documents = {};
  }

  updateData.documents.businessFrontPremisesPhoto = businessFrontPremisesPhotoUrl || existingUser.documents?.businessFrontPremisesPhoto;
  updateData.documents.businessStockWithOwnerPhoto = businessStockWithOwnerPhotoUrl || existingUser.documents?.businessStockWithOwnerPhoto;
  updateData.documents.ownerPhoto = ownerPhotoUrl || existingUser.documents?.ownerPhoto;
  updateData.documents.visitingCardPhoto = visitingCardPhotoUrl || existingUser.documents?.visitingCardPhoto;
  updateData.documents.gstCertificate = gstCertificateUrl || existingUser.documents?.gstCertificate;
  updateData.documents.businessAddressProof = businessAddressProofUrl || existingUser.documents?.businessAddressProof;


  let parsedDeliveryAddress: any = null;
  if (typeof deliveryAddress === "string") {
    try {
      parsedDeliveryAddress = JSON.parse(deliveryAddress);
    } catch (error) {
      throw new ApiError(400, "Invalid delivery address format");
    }
  } else {
    parsedDeliveryAddress = deliveryAddress;
  }

  let parsedBillingAddress: any = null;
  if (typeof billingAddress === "string") {
    try {
      parsedBillingAddress = JSON.parse(billingAddress);
    } catch (error) {
      throw new ApiError(400, "Invalid billing address format");
    }
  } else {
    parsedBillingAddress = billingAddress;
  }



  if (parsedBillingAddress) {
    updateData.billingAddress = {
      line1: parsedBillingAddress.line1,
      line2: parsedBillingAddress.line2,
      pincode: parsedBillingAddress.pincode,
      state: parsedBillingAddress.state,
      city: parsedBillingAddress.city,
      country: parsedBillingAddress.country,
      landmark: parsedBillingAddress.landmark,
    };
  }

  if (sameAsBilling && parsedBillingAddress) {
    updateData.deliveryAddress = { ...updateData.billingAddress };
  } else if (parsedDeliveryAddress) {
    updateData.deliveryAddress = {
      line1: parsedDeliveryAddress.line1,
      line2: parsedDeliveryAddress.line2,
      pincode: parsedDeliveryAddress.pincode,
      state: parsedDeliveryAddress.state,
      city: parsedDeliveryAddress.city,
      country: parsedDeliveryAddress.country,
      landmark: parsedDeliveryAddress.landmark,
    };
  }


  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (!updatedUser) {
    throw new ApiError(500, "Something went wrong while updating the user");
  }

  const userWithoutSensitiveInfo = await User.findById(updatedUser._id).select("-password -refreshToken");

  return res.status(200).json(
    new ApiResponse(200, userWithoutSensitiveInfo, "User updated successfully")
  );

});



export const deleteUserById = asyncHandler(async (req: Request<any>, res: Response) => {

  try {
    const id = req?.params.id

    if (!id) {
      throw new ApiError(400, "Id is required");
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) throw new ApiError(404, 'User not found');
    return res.status(200).json(
      new ApiResponse(200, user, "User deleted successfully")
    );
  } catch (error: any) {
    throw new ApiError(500, error.message || 'deleteUserById  failed');

  }

});


export const getCustomerById = asyncHandler(async (req: Request<any>, res: Response) => {
  const user: any = await User.findById(req?.params.id)
    .populate({
      path: 'billingAddress.city',
      model: 'City'
    })
    .populate({
      path: 'billingAddress.state',
      model: 'State'
    })
    .populate({
      path: 'deliveryAddress.city',
      model: 'City'
    })
    .populate({
      path: 'deliveryAddress.state',
      model: 'State'
    })
    .populate({
      path: 'currentAddress.city',
      model: 'City'
    })
    .populate({
      path: 'currentAddress.state',
      model: 'State'
    })
    .populate({
      path: 'permenentAddress.city',
      model: 'City'
    })
    .populate({
      path: 'permenentAddress.state',
      model: 'State'
    })
    .populate({
      path: "salePerson",
      select: 'fullName _id',
      model: 'User'
    })


  if (!user) {
    return res.status(404).json(new ApiResponse(404, {}, "User not found"));
  }


  return res.status(200).json(
    new ApiResponse(200, { user: user }, "User retrieved successfully")
  );
});


export const updateVerification = asyncHandler(async (req: Request<IUserBody>, res: Response) => {

  const { userId }: any = req.params;

  const existingUser = await User.findById(userId);

  if (!existingUser) {
    throw new ApiError(404, "User not found");
  }

  const {
    status,
    docStatus,
    sap_customer_code
  } = req.body;


  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        status,
        docStatus,
        sap_customer_code
      }
    },
    { new: true, runValidators: true }
  );

  if (!updatedUser) {
    throw new ApiError(500, "Something went wrong while updating the user");
  }

  const userWithoutSensitiveInfo = await User.findById(updatedUser._id).select("-password -refreshToken");

  return res.status(200).json(
    new ApiResponse(200, userWithoutSensitiveInfo, "User updated successfully")
  );

});
