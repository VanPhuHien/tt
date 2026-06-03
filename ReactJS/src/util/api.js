import axios from './axios.customize';

const createUserApi = (name, email, password) => {
    const URL_API = "/v1/api/register";
    const data = { name, email, password };
    // Return only the response payload for consistency with other API calls
    return axios.post(URL_API, data).then(res => res.data);
}

const loginApi = (email, password) => {
    const URL_API = "/v1/api/login";
    const data = {
        email, password
    }
    return axios.post(URL_API, data)
}

const getUserApi = () => {
    const URL_API = "/v1/api/user";
    return axios.get(URL_API)
}

// Cart APIs
const getCartApi = () => {
    return axios.get("/v1/api/cart");
};

const addToCartApi = (productId, quantity = 1) => {
    return axios.post("/v1/api/cart", { productId, quantity });
};

const updateCartApi = (productId, quantity) => {
    return axios.put("/v1/api/cart", { productId, quantity });
};

const removeFromCartApi = (productId) => {
    return axios.delete(`/v1/api/cart/${productId}`);
};

const clearCartApi = () => {
    return axios.delete("/v1/api/cart");
};

// Order APIs
const createOrderApi = (recipientName, phoneNumber, shippingAddress) => {
    return axios.post("/v1/api/orders", { recipientName, phoneNumber, shippingAddress });
};

const getOrdersApi = () => {
    return axios.get("/v1/api/orders");
};

const getOrderByIdApi = (id) => {
    return axios.get(`/v1/api/orders/${id}`);
};

const cancelOrderApi = (id) => {
    return axios.put(`/v1/api/orders/${id}/cancel`);
};

// Admin Simulator APIs
const adminGetOrdersApi = () => {
    return axios.get("/v1/api/admin/orders");
};

const adminUpdateOrderStatusApi = (id, status) => {
    return axios.put(`/v1/api/admin/orders/${id}/status`, { status });
};

// OTP Registration APIs
const sendOTPForRegistrationApi = (name, email, password) => {
    return axios.post("/v1/api/register/send-otp", { name, email, password });
};

const verifyOTPAndRegisterApi = (name, email, password, otp) => {
    return axios.post("/v1/api/register/verify-otp", { name, email, password, otp });
};

// Forgot Password APIs
const sendOTPForForgotPasswordApi = (email) => {
    return axios.post("/v1/api/forgot-password/send-otp", { email });
};

const verifyOTPAndResetPasswordApi = (email, otp, newPassword) => {
    return axios.post("/v1/api/forgot-password/verify-otp", { email, otp, newPassword });
};

export {
    createUserApi,
    loginApi,
    getUserApi,
    getCartApi,
    addToCartApi,
    updateCartApi,
    removeFromCartApi,
    clearCartApi,
    createOrderApi,
    getOrdersApi,
    getOrderByIdApi,
    cancelOrderApi,
    adminGetOrdersApi,
    adminUpdateOrderStatusApi,
    sendOTPForRegistrationApi,
    verifyOTPAndRegisterApi,
    sendOTPForForgotPasswordApi,
    verifyOTPAndResetPasswordApi
}