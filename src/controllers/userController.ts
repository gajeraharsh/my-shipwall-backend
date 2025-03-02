import { NextFunction, Request, Response } from 'express';
import User from '../models/User';
import { userValidationSchema, userValidationLoginSchema } from '../validations/user';
import { asyncHandler } from '../utils/asyncHandler';
import ApiResponse from '../utils/apiResponse';
import { IUserBody, UserDocument } from '../types/IUser';
import ApiError from '../utils/apiError';
import { generateAccessAndRefereshTokens } from '../handlers/user';


export const createUser = asyncHandler(async (req: Request<IUserBody>, res: Response) => {
  const { error, value } = userValidationSchema.validate(req?.body, { abortEarly: false });

  if (error) {
    console.log(error.details);

    throw new ApiError(400, "Validation failed.", error?.details);
  }

  const existedUser = await User.findOne({
    userName: req?.body?.userName,
    phone: req?.body?.phone,
    role: req?.body?.role,
    logginId: req?.body?.logginId
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


export const loginUser = asyncHandler(async (req, res) => {

  const { error, value } = userValidationLoginSchema.validate(req?.body, { abortEarly: false });


  if (error) {
    console.log(error.details);

    throw new ApiError(400, "Validation failed.", error?.details);
  }


  const { phone, userName, logginId, password, role } = value

  const query: any[] = [];

  if (userName) query.push({ userName });
  if (phone) query.push({ phone });
  if (logginId) query.push({ logginId });


  const user = await User.findOne({
    $or: query
  }) as UserDocument

  if (!user) {
    throw new ApiError(404, "User does not exist")
  }


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



export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

  
export const getUser = asyncHandler(async (req: Request<IUserBody>, res: Response) => {
  return res.status(200).json(
    new ApiResponse(200, {user:req.user}, "User retrivied successfully")
  )
});