import { Request, Response } from 'express';
import User from '../../models/User';
import { asyncHandler } from '../../utils/asyncHandler';
import ApiResponse from '../../utils/apiResponse';
import { IUserBody } from '../../types/IUser';
import ApiError from '../../utils/apiError';
import { uploadFileToS3 } from '../../services/fileUploads3Service';
import Joi from 'joi';

const userValidationSchema = Joi.object<any>({
    userName: Joi.string().when('role', {
        is: Joi.valid('sale_admin', 'sale_member'),
        then: Joi.required().messages({
            'string.base': 'Username must be a string.',
            'any.required': 'Username is required for sale_admin or sale_member role.',
        }),
        otherwise: Joi.optional(),
    }),
    logginId: Joi.string().when('role', {
        is: Joi.valid('admin'),
        then: Joi.required().messages({
            'string.base': 'Login ID must be a string.',
            'any.required': 'Login ID is required for sale_admin, sale_member, or admin role.',
        }),
        otherwise: Joi.optional(),
    }),
    email: Joi.string().email().required().messages({
        'string.base': 'Email must be a string.',
        'string.email': 'Please provide a valid email address.',
        'any.required': 'Email is required.',
    }),
    phone: Joi.string().required().messages({
        'string.base': 'Phone number must be a string.',
        'any.required': 'Phone number is required.',
    }),

    profileImage: Joi.string().optional().messages({
        'string.base': 'Profile image must be a string.',
    }),

    role: Joi.string().valid('admin', 'user', 'sale_admin', 'sale_member').required().messages({
        'string.base': 'Role must be a string.',
        'any.required': 'Role is required.',
        'any.only': 'Role must be one of "admin", "user", "sale_admin", or "sale_member".',
    }),
    password: Joi.string().required().messages({
        'string.base': 'Password must be a string.',
        'any.required': 'Password is required.',
    }),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
        'string.base': 'Confirm Password must be a string.',
        'any.required': 'Confirm Password is required.',
        'any.only': 'Confirm Password must match the Password.',
    }),
    adminRole: Joi.any().required()
});


export const createAdminUser = asyncHandler(async (req: Request<IUserBody>, res: Response) => {
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
        throw new ApiError(409, "Admin user already exist.")
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    let profileImageUrl: string | null = null;

    // Handle file uploads
    if (files?.profileImage?.[0]) {
        profileImageUrl = await uploadFileToS3(files.profileImage[0], req.user?._id);
    }

    const input: any = {
        ...value
    };

    if (profileImageUrl) input.profileImage = profileImageUrl;



    const user = await User.create(input)
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "Admin user registered Successfully")
    )

});


export const getAdminUsers = asyncHandler(async (req: Request, res: Response) => {
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
        role: 'sale_admin',
        isSuperSaleAdmin: { $ne: true }  
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
    // @ts-ignore
    const users = await User.paginate(where, {
        page,
        limit,
        populate: [
            {
                path: "adminRole",
                select: 'name _id'
            }
        ]
    });

    return res.status(200).json(new ApiResponse(200, { customerList: users }, 'Admin users retrieved successfully'));
});


export const getAdminUserById = asyncHandler(async (req: Request<any>, res: Response) => {

    const user = await User.findById(req?.params.id).populate({
        path: "adminRole",
        select: 'name _id'
    })

    return res.status(200).json(
        new ApiResponse(200, { user: user }, "Admin user retrivied successfully")
    )
});



export const updateAdminUser = asyncHandler(async (req: Request<IUserBody>, res: Response) => {

    const { userId }: any = req.params;

    const existingUser = await User.findById(userId);

    if (!existingUser) {
        throw new ApiError(404, "Admin user not found");
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
        throw new ApiError(500, "Something went wrong while updating the admin user");
    }

    const userWithoutSensitiveInfo = await User.findById(updatedUser._id).select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(200, userWithoutSensitiveInfo, "Admin user updated successfully")
    );

});


export const deleteAdminUserById = asyncHandler(async (req: Request<any>, res: Response) => {

    try {
        const id = req?.params.id

        if (!id) {
            throw new ApiError(400, "Id is required");
        }

        const user = await User.findByIdAndDelete(id);
        if (!user) throw new ApiError(404, 'User not found');
        return res.status(200).json(
            new ApiResponse(200, user, "Admin user deleted successfully")
        );
    } catch (error: any) {
        throw new ApiError(500, error.message || 'deleteAdminUserById  failed');

    }

});


export const getAdminUsersDropdown = asyncHandler(async (req: Request, res: Response) => {
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
        role: 'sale_admin'
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

    // @ts-ignore
    const data = await User.paginate(where, {
        page,
        limit,

    });

    const options = data?.results?.map((item: any) => {
        return {
            label: item?.fullName,
            value: item?._id
        }
    })
    return res.status(200).json(new ApiResponse(200, { options: options }, 'Admin users dropdown retrieved successfully'));

});
