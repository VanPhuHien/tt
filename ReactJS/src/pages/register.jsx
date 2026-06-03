import React, { useState } from 'react';
import { notification } from 'antd';
import { sendOTPForRegistrationApi, verifyOTPAndRegisterApi } from '../util/api';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Lock, UserPlus, Cpu, Shield, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', otp: '' });
    const [tempData, setTempData] = useState({ name: '', email: '', password: '' });

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setOtpLoading(true);
        const { name, email, password } = formData;

        const res = await sendOTPForRegistrationApi(name, email, password);

        if (res && res.EC === 0) {
            notification.success({
                message: "Đã Gửi OTP",
                description: "Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra email."
            });
            setTempData({ name, email, password });
            setOtpSent(true);
        } else {
            notification.error({
                message: "Gửi OTP Thất Bại",
                description: res?.EM ?? "Đã xảy ra lỗi, vui lòng thử lại."
            })
        }
        setOtpLoading(false);
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { otp } = formData;

        const res = await verifyOTPAndRegisterApi(tempData.name, tempData.email, tempData.password, otp);

        if (res && res.EC === 0) {
            notification.success({
                message: "Đăng Ký Thành Công",
                description: "Tài khoản của bạn đã được tạo thành công!"
            });
            navigate("/login");
        } else {
            notification.error({
                message: "Xác Thực OTP Thất Bại",
                description: res?.EM ?? "Đã xảy ra lỗi, vui lòng thử lại."
            })
        }
        setLoading(false);
    };

    const handleResendOTP = async () => {
        setOtpLoading(true);
        const res = await sendOTPForRegistrationApi(tempData.name, tempData.email, tempData.password);

        if (res && res.EC === 0) {
            notification.success({
                message: "Đã Gửi Lại OTP",
                description: "Mã OTP mới đã được gửi đến email của bạn."
            });
        } else {
            notification.error({
                message: "Gửi Lại OTP Thất Bại",
                description: res?.EM ?? "Đã xảy ra lỗi, vui lòng thử lại."
            })
        }
        setOtpLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden bg-dark">
            {/* Background Orbs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 blur-[120px] -ml-48 -mt-48 rounded-full"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 blur-[120px] -mr-48 -mb-48 rounded-full"></div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
                        <div className="p-3 rounded-2xl bg-primary/20 group-hover:bg-primary/30 transition-all">
                            <Cpu className="w-8 h-8 text-primary" />
                        </div>
                        <span className="text-2xl font-bold tracking-tighter text-white">
                            CYBER<span className="text-primary">STORE</span>
                        </span>
                    </Link>
                    <h2 className="text-3xl font-bold text-white mb-2">Đăng Ký Tài Khoản</h2>
                    <p className="text-gray-400">Tham gia cộng đồng mua sắm thiết bị công nghệ hàng đầu</p>
                </div>

                <div className="glass-card p-8 border-white/5">
                    {!otpSent ? (
                        <form onSubmit={handleSendOTP} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Họ và Tên</label>
                                <div className="relative group">
                                    <input 
                                        type="text" 
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-11 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                        placeholder="Nguyễn Văn A"
                                    />
                                    <User className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Địa Chỉ Email</label>
                                <div className="relative group">
                                    <input 
                                        type="email" 
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-11 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                        placeholder="nhap-email@example.com"
                                    />
                                    <Mail className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Mật Khẩu</label>
                                <div className="relative group">
                                    <input 
                                        type="password" 
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-11 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                        placeholder="••••••••"
                                    />
                                    <Lock className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={otpLoading}
                                className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {otpLoading ? "Đang gửi OTP..." : (
                                    <>
                                        <Shield className="w-5 h-5" />
                                        Gửi OTP Xác Thực
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOTP} className="space-y-6">
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
                                    <Shield className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Xác Thực Email</h3>
                                <p className="text-gray-400 text-sm">
                                    Mã OTP đã được gửi đến <span className="text-primary font-bold">{tempData.email}</span>
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Mã OTP</label>
                                <div className="relative group">
                                    <input 
                                        type="text" 
                                        required
                                        maxLength={6}
                                        value={formData.otp}
                                        onChange={(e) => setFormData({...formData, otp: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-11 text-white text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                        placeholder="000000"
                                    />
                                    <Shield className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Đang xác thực..." : (
                                    <>
                                        <UserPlus className="w-5 h-5" />
                                        Xác Thực & Đăng Ký
                                    </>
                                )}
                            </button>

                            <button 
                                type="button"
                                onClick={handleResendOTP}
                                disabled={otpLoading}
                                className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {otpLoading ? "Đang gửi lại..." : (
                                    <>
                                        <RefreshCw className="w-4 h-4" />
                                        Gửi Lại OTP
                                    </>
                                )}
                            </button>

                            <button 
                                type="button"
                                onClick={() => {
                                    setOtpSent(false);
                                    setFormData({ name: '', email: '', password: '', otp: '' });
                                }}
                                className="w-full text-gray-400 hover:text-white py-2 text-sm transition-colors"
                            >
                                Quay lại nhập thông tin
                            </button>
                        </form>
                    )}

                    <div className="mt-8 pt-8 border-t border-white/5 text-center">
                        <p className="text-gray-400 text-sm">
                            Đã có tài khoản? <Link to="/login" className="text-primary font-bold hover:underline">Đăng nhập tại đây</Link>
                        </p>
                    </div>
                </div>

                <Link to="/" className="flex items-center justify-center gap-2 text-gray-500 hover:text-white transition-colors mt-8 text-sm group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Quay lại Trang Chủ
                </Link>
            </motion.div>
        </div>
    );
};

export default RegisterPage;