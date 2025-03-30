import ReturnCart from "../models/ReturnCart";
import Product from "../models/Product";
import { ICart } from "../models/Cart";
import ApiError from "../utils/apiError";
import GeneralSettingModel from "../models/generalSetting";
import Order from "../models/Order";

// Helper function to calculate cart totals
const calculateTotals = async (cart: ICart) => {
    const productIds = cart.products.map(item => item.product);

    const productsWithTax = await Product.aggregate([
        {
            $match: {
                _id: { $in: productIds }
            }
        },
        {
            $lookup: {
                from: 'hsnciodemodels',
                localField: 'hsnCode',
                foreignField: '_id',
                as: 'hsnCodeDetails'
            }
        },
        {
            $unwind: {
                path: '$hsnCodeDetails',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                _id: 1,
                price: 1,
                hsnCodePercentage: { $ifNull: ['$hsnCodeDetails.percentage', 0] },
                boxQuantity: 1,
                hsnCode: '$hsnCodeDetails.code'
            }
        }
    ]);

    let subtotal = 0;
    let totalTaxAmount = 0;

    cart.products.forEach((item) => {
        const product = productsWithTax.find((p: any) => p._id.toString() === item.product.toString());

        if (product) {
            const boxQtyProduct = product.boxQuantity
            const pricePerItem: any = Math.round(product.price * boxQtyProduct)

            const productPrice = parseFloat(pricePerItem);
            const taxAmount = (productPrice * product.hsnCodePercentage) / 100;
            const totalProductValue = productPrice * item.quantity;
            const totalItemTax = taxAmount * item.quantity;


            item.taxAmount = Math.round(taxAmount * 100) / 100;
            item.subtotal = Math.round(totalProductValue * 100) / 100;
            item.taxPercent = Math.round(product.hsnCodePercentage * 100) / 100;


            item.hsnTx = {
                amount: Math.round(taxAmount * 100) / 100,
                percent: Math.round(product.hsnCodePercentage * 100) / 100,
                hsnCode: product.hsnCode || "",
                taxableValue: productPrice.toFixed(2),
                totalTaxAmount: Math.round(totalItemTax * 100) / 100
            };

            subtotal += totalProductValue;
            totalTaxAmount += taxAmount * item.quantity;

            console.log(item, 'item')
        }
    });

    const generalSettings = await GeneralSettingModel.findOne();
    const shippingFee = cart.products.length > 0 && generalSettings
        ? generalSettings.generalshippingcost
        : 0;

    const totalAmount = subtotal + totalTaxAmount + shippingFee;
    const subTotalIncTax = subtotal + totalTaxAmount

    return {
        subtotal: Math.round(subtotal * 100) / 100,
        shippingFee: Math.round(shippingFee * 100) / 100,
        taxAmount: Math.round(totalTaxAmount * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100,
        subTotalIncTax: Math.round(subTotalIncTax * 100) / 100,
    };
};


// Add or update cart quantity (single API for + / - / remove)
export const addToReturnCartService = async (
    userId: string,
    orderId: string,
    productId: string,
    returnQty: number
) => {
    // Step 1: Validate order
    const order = await Order.findById(orderId);
    if (!order) throw new ApiError(404, "Order not found");

    // Step 2: Find ordered product in the order
    const orderedProduct = order.products.find(
        (item: any) => item.product.toString() === productId
    );
    if (!orderedProduct)
        throw new ApiError(400, "Product not found in the original order");

    const totalOrderedQty = orderedProduct.quantity;

    // Step 3: Fetch or create ReturnCart
    let returnCart = await ReturnCart.findOne({ user: userId, order: orderId });
    if (!returnCart) {
        returnCart = new ReturnCart({ user: userId, order: orderId, products: [] });
    }

    // Step 4: Check existing return item in returnCart
    const existingIndex = returnCart.products.findIndex(
        (item: any) => item.product.toString() === productId
    );

    const alreadyReturningQty =
        existingIndex !== -1 ? returnCart.products[existingIndex].quantity : 0;

    const combinedQty = returnQty + alreadyReturningQty;

    // Only throw error if exceeding ordered quantity
    if (combinedQty > totalOrderedQty) {
        throw new ApiError(
            400,
            `You can only return up to ${totalOrderedQty - alreadyReturningQty} more units of this product`
        );
    }

    // Step 5: If returnQty is 0, remove product if it exists and return
    if (returnQty === 0) {
        if (existingIndex !== -1) {
            returnCart.products.splice(existingIndex, 1);
            const totals = await calculateTotals(returnCart);
            Object.assign(returnCart, totals);
            returnCart.markModified("products");
            returnCart.markModified("products.hsnTx");
            await returnCart.save();
        }
        return returnCart;
    }

    // Step 6: Get product and calculate pricing
    const product = await Product.findById(productId);
    if (!product) throw new ApiError(404, "Product not found");

    const boxQty = product.boxQuantity;
    const pricePerItem = product.price * boxQty;
    const subtotal = pricePerItem * returnQty;

    // Step 7: Add or update the return cart
    if (existingIndex !== -1) {
        returnCart.products[existingIndex].quantity += returnQty;
        returnCart.products[existingIndex].subtotal += subtotal;
        returnCart.products[existingIndex].boxQuantity = boxQty;
        returnCart.products[existingIndex].boxPrice = pricePerItem;
        returnCart.products[existingIndex].price = product.price;
    } else {
        returnCart.products.push({
            product: product._id,
            quantity: returnQty,
            price: product.price,
            subtotal,
            boxQuantity: boxQty,
            boxPrice: pricePerItem,
        });
    }

    // Step 8: Recalculate totals and save
    const totals = await calculateTotals(returnCart);
    Object.assign(returnCart, totals);
    returnCart.markModified("products");
    returnCart.markModified("products.hsnTx");
    await returnCart.save();

    return returnCart;
};


// Remove item from cart
export const removeFromCartService = async (userId: string, ordreId: string, productId: string) => {
    const cart = await ReturnCart.findOne({ user: userId, order: ordreId });
    if (!cart) throw new ApiError(404, "Cart not found");

    // Filter out the product
    cart.products = cart.products.filter((item: any) => item.product.toString() !== productId);

    // Recalculate totals
    Object.assign(cart, await calculateTotals(cart));
    cart.markModified('products'); // Ensure nested changes are tracked
    cart.markModified('products.hsnTx');


    await cart.save();
    return cart;
};

// Get cart items grouped by series
export const getCartService = async (userId: string, orderId: any) => {
    const cart = await ReturnCart.findOne({ user: userId, order: orderId })
        .populate({
            path: 'products.product',
            populate: [
                { path: 'brand' },
                { path: 'category' },
                { path: 'series' },
                { path: 'color' },
            ]
        })
        .exec();

    if (!cart) throw new ApiError(404, "Cart not found");

    // Group products by series, and include category and series in the structure
    const seriesMap = new Map();

    for (const item of cart.products) {
        const product = item.product as any;
        const seriesId = product.series?._id?.toString();

        if (!seriesId) continue;

        if (!seriesMap.has(seriesId)) {
            seriesMap.set(seriesId, {
                seriesId,
                seriesName: product.series?.seriesName || "Unknown Series",
                category: product.category?.categoryName || "Unknown Category",
                products: [],
            });
        }

        // Push product details into the series
        seriesMap.get(seriesId).products.push({
            _id: product._id,
            modelNo: product.modelNo,
            watt: product.watt,
            color: product.color?.colorName || "Unknown Color",
            bodyColor: product.bodyColor,
            price: product.price,
            stock: product.stock,
            quantity: item.quantity,
            subtotal: item.subtotal,
            brand: product.brand?.brandName || "Unknown Brand",
            series: product.series?.seriesName || "Unknown Series",
            category: product.category?.categoryName || "Unknown Category",
            boxQuantity: product?.boxQuantity
        });
    }

    return {
        series: Array.from(seriesMap.values()),
        _id: cart._id,
        subtotal: cart.subtotal,
        shippingFee: cart.shippingFee,
        totalAmount: cart.totalAmount,
        taxAmount: cart.taxAmount,
        subTotalIncTax: cart.subTotalIncTax,
    };
};
