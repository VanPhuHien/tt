require("dotenv").config();
const User = require("../models/user");
const OTP = require("../models/otp");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const { sendOTPEmail, sendForgotPasswordEmail } = require("./emailService");
const { generateOTP, getOTPExpiry, isOTPExpired } = require("./otpService");
const saltRounds = 10;

const createUserService = async (name, email, password) => {
    try {
        //check user exist
        const user = await User.findOne({ email: email });
        if (user) {
            console.log(`>>> user exist, chọn 1 email khác: ${email}`);
            return null;
        }

        //hash user password
        const hashPassword = await bcrypt.hash(password, saltRounds);
        //save user to database
        let result = await User.create({
            name: name,
            email: email,
            password: hashPassword,
            role: "User"
        })
        return result;

    } catch (error) {
        console.log(error);
        return null;
    }
}

const loginService = async (email1, password) => {
    try {
        //fetch user by email
        const user = await User.findOne({ email: email1 });
        if (user) {
            //compare password
            const isMatchPassword = await bcrypt.compare(password, user.password);
            if (!isMatchPassword) {
                return {
                    EC: 2,
                    EM: "Email/Password không hợp lệ"
                }
            } else {
                //create an access token
                const payload = {
                    email: user.email,
                    name: user.name
                }

                const access_token = jwt.sign(
                    payload,
                    process.env.JWT_SECRET,
                    {
                        expiresIn: process.env.JWT_EXPIRE
                    }
                )
                return {
                    EC: 0,
                    access_token,
                    user: {
                        email: user.email,
                        name: user.name
                    }
                };
            }
        } else {
            return {
                EC: 1,
                EM: "Email/Password không hợp lệ"
            }
        }

    } catch (error) {
        console.log(error);
        return null;
    }
}

const getUserService = async () => {
    try {
        let result = await User.find({}).select("-password");
        return result;

    } catch (error) {
        console.log(error);
        return null;
    }
}

const sendOTPForRegistration = async (name, email, password) => {
    try {
        const user = await User.findOne({ email: email });
        if (user) {
            return {
                EC: 1,
                EM: "Email đã được sử dụng"
            };
        }

        const otp = generateOTP();
        const otpExpiry = getOTPExpiry();

        // Delete any existing OTP for this email
        await OTP.deleteOne({ email: email, type: 'registration' });

        // Store OTP in OTP collection
        await OTP.create({
            email: email,
            otp: otp,
            expiry: otpExpiry,
            type: 'registration',
            name: name,
            password: password
        });

        const emailSent = await sendOTPEmail(email, otp);
        if (!emailSent) {
            // Clean up if email fails
            await OTP.deleteOne({ email: email, type: 'registration' });
            return {
                EC: 2,
                EM: "Không thể gửi email OTP"
            };
        }

        return {
            EC: 0,
            DT: {
                email
            }
        };
    } catch (error) {
        console.log(error);
        return {
            EC: 3,
            EM: "Đã xảy ra lỗi"
        };
    }
}

const verifyOTPAndRegister = async (name, email, password, otp) => {
    try {
        // Find OTP record for registration
        const otpRecord = await OTP.findOne({ 
            email: email, 
            type: 'registration',
            otp: otp
        });
        
        if (!otpRecord) {
            return {
                EC: 1,
                EM: "OTP không đúng hoặc không tìm thấy yêu cầu đăng ký"
            };
        }

        if (isOTPExpired(otpRecord.expiry)) {
            return {
                EC: 2,
                EM: "OTP đã hết hạn. Vui lòng gửi OTP lại."
            };
        }

        // Check if user already exists (double check)
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return {
                EC: 3,
                EM: "Email đã được sử dụng"
            };
        }

        // Hash the password
        const hashPassword = await bcrypt.hash(password, saltRounds);
        
        // Create user
        const user = await User.create({
            name: otpRecord.name,
            email: otpRecord.email,
            password: hashPassword,
            role: "User",
            isVerified: true
        });

        // Delete OTP record after successful registration
        await OTP.deleteOne({ email: email, type: 'registration' });

        return {
            EC: 0,
            DT: user,
            EM: "Đăng ký thành công"
        };
    } catch (error) {
        console.log(error);
        return {
            EC: 4,
            EM: "Đã xảy ra lỗi"
        };
    }
}

const sendOTPForForgotPassword = async (email) => {
    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            return {
                EC: 1,
                EM: "Email không tồn tại"
            };
        }

        const otp = generateOTP();
        const otpExpiry = getOTPExpiry();

        // Delete any existing OTP for this email
        await OTP.deleteOne({ email: email, type: 'forgot_password' });

        // Store OTP in OTP collection
        await OTP.create({
            email: email,
            otp: otp,
            expiry: otpExpiry,
            type: 'forgot_password'
        });

        const emailSent = await sendForgotPasswordEmail(email, otp);
        if (!emailSent) {
            // Clean up if email fails
            await OTP.deleteOne({ email: email, type: 'forgot_password' });
            return {
                EC: 2,
                EM: "Không thể gửi email OTP"
            };
        }

        return {
            EC: 0,
            EM: "Đã gửi OTP đến email của bạn"
        };
    } catch (error) {
        console.log(error);
        return {
            EC: 3,
            EM: "Đã xảy ra lỗi"
        };
    }
}

const verifyOTPAndResetPassword = async (email, otp, newPassword) => {
    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            return {
                EC: 1,
                EM: "Email không tồn tại"
            };
        }

        // Find OTP record for forgot password
        const otpRecord = await OTP.findOne({ 
            email: email, 
            type: 'forgot_password',
            otp: otp
        });

        if (!otpRecord) {
            return {
                EC: 2,
                EM: "OTP không đúng hoặc không tìm thấy yêu cầu đặt lại mật khẩu"
            };
        }

        if (isOTPExpired(otpRecord.expiry)) {
            return {
                EC: 3,
                EM: "OTP đã hết hạn"
            };
        }

        const hashPassword = await bcrypt.hash(newPassword, saltRounds);
        user.password = hashPassword;
        await user.save();

        // Delete OTP record after successful password reset
        await OTP.deleteOne({ email: email, type: 'forgot_password' });

        return {
            EC: 0,
            EM: "Đặt lại mật khẩu thành công"
        };
    } catch (error) {
        console.log(error);
        return {
            EC: 4,
            EM: "Đã xảy ra lỗi"
        };
    }
}

module.exports = {
    createUserService, loginService, getUserService,
    sendOTPForRegistration, verifyOTPAndRegister,
    sendOTPForForgotPassword, verifyOTPAndResetPassword
}