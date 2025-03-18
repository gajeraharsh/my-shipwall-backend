import { Request, Response } from 'express';
import User from '../../models/User';
import { userValidationSchema } from '../../validations/user';
import { asyncHandler } from '../../utils/asyncHandler';
import ApiResponse from '../../utils/apiResponse';
import { IUserBody } from '../../types/IUser';
import ApiError from '../../utils/apiError';
import { uploadFileToS3 } from '../../services/fileUploads3Service';


export const createUser = asyncHandler(async (req: Request<IUserBody>, res: Response) => {
    const { error, value } = userValidationSchema.validate(req?.body, { abortEarly: false });

    if (error) {
        console.log(error.details);

        throw new ApiError(400, "Validation failed.", error?.details);
    }

    const existedUser = await User.findOne({
        userName: req?.body?.userName,
        role: req?.body?.role,
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


export const getUsers = asyncHandler(async (req: Request, res: Response) => {
    const {
        search,
        page,
        limit,
        startDate = '',
        endDate = '',
        days,
        state,
        city
    } = req.query;

    let where: any = {
        role: 'sale_member'
    };

    // Search by userName (case-insensitive)
    if (search) {
        where.userName = { $regex: search, $options: 'i' };
        where.fullName = { $regex: search, $options: 'i' };
        where.email = { $regex: search, $options: 'i' };
        where.phone = { $regex: search, $options: 'i' };
    }

    // Filter by date range
    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.$gte = new Date(startDate as string);
        if (endDate) where.createdAt.$lte = new Date(endDate as string);
    }

    // Filter by predefined day ranges (Last 7 days, Last 30 days)
    if (days) {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - Number(days));
        where.createdAt = { $gte: daysAgo };
    }

    // Filter by state
    if (state) {
        where["currentAddress.state"] = state;
    }

    // Filter by city
    if (city) {
        where["currentAddress.city"] = city;
    }


    // @ts-ignore
    const users = await User.paginate(where, {
        page,
        limit,
        populate: [
            { path: 'currentAddress.state', select: '_id name' },
            { path: 'currentAddress.city', select: '_id name' },
            { path: 'permenentAddress.state', select: '_id name' },
            { path: 'permenentAddress.city', select: '_id name' },
        ],
    });

    return res.status(200).json(new ApiResponse(200, { customerList: users }, 'Customers retrieved successfully'));
});


export const getUserById = asyncHandler(async (req: Request<any>, res: Response) => {

    const user = await User.findById(req?.params.id)
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
        });

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

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    let profileImageUrl: string | null = null;

    // Handle file uploads
    if (files?.profileImage?.[0]) {
        profileImageUrl = await uploadFileToS3(files.profileImage[0], req.user?._id);
    }

    const updateData: any = {
        ...req?.body
    };

    if (profileImageUrl) updateData.profileImage = profileImageUrl;


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






