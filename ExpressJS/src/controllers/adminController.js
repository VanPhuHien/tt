const { getAllOrdersService, updateOrderStatusService } = require('../services/adminService');

const getAllOrders = async (req, res) => {
    try {
        const result = await getAllOrdersService();
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            EC: -1,
            EM: error.message
        });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const result = await updateOrderStatusService(id, status);
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

module.exports = {
    getAllOrders,
    updateOrderStatus
};
