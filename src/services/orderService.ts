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



export const getOrderByIdService = async (userId: string, orderId: string) => {
    try {
        const order = await Order.findOne({ user: userId, _id: orderId })
            .populate({
                path: "products.product",
                model: "Product",
                select: "productName modelNo color watt price boxQuantity",
                populate: {
                    path: "color", 
                    model: "ColorMaster",
                    select: "colorName",
                },
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
