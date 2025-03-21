import { Request, Response } from 'express';
import User from '../../models/User';
import { userValidationSchema } from '../../validations/user';
import { asyncHandler } from '../../utils/asyncHandler';
import ApiResponse from '../../utils/apiResponse';
import { IUserBody } from '../../types/IUser';
import ApiError from '../../utils/apiError';
import { uploadFileToS3 } from '../../services/fileUploads3Service';
import Order from '../../models/Order';
import httpStatus from 'http-status'
import mongoose from 'mongoose';

export const createCustomer = asyncHandler(async (req: Request<IUserBody>, res: Response) => {
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


export const getCustomers = asyncHandler(async (req: Request, res: Response) => {
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
        role: 'user'
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
            { path: 'billingAddress.state', select: '_id name' },
            { path: 'billingAddress.city', select: '_id name' },
            { path: 'deliveryAddress.state', select: '_id name' },
            { path: 'deliveryAddress.city', select: '_id name' },
            {
                path: 'salePerson', select: "_id fullName"
            }
        ],
    });

    return res.status(200).json(new ApiResponse(200, { customerList: users }, 'Customers retrieved successfully'));
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
        });

    if (!user) {
        return res.status(404).json(new ApiResponse(404, {}, "User not found"));
    }

    // Fetch order statistics
    const orderStats = await Order.aggregate([
        { $match: { user: user._id } },
        {
            $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalOrderAmount: { $sum: "$finalTotal" },
                totalAmountPaid: {
                    $sum: {
                        $cond: [{ $eq: ["$paymentStatus", "Paid"] }, "$finalTotal", 0]
                    }
                }
            }
        }
    ]);

    const stats = orderStats[0] || { totalOrders: 0, totalOrderAmount: 0, totalAmountPaid: 0 };

    // Attach stats to user object
    const userWithStats = user.toObject(); // Convert Mongoose document to a plain object
    userWithStats.stats = stats;

    return res.status(200).json(
        new ApiResponse(200, { user: userWithStats, ...stats }, "User retrieved successfully")
    );
});



export const updateCustomer = asyncHandler(async (req: Request<IUserBody>, res: Response) => {

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


export const deleteCustomerById = asyncHandler(async (req: Request<any>, res: Response) => {

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

export const getCustomerOrders = asyncHandler(async (req: Request<IUserBody>, res: Response) => {
    try {
        console.log(req.query, 'req.query;');

        const { search, page, limit, startDate, endDate, orderStatus, user_id }: any = req.query;

        console.log("Received user_id:", user_id);

        const where: any = {};

        // Validate user_id before converting
        if (user_id) {
            if (!mongoose.Types.ObjectId.isValid(user_id)) {
                console.error("Invalid user_id:", user_id);
                throw new ApiError(httpStatus.BAD_REQUEST, `Invalid user ID format: ${user_id}`);
            }
            where.user = new mongoose.Types.ObjectId(user_id);
        }

        if (search) {
            where.orderStatus = { $regex: search, $options: 'i' };
        }

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.$gte = new Date(startDate as string);
            if (endDate) where.createdAt.$lte = new Date(endDate as string);
        }

        if (orderStatus) {
            where.orderStatus = orderStatus;
        }

        const orders = await Order.paginate(where, {
            page,
            limit,
        });

        if (!orders || orders.length === 0) {
            throw new ApiError(httpStatus.NOT_FOUND, 'No orders found');
        }

        return res.status(200).json(new ApiResponse(200, { orders }, 'Rrders retrieved successfully'));
    } catch (err: any) {
        console.error("Error in getCustomerOrders:", err);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving orders');
    }
})



export const assignSaleUser = asyncHandler(async (req: Request<IUserBody>, res: Response) => {

    const { userId }: any = req.params;
    const { salePersonId }: any = req.body;

    const existingUser = await User.findById(userId);

    if (!existingUser) {
        throw new ApiError(404, "User not found");
    }
    console.log(userId, salePersonId)
    // Handle file uploads
    const updateData: any = {
        salePerson: salePersonId
    };


    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
    );

    if (!updatedUser) {
        throw new ApiError(500, "Something went wrong while assigning sale person");
    }

    const userWithoutSensitiveInfo = await User.findById(updatedUser._id).select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(200, userWithoutSensitiveInfo, "Sale person assign successsfully")
    );

});
