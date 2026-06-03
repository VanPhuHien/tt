const Cart = require('../models/cart');
const Product = require('../models/product');

const getCartService = async (email) => {
    try {
        let cart = await Cart.findOne({ userEmail: email }).populate('items.product');
        if (!cart) {
            cart = await Cart.create({ userEmail: email, items: [] });
        }
        return {
            EC: 0,
            DT: cart
        };
    } catch (error) {
        throw error;
    }
};

const addToCartService = async (email, productId, quantity) => {
    try {
        const product = await Product.findById(productId);
        if (!product) {
            return { EC: 3, EM: 'Product not found' };
        }

        let cart = await Cart.findOne({ userEmail: email });
        if (!cart) {
            cart = await Cart.create({
                userEmail: email,
                items: [{ product: productId, quantity: Number(quantity) }]
            });
        } else {
            const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += Number(quantity);
            } else {
                cart.items.push({ product: productId, quantity: Number(quantity) });
            }
            await cart.save();
        }

        const populatedCart = await Cart.findOne({ userEmail: email }).populate('items.product');
        return {
            EC: 0,
            DT: populatedCart
        };
    } catch (error) {
        throw error;
    }
};

const updateCartService = async (email, productId, quantity) => {
    try {
        const cart = await Cart.findOne({ userEmail: email });
        if (!cart) {
            return { EC: 4, EM: 'Cart not found' };
        }

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity = Number(quantity);
            await cart.save();
        } else {
            return { EC: 5, EM: 'Item not found in cart' };
        }

        const populatedCart = await Cart.findOne({ userEmail: email }).populate('items.product');
        return {
            EC: 0,
            DT: populatedCart
        };
    } catch (error) {
        throw error;
    }
};

const removeFromCartService = async (email, productId) => {
    try {
        const cart = await Cart.findOne({ userEmail: email });
        if (!cart) {
            return { EC: 2, EM: 'Cart not found' };
        }

        cart.items = cart.items.filter(item => item.product.toString() !== productId);
        await cart.save();

        const populatedCart = await Cart.findOne({ userEmail: email }).populate('items.product');
        return {
            EC: 0,
            DT: populatedCart
        };
    } catch (error) {
        throw error;
    }
};

const clearCartService = async (email) => {
    try {
        const cart = await Cart.findOne({ userEmail: email });
        if (cart) {
            cart.items = [];
            await cart.save();
        }
        return {
            EC: 0,
            DT: cart
        };
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getCartService,
    addToCartService,
    updateCartService,
    removeFromCartService,
    clearCartService
};
