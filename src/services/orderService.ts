// @ts-nocheck
import Order from "../models/Order";
import Cart from "../models/Cart";
import Product from "../models/Product";
import ApiError from "../utils/apiError";
import httpStatus from 'http-status';

export const createOrderService = async (userId: string) => {
    const cart = await Cart.findOne({ user: userId }).populate("products.product");

    if (!cart || cart.products.length === 0) {
        throw new ApiError(400, "Cart is empty. Cannot place an order.");
    }

    const lastOrder: any = await Order.findOne().sort({ orderId: -1 });
    const newOrderNumber = lastOrder ? lastOrder.orderId + 1 : 1;

    // Validate stock availability
    for (const item of cart.products) {
        if (item.quantity > item.product.stock) {
            throw new ApiError(400, `Insufficient stock for ${item.product.productName}`);
        }
    }

    const newOrder = new Order({
        user: userId,
        orderId: newOrderNumber,
        products: cart.products.map((item) => ({
            product: item.product._id,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.subtotal,
        })),
        finalTotal: cart.totalAmount,
        shippingDetails: {
            address: "User Address",
            city: "User City",
            state: "User State",
            postalCode: "User Postal Code",
            country: "User Country",
            phone: "User Phone",
        },
        orderStatus: "Pending",
        paymentStatus: "Pending",
    });

    await newOrder.save();

    console.log(cart)

    for (const item of cart.products) {
        const productCurrentStock = parseInt(item?.product?.stock)
        await Product.findByIdAndUpdate(item.product._id, { stock: productCurrentStock - item.quantity });
    }

    cart.products = [];
    cart.totalAmount = 0;
    cart.subtotal = 0;
    cart.shippingFee = 0;
    await cart.save();

    return newOrder;
};



export const fetchOrders = async (req: any) => {
    try {

        const page = req?.query?.page;
        const limit = req?.query?.limit;
        const query = req?.query?.search || ''

        const orders = await Order.paginate({
            orderStatus: { $regex: query, $options: 'i' },
            user: req?.user?._id
        }, {
            page,
            limit,
        });

        if (!orders || orders.length === 0) {
            throw new ApiError(httpStatus.NOT_FOUND, 'No orders found');
        }

        return orders;
    } catch (err: any) {
        console.log(err)
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving orders');
    }
}

import mongoose from "mongoose";
import moment from "moment";
import Order from "../models/order.model";

export const fetchOrdersBySalePerson = async (req: any) => {
    const { page = 1, limit = 10, search = '', startDate, endDate, orderStatus, salePersonId } = req.query;

    const matchStage: any = {
        "userInfo.salePerson": new mongoose.Types.ObjectId(salePersonId),
    };

    // Filter by orderStatus or search query
    if (orderStatus) {
        matchStage.orderStatus = orderStatus;
    } else if (search) {
        matchStage.orderStatus = { $regex: search, $options: 'i' };
    }

    // Filter by date range
    if (startDate || endDate) {
        matchStage.createdAt = {};
        if (startDate) matchStage.createdAt.$gte = new Date(startDate as string);
        if (endDate) matchStage.createdAt.$lte = new Date(endDate as string);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const pipeline = [
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "userInfo"
            }
        },
        { $unwind: "$userInfo" },

        // Join with City model (assuming billing address structure is userInfo.billingAddress.city)
        {
            $lookup: {
                from: "cities",
                localField: "userInfo.billingAddress.city",
                foreignField: "_id",
                as: "userInfo.billingAddress.city"
            }
        },
        {
            $unwind: {
                path: "$userInfo.billingAddress.city",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "states",
                localField: "userInfo.billingAddress.state",
                foreignField: "_id",
                as: "userInfo.billingAddress.state"
            }
        },
        {
            $unwind: {
                path: "$userInfo.billingAddress.state",
                preserveNullAndEmptyArrays: true
            }
        },

        { $match: matchStage },

        {
            $project: {
                _id: 1,
                id: 1,
                orderId: 1,
                products: 1,
                finalTotal: 1,
                orderStatus: 1,
                paymentStatus: 1,
                shippingDetails: 1,
                deliveredAt: 1,
                createdAt: 1,
                updatedAt: 1,
                user: "$userInfo"
            }
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: Number(limit) }
    ];

    const orders = await Order.aggregate(pipeline);

    // Total count pipeline
    const totalPipeline = [...pipeline];

    // Remove skip, limit, and project for count
    const countPipeline = totalPipeline.filter(stage => {
        return !('$skip' in stage || '$limit' in stage || '$project' in stage || '$sort' in stage);
    });

    countPipeline.push({ $count: "total" });

    const totalResult = await Order.aggregate(countPipeline);
    const totalDocs = totalResult[0]?.total || 0;

    return {
        docs: orders,
        totalDocs,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalDocs / limit)
    };
};


export const getOrderByIdService = async (orderId: string) => {
    try {
        const order = await Order.findOne({ _id: orderId })
            .populate({
                path: "products.product",
                model: "Product",
                select: "productName modelNo color watt price boxQuantity",
                populate: {
                    path: "color",
                    model: "ColorMaster",
                    select: "colorName",
                },
            }).populate({
                path: "user",
                select: "fullName email phone billingAddress id _id businessName phone email gstNumber",
                populate: [
                    {
                        path: "billingAddress.city",
                        model: "City", // Replace with your actual city model name
                        select: "name",
                    },
                    {
                        path: "billingAddress.state",
                        model: "State", // Replace with your actual state model name
                        select: "name",
                    },
                    {
                        path: "salePerson",
                        model: "User", // Replace with your actual state model name
                        select: "fullName",
                    },

                ],
            });


        if (!order) {
            throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
        }

        return order;
    } catch (err: any) {
        console.log(err)
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error retrieving order details");
    }
};
