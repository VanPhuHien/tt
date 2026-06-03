const Cart = require('../models/cart');
const Product = require('../models/product');

const getCart = async (req, res) => {
    try {
        const email = req.user?.email;
        if (!email) {
            return res.status(401).json({ EC: 1, EM: 'Unauthorized' });
        }

        let cart = await Cart.findOne({ userEmail: email }).populate('items.product');
        if (!cart) {
            cart = await Cart.create({ userEmail: email, items: [] });
        }

        return res.status(200).json({
            EC: 0,
            DT: cart
        });
    } catch (error) {
        return res.status(500).json({
            EC: -1,
            EM: error.message
        });
    }
};

const addToCart = async (req, res) => {
    try {
        const email = req.user?.email;
        const { productId, quantity = 1 } = req.body;

        if (!email) {
            return res.status(401).json({ EC: 1, EM: 'Unauthorized' });
        }

        if (!productId) {
            return res.status(400).json({ EC: 2, EM: 'Product ID is required' });
        }

        // Check if product exists and check stock
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ EC: 3, EM: 'Product not found' });
        }

        let cart = await Cart.findOne({ userEmail: email });
        if (!cart) {
            cart = await Cart.create({
                userEmail: email,
                items: [{ product: productId, quantity }]
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

        return res.status(200).json({
            EC: 0,
            DT: populatedCart
        });
    } catch (error) {
        return res.status(500).json({
            EC: -1,
            EM: error.message
        });
    }
};

const updateCart = async (req, res) => {
    try {
        const email = req.user?.email;
        const { productId, quantity } = req.body;

        if (!email) {
            return res.status(401).json({ EC: 1, EM: 'Unauthorized' });
        }

        if (!productId || quantity === undefined) {
            return res.status(400).json({ EC: 2, EM: 'Product ID and quantity are required' });
        }

        if (Number(quantity) < 1) {
            return res.status(400).json({ EC: 3, EM: 'Quantity must be at least 1' });
        }

        const cart = await Cart.findOne({ userEmail: email });
        if (!cart) {
            return res.status(404).json({ EC: 4, EM: 'Cart not found' });
        }

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity = Number(quantity);
            await cart.save();
        } else {
            return res.status(404).json({ EC: 5, EM: 'Item not found in cart' });
        }

        const populatedCart = await Cart.findOne({ userEmail: email }).populate('items.product');

        return res.status(200).json({
            EC: 0,
            DT: populatedCart
        });
    } catch (error) {
        return res.status(500).json({
            EC: -1,
            EM: error.message
        });
    }
};

const removeFromCart = async (req, res) => {
    try {
        const email = req.user?.email;
        const { productId } = req.params;

        if (!email) {
            return res.status(401).json({ EC: 1, EM: 'Unauthorized' });
        }

        const cart = await Cart.findOne({ userEmail: email });
        if (!cart) {
            return res.status(404).json({ EC: 2, EM: 'Cart not found' });
        }

        cart.items = cart.items.filter(item => item.product.toString() !== productId);
        await cart.save();

        const populatedCart = await Cart.findOne({ userEmail: email }).populate('items.product');

        return res.status(200).json({
            EC: 0,
            DT: populatedCart
        });
    } catch (error) {
        return res.status(500).json({
            EC: -1,
            EM: error.message
        });
    }
};

const clearCart = async (req, res) => {
    try {
        const email = req.user?.email;
        if (!email) {
            return res.status(401).json({ EC: 1, EM: 'Unauthorized' });
        }

        const cart = await Cart.findOne({ userEmail: email });
        if (cart) {
            cart.items = [];
            await cart.save();
        }

        return res.status(200).json({
            EC: 0,
            DT: cart
        });
    } catch (error) {
        return res.status(500).json({
            EC: -1,
            EM: error.message
        });
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCart,
    removeFromCart,
    clearCart
};
