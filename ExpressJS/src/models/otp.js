const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    expiry: { type: Date, required: true },
    type: { type: String, required: true, enum: ['registration', 'forgot_password'] },
    // For registration type, store temporary data
    name: String,
    password: String,
});

const OTP = mongoose.model('otp', otpSchema);

module.exports = OTP;
