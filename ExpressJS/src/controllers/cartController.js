const {
    getCartService,
    addToCartService,
    updateCartService,
    removeFromCartService,
    clearCartService
} = require('../services/cartService');

const getCart = async (req, res) => {
    try {
        const email = req.user?.email;
        if (!email) {
            return res.status(401).json({ EC: 1, EM: 'Unauthorized' });
        }

        const result = await getCartService(email);
        return res.status(200).json(result);
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

        const result = await addToCartService(email, productId, quantity);
        if (result.EC !== 0) {
            let statusCode = 400;
            if (result.EC === 3) statusCode = 404;
            return res.status(statusCode).json({
                EC: result.EC,
                EM: result.EM
            });
        }

        return res.status(200).json(result);
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

        const result = await updateCartService(email, productId, quantity);
        if (result.EC !== 0) {
            let statusCode = 400;
            if (result.EC === 4 || result.EC === 5) statusCode = 404;
            return res.status(statusCode).json({
                EC: result.EC,
                EM: result.EM
            });
        }

        return res.status(200).json(result);
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

        const result = await removeFromCartService(email, productId);
        if (result.EC !== 0) {
            let statusCode = 400;
            if (result.EC === 2) statusCode = 404;
            return res.status(statusCode).json({
                EC: result.EC,
                EM: result.EM
            });
        }

        return res.status(200).json(result);
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

        const result = await clearCartService(email);
        return res.status(200).json(result);
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
