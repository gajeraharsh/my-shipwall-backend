import Cart from "../models/Cart";
import Product from "../models/Product";
import { ICart } from "../models/Cart";
import ApiError from "../utils/apiError";
import GeneralSettingModel from "../models/generalSetting";

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
export const updateCartService = async (userId: string, productId: string, quantity: number) => {
    if (quantity < 0) throw new ApiError(400, "Quantity cannot be negative");

    const product = await Product.findById(productId);
    if (!product) throw new ApiError(404, "Product not found");

    let cart: any = await Cart.findOne({ user: userId });

    if (!cart) {
        cart = new Cart({ user: userId, products: [] });
    }

    const existingProduct: any = cart.products.find((item: any) => item.product.toString() === productId);

    const boxQtyProduct = product.boxQuantity
    const pricePerItem = product.price * boxQtyProduct
    const totalValue = pricePerItem * quantity

    if (existingProduct) {
        if (quantity === 0) {
            // Remove product from cart
            cart.products = cart.products.filter((item: any) => item.product.toString() !== productId);
        } else {
            // Update quantity and validate stock
            if (quantity > product.stock) throw new ApiError(400, `Only ${product.stock} items available in stock`);

            existingProduct.quantity = quantity;
            existingProduct.subtotal = totalValue;
            existingProduct.boxQuantity = boxQtyProduct;
            existingProduct.boxPrice = pricePerItem
            existingProduct.price = product.price;
        }
    } else {
        if (quantity > 0) {
            // Add new product to cart
            cart.products.push({
                product: product._id,
                quantity,
                price: product.price,
                subtotal: totalValue,
                boxQuantity: boxQtyProduct,
                boxPrice: pricePerItem
            });
        }
    }

    // Recalculate totals
    const totals = await calculateTotals(cart);

    Object.assign(cart, totals);
    cart.markModified('products'); // Ensure nested changes are tracked
    cart.markModified('products.hsnTx');
    await cart.save();
    return cart;
};

// Remove item from cart
export const removeFromCartService = async (userId: string, productId: string) => {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw new ApiError(404, "Cart not found");

    // Filter out the product
    cart.products = cart.products.filter((item) => item.product.toString() !== productId);

    // Recalculate totals
    Object.assign(cart, await calculateTotals(cart));
    cart.markModified('products'); // Ensure nested changes are tracked
    cart.markModified('products.hsnTx');


    await cart.save();
    return cart;
};

// Get cart items grouped by series
export const getCartService = async (userId: string) => {
    const cart = await Cart.findOne({ user: userId })
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
