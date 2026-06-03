require("dotenv").config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendOTPEmail = async (email, otp) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Mã OTP xác thực tài khoản - CYBERSTORE',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">CYBERSTORE</h1>
                        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Xác thực tài khoản của bạn</p>
                    </div>
                    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
                        <p style="color: #333; font-size: 16px; line-height: 1.6;">
                            Chào bạn,<br><br>
                            Mã OTP xác thực tài khoản của bạn là:
                        </p>
                        <div style="background: white; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; border: 2px dashed #667eea;">
                            <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px;">${otp}</span>
                        </div>
                        <p style="color: #666; font-size: 14px; line-height: 1.6;">
                            Mã OTP này sẽ hết hạn sau <strong>5 phút</strong>.<br>
                            Vui lòng không chia sẻ mã này với bất kỳ ai.
                        </p>
                        <p style="color: #666; font-size: 14px; margin-top: 20px;">
                            Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.
                        </p>
                    </div>
                    <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
                        <p>© 2024 CYBERSTORE. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

const sendForgotPasswordEmail = async (email, otp) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Mã OTP đặt lại mật khẩu - CYBERSTORE',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">CYBERSTORE</h1>
                        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Đặt lại mật khẩu của bạn</p>
                    </div>
                    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
                        <p style="color: #333; font-size: 16px; line-height: 1.6;">
                            Chào bạn,<br><br>
                            Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.<br>
                            Mã OTP đặt lại mật khẩu là:
                        </p>
                        <div style="background: white; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; border: 2px dashed #f5576c;">
                            <span style="font-size: 32px; font-weight: bold; color: #f5576c; letter-spacing: 5px;">${otp}</span>
                        </div>
                        <p style="color: #666; font-size: 14px; line-height: 1.6;">
                            Mã OTP này sẽ hết hạn sau <strong>5 phút</strong>.<br>
                            Vui lòng không chia sẻ mã này với bất kỳ ai.
                        </p>
                        <p style="color: #666; font-size: 14px; margin-top: 20px;">
                            Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
                        </p>
                    </div>
                    <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
                        <p>© 2024 CYBERSTORE. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

module.exports = {
    sendOTPEmail,
    sendForgotPasswordEmail
};
