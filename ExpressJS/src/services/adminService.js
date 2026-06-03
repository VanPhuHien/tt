const Order = require('../models/order');
const Product = require('../models/product');

// Helper to auto-confirm "New" orders older than 30 minutes
const checkAutoConfirm = async (orders) => {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    let updated = false;

    for (let order of orders) {
        if (order.status === 'New' && order.orderedAt <= thirtyMinutesAgo) {
            order.status = 'Confirmed';
            order.statusHistory.push({
                status: 'Confirmed',
                changedAt: new Date(),
                note: 'Đơn hàng tự động xác nhận sau 30 phút đặt thành công (Admin check)'
            });
            await order.save();
            updated = true;
        }
    }
    return updated;
};

const getAllOrdersService = async () => {
    try {
        let orders = await Order.find({}).sort({ orderedAt: -1 });

        // Apply auto-confirm check
        await checkAutoConfirm(orders);
        
        // Fetch again to reflect changes
        orders = await Order.find({}).sort({ orderedAt: -1 });

        return {
            EC: 0,
            DT: orders
        };
    } catch (error) {
        throw error;
    }
};

const updateOrderStatusService = async (id, status) => {
    try {
        const validStatuses = ['New', 'Confirmed', 'Preparing', 'Delivering', 'Delivered', 'Canceled', 'CancelRequested'];
        if (!validStatuses.includes(status)) {
            return { EC: 1, EM: 'Trạng thái không hợp lệ' };
        }

        const order = await Order.findById(id);
        if (!order) {
            return { EC: 2, EM: 'Không tìm thấy đơn hàng' };
        }

        const oldStatus = order.status;
        if (oldStatus === status) {
            return { EC: 0, DT: order, EM: 'Trạng thái đơn hàng không thay đổi' };
        }

        // Core business logic: Stock restoration / deduction on status changes
        if (status === 'Canceled' && oldStatus !== 'Canceled') {
            // Restore product stocks
            for (let item of order.items) {
                const product = await Product.findById(item.product);
                if (product) {
                    product.stock += item.quantity;
                    product.soldCount = Math.max(0, product.soldCount - item.quantity);
                    await product.save();
                }
            }
        } else if (oldStatus === 'Canceled' && status !== 'Canceled') {
            // Re-deduct product stocks, check first
            for (let item of order.items) {
                const product = await Product.findById(item.product);
                if (!product || product.stock < item.quantity) {
                    return {
                        EC: 3,
                        EM: `Không thể chuyển trạng thái vì sản phẩm "${item.name}" không đủ hàng trong kho để cấp lại.`
                    };
                }
            }

            for (let item of order.items) {
                const product = await Product.findById(item.product);
                if (product) {
                    product.stock -= item.quantity;
                    product.soldCount += item.quantity;
                    await product.save();
                }
            }
        }

        order.status = status;
        order.statusHistory.push({
            status: status,
            changedAt: new Date(),
            note: `Cập nhật trạng thái thủ công bởi Admin/Shop`
        });

        await order.save();

        return {
            EC: 0,
            DT: order,
            EM: `Đã cập nhật trạng thái đơn hàng sang "${status}" thành công!`
        };
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getAllOrdersService,
    updateOrderStatusService
};
