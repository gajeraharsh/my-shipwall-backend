// @ts-nocheck
import Order from "../models/Order";
import Cart from "../models/Cart";
import Product from "../models/Product";
import ApiError from "../utils/apiError";
import httpStatus from 'http-status';
import mongoose from "mongoose";
import moment from "moment";
import GeneralSettingModel from "../models/generalSetting";
import ReturnOrder from "../models/ReturnOrder";
import { uploadFileToS3 } from "./fileUploads3Service";


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
            boxQuantity: item.boxQuantity,
            boxPrice: item?.boxPrice,
            price: item.price,
            subtotal: item.subtotal,
            taxAmount: item?.taxAmount,
            taxPercent: item?.taxPercent,
            hsnTx: item?.hsnTx
        })),
        finalTotal: cart.totalAmount,
        subtotal: cart.subtotal,
        shippingFee: cart.shippingFee,
        taxAmount: cart.taxAmount,
        subTotalIncTax: cart?.subTotalIncTax,
        shippingDetails: {
            address: "User Address",
            city: "User City",
            state: "User State",
            postalCode: "User Postal Code",
            country: "User Country",
            phone: "User Phone",
        },
        orderStatus: "draft",
        paymentStatus: "Awaiting Payment",
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
    cart.subTotalIncTax = 0;
    cart.taxAmount = 0
    await cart.save();

    return newOrder;
};



export const fetchOrders = async (req: any) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = "",
            fromDate,
            toDate,
            days,
            orderStatus,
            paymentStatus
        } = req.query;

        let query: any = { user: req?.user?._id };

        if (search) {
            query.$or = [
                { id: { $regex: search, $options: "i" } },
                { "user.email": { $regex: search, $options: "i" } },
                { "user.fullName": { $regex: search, $options: "i" } }
            ];
        }

        if (days) {
            const today = new Date();
            const pastDate = new Date();
            pastDate.setDate(today.getDate() - parseInt(days));
            query.createdAt = { $gte: pastDate, $lte: today };
        } else if (fromDate && toDate) {
            query.createdAt = { $gte: new Date(fromDate), $lte: new Date(toDate) };
        } else if (fromDate) {
            query.createdAt = { $gte: new Date(fromDate) };
        } else if (toDate) {
            query.createdAt = { $lte: new Date(toDate) };
        }

        // Order status filter
        if (orderStatus) {
            query.orderStatus = orderStatus;
        }

        // Payment status filter
        if (paymentStatus) {
            query.paymentStatus = paymentStatus;
        }

        // Fetch orders with returnOrder virtual
        const orders = await Order.paginate(query, {
            page,
            limit,
            populate: [
                {
                    path: "user",
                    select: "fullName id phone email"
                },
                {
                    path: "returnOrder",
                    select: "_id returnStatus refundStatus createdAt"
                }
            ],
            sort: { createdAt: -1 }
        });

        return orders;
    } catch (err: any) {
        console.error(err);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error retrieving orders");
    }
};



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
                subtotal: 1,
                subTotalIncTax: 1,
                shippingFee: 1,
                taxAmount: 1,
                orderStatus: 1,
                paymentStatus: 1,
                shippingDetails: 1,
                deliveredAt: 1,
                createdAt: 1,
                updatedAt: 1,
                hsnTx: 1,
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
                select: "productName modelNo color watt price boxQuantity productThumbImageUrl productThumbImage bodyColor",
                populate: {
                    path: "color",
                    model: "ColorMaster",
                    select: "colorName",
                },
            }).populate({
                path: "user",
                select: "fullName email phone billingAddress deliveryAddress id _id businessName phone email gstNumber",
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
                    {
                        path: "deliveryAddress.city",
                        model: "City", // Replace with your actual city model name
                        select: "name",
                    },
                    {
                        path: "deliveryAddress.state",
                        model: "State", // Replace with your actual state model name
                        select: "name",
                    },

                ],
            });


        if (!order) {
            throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
        }

        const returnOrder = await ReturnOrder.countDocuments({
            order: order?._id
        })


        const generalSetting = await GeneralSettingModel.findOne({});
        const returnDaysLimit = generalSetting?.returnDays || 0;

        const orderDate = moment(order.createdAt);
        const today = moment();
        const daysPassed = today.diff(orderDate, "days");
        const returnDaysLeft = Math.max(returnDaysLimit - daysPassed, 0);
        const isReturnExpired = daysPassed > returnDaysLimit;


        const isReturnedOrder = returnOrder > 0

        const orderObject = order.toObject();


        return {
            ...orderObject,
            returnDaysLeft,
            isReturnExpired,
            isReturnedOrder
        }



    } catch (err: any) {
        console.log(err)
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error retrieving order details");
    }
};



export const updateOrderStatusService = async (
    orderId: string,
    newStatus: any,
    changedBy: string
) => {
    const order = await Order.findById(orderId);
    if (!order) {
        throw new ApiError(httpStatus.NOT_FOUND, "Rejection Order not found");
    }

    const validStatuses: IRejectionOrder["returnStatus"][] = [
        "packing",
        "dispatch",
        "delevered",
        "InLogistic",
        "Cancelled"
    ];

    if (!validStatuses.includes(newStatus)) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid order status");
    }

    if (order?.orderStatus == "delevered") {
        throw new ApiError(httpStatus.BAD_REQUEST, "Order is delivered you can not change it again.")

    }
    order.orderStatus = newStatus;


    await order.save();

    return order;

};


export const changeOrder = async (
    orderId: string,
    data: any,
    changedBy: string
) => {

    const {
        trackingId = null,
        trackingLink = null,
        transportName = null,
        sapInvoideNumber = null,
        eWayBillNo = null
    } = data

    const order = await Order.findById(orderId);
    if (!order) {
        throw new ApiError(httpStatus.NOT_FOUND, "Rejection Order not found");
    }


    if (trackingId) {
        order.trackingId = trackingId
    }

    if (trackingLink) {
        order.trackingLink = trackingLink
    }

    if (transportName) {
        order.transportName = transportName
    }

    if (sapInvoideNumber) {
        order.sapInvoideNumber = sapInvoideNumber
    }

    if (eWayBillNo) {
        order.eWayBillNo = eWayBillNo
    }

    await order.save();

    return order;
};


export const changePaymentStatus = async (
    orderId: string,
    data: any,
    changedBy: string
) => {

    const {
        paymentRemark,
        paymentMode
    } = data

    if (!paymentRemark || !paymentMode) {
        throw new ApiError(httpStatus[400], "Invalid input.");
    }

    const order = await Order.findById(orderId);
    if (!order) {
        throw new ApiError(httpStatus.NOT_FOUND, "Rejection Order not found");
    }


    order.paymentRemark = paymentRemark
    order.paymentMode = paymentMode

    await order.save();

    return order;
};




export const UploadLr = async (
    orderId: string,
    file: Express.Multer.File | undefined,
    changedBy: string,
) => {

    const order = await Order.findById(orderId);
    if (!order) {
        throw new ApiError(httpStatus.NOT_FOUND, "Rejection Order not found");
    }

    let uploadlrUrl: string | null = null;

    if (file) {
        uploadlrUrl = await uploadFileToS3(file, changedBy);
    }

    order.uploadlr = uploadlrUrl

    await order.save();

    return order;
};




