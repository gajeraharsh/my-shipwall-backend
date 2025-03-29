// @ts-nocheck
import RejctionCart from "../models/RejctionCart";
import RejectionOrder from "../models/RejectionOrder";
import Product from "../models/Product";
import ApiError from "../utils/apiError";
import httpStatus from 'http-status';
import mongoose from "mongoose";
import moment from "moment";
import { Request } from "express";
import { uploadFileToS3 } from "./fileUploads3Service";
import Refund from "../models/Refund";


export const createOrderRejectionService = async (userId: string, req: Request) => {
    const cart = await RejctionCart.findOne({ user: userId }).populate("products.product");

    if (!cart || cart.products.length === 0) {
        throw new ApiError(400, "Your Rejection Order List is empty. Cannot Place An Rejection Order.");
    }

    const lastOrder: any = await RejectionOrder.findOne().sort({ rejectionOrderId: -1 });
    const newOrderNumber = lastOrder ? lastOrder.rejectionOrderId + 1 : 1;

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


    const newOrder = new RejectionOrder({
        user: userId,
        rejectionOrderId: newOrderNumber,
        products: cart.products.map((item) => ({
            product: item.product._id,
            quantity: item.quantity,
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
        issueImage: issueImageUrl,
        reason: reason,
        orderStatus: "Initiated",
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
    await cart.save();

    return newOrder;
};



export const fetchRejectionOrders = async (req: any) => {
    try {

        const page = req?.query?.page;
        const limit = req?.query?.limit;
        const query = req?.query?.search || ''

        const orders = await RejectionOrder.paginate({
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

export const fetchAllRejctionOrders = async (req: any) => {
    try {

        const page = req?.query?.page;
        const limit = req?.query?.limit;
        const query = req?.query?.search || ''

        const orders = await RejectionOrder.paginate({
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


export const fetchRejectionOrderById = async (orderId: string) => {
    try {
        const order = await RejectionOrder.findById(orderId)
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

        const refundOrder = await Refund.find({
            rejectionOrder: orderId
        }).populate({
            path: "user",
            select: "id _id ",
        })

        const orderObj = await order?.toObject()
        orderObj.refund = refundOrder


        if (!orderObj) {
            throw new ApiError(httpStatus.NOT_FOUND, "Rejection order not found");
        }

        return orderObj;
    } catch (err: any) {
        console.error(err);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error retrieving rejection order");
    }
};



export const getOrderRejectionByIdService = async (orderId: string) => {
    try {
        const order = await RejectionOrder.findOne({ _id: orderId })
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

        const refundOrder = await Refund.find({
            rejectionOrder: orderId
        }).populate({
            path: "user",
            select: "id _id ",
        })

        const orderObj = await order?.toObject()
        orderObj.refund = refundOrder

        if (!orderObj) {
            throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
        }

        return orderObj;
    } catch (err: any) {
        console.log(err)
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error retrieving order details");
    }
};



export const updateRejectionActivityById = async (orderId: any, note: any, status: any, changedBy: any) => {
    try {

        const res = await RejectionOrder.findByIdAndUpdate(orderId, {
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
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error updating rejection order activities');
    }
};



/**
 * Updates the order status and logs the activity with predefined note
 * @param orderId - ID of the rejection order
 * @param newStatus - New status to set (must be a valid status)
 * @param changedBy - ID of the user who made the change
 */
export const updateRejectionOrderStatusService = async (
    orderId: string,
    newStatus: any,
    changedBy: string
) => {
    const order = await RejectionOrder.findById(orderId);
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



export const createRefundForRejectionOrderService = async ({
    orderId,
    refundAmount,
    note,
    initiatedBy,
}: any) => {
    const rejectionOrder = await RejectionOrder.findById(orderId);
    if (!rejectionOrder) {
        throw new ApiError(httpStatus.NOT_FOUND, "Rejection order not found");
    }

    const existingRefund = await Refund.findOne({
        rejectionOrder: orderId,
        sourceType: "RejectionOrder"
    });

    if (existingRefund) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Refund already initiated for this rejection order");
    }

    const refund = await Refund.create({
        rejectionOrder: orderId,
        user: rejectionOrder.user,
        amount: refundAmount,
        sourceType: "RejectionOrder",
        status: "Initiated",
        note: note || "Manual refund initiated",
        initiatedBy,
    });


    rejectionOrder.orderStatus = "Approved_Credited";
    rejectionOrder.activities.push({
        status: "Approved_Credited",
        updatedBy: initiatedBy,
        note: "Rejection order approved and credit issued",
        timestamp: new Date(),
    });


    await rejectionOrder.save();


    return refund;
};
