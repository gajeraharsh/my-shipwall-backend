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
            populate:[
                {
                    path:"user",
                    select:"fullName id phone"
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




export const getOrderRejectionByIdService = async (orderId: string) => {
    try {
        const order = await RejectionOrder.findOne({ _id: orderId })
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

        return order;
    } catch (err: any) {
        console.log(err)
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error retrieving order details");
    }
};
