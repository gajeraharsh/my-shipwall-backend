import Cart from "../models/Cart";
import Product from "../models/Product";
import { ICart } from "../models/Cart";
import ApiError from "../utils/apiError";

// Helper function to calculate cart totals
const calculateTotals = (cart: ICart) => {
    const subtotal = cart.products.reduce((sum, item) => sum + item.subtotal, 0);
    const shippingFee = 0; // Example shipping fee (can be dynamic)
    const totalAmount = subtotal + shippingFee;
    return { subtotal, shippingFee, totalAmount };
};

// Add or update cart quantity (single API for + / - / remove)
export const updateCartService = async (userId: string, productId: string, quantity: number) => {
    if (quantity < 0) throw new ApiError(400, "Quantity cannot be negative");

    const product = await Product.findById(productId);
    if (!product) throw new ApiError(404, "Product not found");

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
        cart = new Cart({ user: userId, products: [] });
    }

    const existingProduct = cart.products.find((item) => item.product.toString() === productId);

    if (existingProduct) {
        if (quantity === 0) {
            // Remove product from cart
            cart.products = cart.products.filter((item) => item.product.toString() !== productId);
        } else {
            // Update quantity and validate stock
            if (quantity > product.stock) throw new ApiError(400, `Only ${product.stock} items available in stock`);

            existingProduct.quantity = quantity;
            existingProduct.subtotal = quantity * product.price;
        }
    } else {
        if (quantity > 0) {
            // Add new product to cart
            cart.products.push({
                product: product._id,
                quantity,
                price: product.price,
                subtotal: quantity * product.price,
            });
        }
    }

    // Recalculate totals
    Object.assign(cart, calculateTotals(cart));

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
    Object.assign(cart, calculateTotals(cart));

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
        totalAmount: cart.totalAmount
    };
};
