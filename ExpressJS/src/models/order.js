const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    image: {
        type: String
    }
});

const statusHistorySchema = new mongoose.Schema({
    status: {
        type: String,
        required: true
    },
    changedAt: {
        type: Date,
        default: Date.now
    },
    note: {
        type: String
    }
});

const orderSchema = new mongoose.Schema({
    userEmail: {
        type: String,
        required: true,
        index: true
    },
    items: [orderItemSchema],
    recipientName: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    shippingAddress: {
        type: String,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true,
        default: 'COD',
        enum: ['COD']
    },
    status: {
        type: String,
        required: true,
        default: 'New',
        enum: ['New', 'Confirmed', 'Preparing', 'Delivering', 'Delivered', 'Canceled', 'CancelRequested']
    },
    orderedAt: {
        type: Date,
        default: Date.now
    },
    statusHistory: [statusHistorySchema]
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
