const Order = require('../models/order');
const Cart = require('../models/cart');
const Product = require('../models/product');

// Helper to auto-confirm "New" orders older than 30 minutes
const checkAutoConfirm = async (orders) => {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    let updated = false;

    // Handle single order or array
    const ordersArray = Array.isArray(orders) ? orders : [orders];

    for (let order of ordersArray) {
        if (order.status === 'New' && order.orderedAt <= thirtyMinutesAgo) {
            order.status = 'Confirmed';
            order.statusHistory.push({
                status: 'Confirmed',
                changedAt: new Date(),
                note: 'Đơn hàng tự động xác nhận sau 30 phút đặt thành công'
            });
            await order.save();
            updated = true;
        }
    }
    return updated;
};

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

        // Get user's cart
        const cart = await Cart.findOne({ userEmail: email }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ EC: 3, EM: 'Giỏ hàng của bạn đang trống, không thể thanh toán' });
        }

        // Check stock availability & construct order items
        const orderItems = [];
        let totalAmount = 0;

        for (let item of cart.items) {
            const product = item.product;
            if (!product) {
                return res.status(404).json({ EC: 4, EM: 'Có sản phẩm trong giỏ hàng không tồn tại' });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    EC: 5,
                    EM: `Sản phẩm "${product.name}" hiện chỉ còn ${product.stock} sản phẩm trong kho. Không đủ đáp ứng số lượng đặt mua (${item.quantity}).`
                });
            }

            const itemPrice = product.price; // Or product.price * (1 - product.discountPercentage/100) if we want to support discounts
            const itemTotal = itemPrice * item.quantity;
            totalAmount += itemTotal;

            orderItems.push({
                product: product._id,
                name: product.name,
                price: itemPrice,
                quantity: item.quantity,
                image: product.images && product.images[0] ? product.images[0] : ''
            });
        }

        // Create the Order
        const newOrder = new Order({
            userEmail: email,
            items: orderItems,
            recipientName,
            phoneNumber,
            shippingAddress,
            totalAmount,
            paymentMethod: 'COD',
            status: 'New',
            orderedAt: new Date(),
            statusHistory: [{
                status: 'New',
                changedAt: new Date(),
                note: 'Đơn hàng mới được đặt thành công'
            }]
        });

        await newOrder.save();

        // Update product stock and soldCount
        for (let item of cart.items) {
            const product = await Product.findById(item.product._id);
            if (product) {
                product.stock -= item.quantity;
                product.soldCount += item.quantity;
                await product.save();
            }
        }

        // Clear cart
        cart.items = [];
        await cart.save();

        return res.status(200).json({
            EC: 0,
            DT: newOrder,
            EM: 'Đặt hàng thành công!'
        });

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

        let orders = await Order.find({ userEmail: email }).sort({ orderedAt: -1 });

        // Auto confirm any New orders older than 30 mins
        await checkAutoConfirm(orders);

        // Fetch again to return updated statuses
        orders = await Order.find({ userEmail: email }).sort({ orderedAt: -1 });

        return res.status(200).json({
            EC: 0,
            DT: orders
        });
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

        let order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ EC: 2, EM: 'Không tìm thấy đơn hàng' });
        }

        // Ensure user can only access their own order
        if (order.userEmail !== email) {
            return res.status(403).json({ EC: 3, EM: 'Bạn không có quyền xem đơn hàng này' });
        }

        // Apply auto-confirm check
        await checkAutoConfirm(order);
        order = await Order.findById(id);

        return res.status(200).json({
            EC: 0,
            DT: order
        });
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

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ EC: 2, EM: 'Không tìm thấy đơn hàng' });
        }

        if (order.userEmail !== email) {
            return res.status(403).json({ EC: 3, EM: 'Bạn không có quyền thực hiện thao tác trên đơn hàng này' });
        }

        // Enforce the 30-minute limit
        const timeDiffMs = Date.now() - order.orderedAt.getTime();
        const minutesDiff = timeDiffMs / (1000 * 60);

        if (minutesDiff > 30) {
            return res.status(400).json({
                EC: 4,
                EM: 'Đơn hàng đã đặt quá 30 phút, bạn không thể hủy đơn hàng này.'
            });
        }

        // Cancel options based on status
        if (order.status === 'New' || order.status === 'Confirmed') {
            // Cancel immediately
            order.status = 'Canceled';
            order.statusHistory.push({
                status: 'Canceled',
                changedAt: new Date(),
                note: 'Khách hàng hủy đơn hàng trong vòng 30 phút đặt đơn'
            });

            // Restore product stock and decrease sold count
            for (let item of order.items) {
                const product = await Product.findById(item.product);
                if (product) {
                    product.stock += item.quantity;
                    product.soldCount = Math.max(0, product.soldCount - item.quantity);
                    await product.save();
                }
            }

            await order.save();
            return res.status(200).json({
                EC: 0,
                DT: order,
                EM: 'Hủy đơn hàng thành công!'
            });

        } else if (order.status === 'Preparing') {
            // Change status to CancelRequested
            order.status = 'CancelRequested';
            order.statusHistory.push({
                status: 'CancelRequested',
                changedAt: new Date(),
                note: 'Gửi yêu cầu hủy đơn hàng cho shop (do đơn đang chuẩn bị)'
            });

            await order.save();
            return res.status(200).json({
                EC: 0,
                DT: order,
                EM: 'Gửi yêu cầu hủy đơn cho shop thành công!'
            });
        } else {
            return res.status(400).json({
                EC: 5,
                EM: `Không thể hủy đơn hàng do đang ở trạng thái "${order.status}"`
            });
        }

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
