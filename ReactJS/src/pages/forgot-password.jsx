import React, { useState } from 'react';
import { notification } from 'antd';
import { sendOTPForForgotPasswordApi, verifyOTPAndResetPasswordApi } from '../util/api';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, Key, RefreshCw, Cpu, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [formData, setFormData] = useState({ email: '', otp: '', newPassword: '' });
    const [email, setEmail] = useState('');

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setOtpLoading(true);
        const { email } = formData;

        const res = await sendOTPForForgotPasswordApi(email);

        if (res && res.EC === 0) {
            notification.success({
                message: "Đã Gửi OTP",
                description: "Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra email."
            });
            setEmail(email);
            setOtpSent(true);
        } else {
            notification.error({
                message: "Gửi OTP Thất Bại",
                description: res?.EM ?? "Đã xảy ra lỗi, vui lòng thử lại."
            })
        }
        setOtpLoading(false);
    };

    const handleVerifyOTPAndReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { otp, newPassword } = formData;

        const res = await verifyOTPAndResetPasswordApi(email, otp, newPassword);

        if (res && res.EC === 0) {
            notification.success({
                message: "Đặt Lại Mật Khẩu Thành Công",
                description: "Mật khẩu của bạn đã được đặt lại thành công!"
            });
            navigate("/login");
        } else {
            notification.error({
                message: "Đặt Lại Mật Khẩu Thất Bại",
                description: res?.EM ?? "Đã xảy ra lỗi, vui lòng thử lại."
            })
        }
        setLoading(false);
    };

    const handleResendOTP = async () => {
        setOtpLoading(true);
        const res = await sendOTPForForgotPasswordApi(email);

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
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[120px] -mr-48 -mt-48 rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 blur-[120px] -ml-48 -mb-48 rounded-full"></div>

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
                    <h2 className="text-3xl font-bold text-white mb-2">Quên Mật Khẩu</h2>
                    <p className="text-gray-400">Đặt lại mật khẩu của bạn bằng OTP</p>
                </div>

                <div className="glass-card p-8 border-white/5">
                    {!otpSent ? (
                        <form onSubmit={handleSendOTP} className="space-y-6">
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
                                    <Key className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Nhập Email Của Bạn</h3>
                                <p className="text-gray-400 text-sm">
                                    Chúng tôi sẽ gửi mã OTP đến email của bạn để đặt lại mật khẩu
                                </p>
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

                            <button 
                                type="submit" 
                                disabled={otpLoading}
                                className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {otpLoading ? "Đang gửi OTP..." : (
                                    <>
                                        <Key className="w-5 h-5" />
                                        Gửi OTP
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOTPAndReset} className="space-y-6">
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
                                    <Key className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Xác Thực & Đặt Lại</h3>
                                <p className="text-gray-400 text-sm">
                                    Mã OTP đã được gửi đến <span className="text-primary font-bold">{email}</span>
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
                                    <Key className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Mật Khẩu Mới</label>
                                <div className="relative group">
                                    <input 
                                        type="password" 
                                        required
                                        value={formData.newPassword}
                                        onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-11 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                        placeholder="••••••••"
                                    />
                                    <Lock className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Đang đặt lại..." : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        Đặt Lại Mật Khẩu
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
                                    setFormData({ email: '', otp: '', newPassword: '' });
                                }}
                                className="w-full text-gray-400 hover:text-white py-2 text-sm transition-colors"
                            >
                                Quay lại nhập email
                            </button>
                        </form>
                    )}

                    <div className="mt-8 pt-8 border-t border-white/5 text-center">
                        <p className="text-gray-400 text-sm">
                            Nhớ lại mật khẩu? <Link to="/login" className="text-primary font-bold hover:underline">Đăng nhập tại đây</Link>
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

export default ForgotPasswordPage;
