const { createUserService, loginService, getUserService, sendOTPForRegistration, verifyOTPAndRegister, sendOTPForForgotPassword, verifyOTPAndResetPassword } = require("../services/userService");

const createUser = async (req, res) => {
    const { name, email, password } = req.body;
    const data = await createUserService(name, email, password);
    if (!data) {
        // Likely email already exists or internal error
        return res.status(200).json({ EC: 1, EM: 'Email đã được sử dụng hoặc tạo người dùng gặp lỗi.' });
    }
    // Successful creation
    return res.status(200).json({ EC: 0, DT: data });
};

const handleLogin = async (req, res) => {
    const { email, password } = req.body;
    const data = await loginService(email, password);

    return res.status(200).json(data)
}

const getUser = async (req, res) => {
    const data = await getUserService();
    return res.status(200).json(data)
}

const getAccount = async (req, res) => {
    return res.status(200).json(req.user)
}

const handleSendOTPForRegistration = async (req, res) => {
    const { name, email, password } = req.body;
    const data = await sendOTPForRegistration(name, email, password);
    return res.status(200).json(data);
}

const handleVerifyOTPAndRegister = async (req, res) => {
    const { name, email, password, otp } = req.body;
    const data = await verifyOTPAndRegister(name, email, password, otp);
    return res.status(200).json(data);
}

const handleSendOTPForForgotPassword = async (req, res) => {
    const { email } = req.body;
    const data = await sendOTPForForgotPassword(email);
    return res.status(200).json(data);
}

const handleVerifyOTPAndResetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    const data = await verifyOTPAndResetPassword(email, otp, newPassword);
    return res.status(200).json(data);
}

module.exports = {
    createUser, handleLogin, getUser, getAccount,
    handleSendOTPForRegistration, handleVerifyOTPAndRegister,
    handleSendOTPForForgotPassword, handleVerifyOTPAndResetPassword
}