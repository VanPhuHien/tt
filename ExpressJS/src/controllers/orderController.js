const {
    createOrderService,
    getOrdersService,
    getOrderByIdService,
    cancelOrderService
} = require('../services/orderService');

const createOrder = async (req, res) => {
    try {
        const email = req.user?.email;
        const { recipientName, phoneNumber, shippingAddress } = req.body;

        if (!email) {
            return res.status(401).json({ EC: 1, EM: 'Unauthorized' });
        }

        if (!recipientName || !phoneNumber || !shippingAddress) {
            return res.status(400).json({ EC: 2, EM: 'Vui lòng điền đầy đủ Tên người nhận, Số điện thoại và Địa chỉ giao hàng' });
        }

        const result = await createOrderService(email, recipientName, phoneNumber, shippingAddress);
        if (result.EC !== 0) {
            let statusCode = 400;
            if (result.EC === 4) statusCode = 404;
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

const getOrders = async (req, res) => {
    try {
        const email = req.user?.email;
        if (!email) {
            return res.status(401).json({ EC: 1, EM: 'Unauthorized' });
        }

        const result = await getOrdersService(email);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            EC: -1,
            EM: error.message
        });
    }
};

const getOrderById = async (req, res) => {
    try {
        const email = req.user?.email;
        const { id } = req.params;

        if (!email) {
            return res.status(401).json({ EC: 1, EM: 'Unauthorized' });
        }

        const result = await getOrderByIdService(email, id);
        if (result.EC !== 0) {
            let statusCode = 400;
            if (result.EC === 2) statusCode = 404;
            if (result.EC === 3) statusCode = 403;
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

const cancelOrder = async (req, res) => {
    try {
        const email = req.user?.email;
        const { id } = req.params;

        if (!email) {
            return res.status(401).json({ EC: 1, EM: 'Unauthorized' });
        }

        const result = await cancelOrderService(email, id);
        if (result.EC !== 0) {
            let statusCode = 400;
            if (result.EC === 2) statusCode = 404;
            if (result.EC === 3) statusCode = 403;
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

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    cancelOrder
};
