// @ts-nocheck
import RejectionOrder from "../models/RejectionOrder";
import Product from "../models/Product";
import ApiError from "../utils/apiError";
import httpStatus from 'http-status';
import mongoose from "mongoose";
import moment from "moment";
import { Request } from "express";
import { uploadFileToS3 } from "./fileUploads3Service";
import Refund from "../models/Refund";
import ReturnOrder from "../models/ReturnOrder";
import ReturnCart from "../models/ReturnCart";


export const createOrderReturnService = async (userId: string, req: Request) => {
    const cart = await ReturnCart.findOne({ user: userId }).populate("products.product");

    if (!cart || cart.products.length === 0) {
        throw new ApiError(400, "Your Return Order List is empty. Cannot Place An Rejection Order.");
    }

    // Validate stock availability
    // for (const item of cart.products) {
    //     if (item.quantity > item.product.stock) {
    //         throw new ApiError(400, `Insufficient stock for ${item.product.productName}`);
    //     }
    // }


    const file = req.file as Express.Multer.File | undefined;
    const reason = req?.body?.reason

    if (!file || !reason) {
        throw new ApiError(400, "Invalid input");
        return
    }

    let issueImageUrl: string | null = null;

    if (file) {
        issueImageUrl = await uploadFileToS3(file, req.body.user?._id);
    }


    const newOrder = new ReturnOrder({
        user: userId,
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
        issueImage: issueImageUrl,
        reason: reason,
        orderStatus: "Initiated",
        order: cart?.order
    });

    await newOrder.save();


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
    cart.order = null
    await cart.save();

    return newOrder;
};



export const fetchReturnOrders = async (req: any) => {
    try {

        const page = req?.query?.page;
        const limit = req?.query?.limit;
        const query = req?.query?.search || ''

        const orders = await ReturnOrder.paginate({
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

export const fetchAllReturnOrders = async (req: any) => {
    try {

        const page = req?.query?.page;
        const limit = req?.query?.limit;
        const query = req?.query?.search || ''

        const orders = await ReturnOrder.paginate({
            orderStatus: { $regex: query, $options: 'i' },
        }, {
            page,
            limit,
            populate: [
                {
                    path: "user",
                    select: "fullName id phone"
                }
            ]
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


export const fetchReturnOrderById = async (orderId: string) => {
    try {
        const order = await ReturnOrder.findById(orderId)
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
                select: "fullName email phone id",
            });

        if (!order) {
            throw new ApiError(httpStatus.NOT_FOUND, "Return order not found");
        }

        return order;
    } catch (err: any) {
        console.error(err);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error retrieving return order");
    }
};



export const getOrderReturnByIdService = async (orderId: string) => {
    try {
        const order = await ReturnOrder.findOne({ _id: orderId })
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
                select: "fullName email phone  id _id businessName phone email gstNumber profileImage",
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
            }).populate({
                path: "activities.updatedBy",
                model: "User",
                select: "fullName _id id profileImage profileImageUrl"
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



export const updateReturnActivityById = async (orderId: any, note: any, status: any, changedBy: any) => {
    try {

        const res = await ReturnOrder.findByIdAndUpdate(orderId, {
            $set: { orderStatus: newStatus },
            $push: {
                activities: {
                    status: status,
                    updatedBy: changedBy,
                    note: note, // optional
                }
            }
        });


        if (!res) throw new ApiError(httpStatus.NOT_FOUND, 'Something went wrong please try again');
        return res;
    } catch (err: any) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error updating return order activities');
    }
};



/**
 * Updates the order status and logs the activity with predefined note
 * @param orderId - ID of the rejection order
 * @param newStatus - New status to set (must be a valid status)
 * @param changedBy - ID of the user who made the change
 */
export const updateReturnOrderStatusService = async (
    orderId: string,
    newStatus: any,
    changedBy: string
) => {
    const order = await ReturnOrder.findById(orderId);
    if (!order) {
        throw new ApiError(httpStatus.NOT_FOUND, "Rejection Order not found");
    }

    const validStatuses: IRejectionOrder["orderStatus"][] = [
        "Initiated",
        "Pickup_Schedule",
        "PickedUp",
        "Received",
        "Mismatch_Correction",
        "Validated",
        // "Approved_Credited"
    ];

    if (!validStatuses.includes(newStatus)) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid order status");
    }

    console.log(order?.orderStatus, 'order?.orderStatus')
    if (order?.orderStatus == "Approved_Credited") {
        throw new ApiError(httpStatus.BAD_REQUEST, "status is approvved you can not change status.")

    }

    const statusNotes: Record<IRejectionOrder["orderStatus"], string> = {
        Initiated: "Rejection order has been initiated.",
        Pickup_Schedule: "Pickup has been scheduled.",
        PickedUp: "Rejection items have been picked up.",
        Received: "Rejection items have been received at warehouse.",
        Mismatch_Correction: "Mismatch identified, correction in progress.",
        Validated: "Rejection order has been validated.",
        // Approved_Credited: "Rejection order approved and credit issued.",
    };

    const note = statusNotes[newStatus] || "";

    // Update status and log activity
    order.orderStatus = newStatus;

    if (!order.activities) order.activities = [];

    order.activities.push({
        status: newStatus,
        updatedBy: changedBy,
        note,
        timestamp: new Date(),
    });

    await order.save();

    return order;

};



export const createReturnForRejectionOrderService = async ({
    orderId,
    refundAmount,
    note,
    initiatedBy,
}: any) => {
    const returnOrder = await ReturnOrder.findById(orderId);
    if (!returnOrder) {
        throw new ApiError(httpStatus.NOT_FOUND, "Return order not found");
    }

    const existingRefund = await Refund.findOne({
        returnOrder: orderId,
        sourceType: "Order"
    });

    if (existingRefund) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Refund already initiated for this return order");
    }

    const refund = await Refund.create({
        returnOrder: orderId,
        user: returnOrder.user,
        amount: refundAmount,
        sourceType: "Order",
        status: "Initiated",
        note: note || "Manual refund initiated",
        initiatedBy,
    });


    returnOrder.orderStatus = "Approved_Credited";
    returnOrder.activities.push({
        status: "Approved_Credited",
        updatedBy: initiatedBy,
        note: "Return order approved and credit issued",
        timestamp: new Date(),
    });


    await returnOrder.save();


    return refund;
};
