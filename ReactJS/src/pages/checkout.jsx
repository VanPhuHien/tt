import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../components/context/auth.context';
import { getCartApi, createOrderApi } from '../util/api';
import { CreditCard, MapPin, Phone, User, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { Spin, notification } from 'antd';
import { motion } from 'framer-motion';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { auth, setCartCount } = useContext(AuthContext);
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form states
    const [recipientName, setRecipientName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [shippingAddress, setShippingAddress] = useState('');

    useEffect(() => {
        if (!auth.isAuthenticated) {
            navigate('/login');
            return;
        }

        const fetchCartData = async () => {
            try {
                setLoading(true);
                const res = await getCartApi();
                if (res && res.EC === 0 && res.DT) {
                    setCartItems(res.DT.items || []);
                    if (res.DT.items.length === 0) {
                        notification.warning({
                            message: 'Giỏ hàng trống',
                            description: 'Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán!'
                        });
                        navigate('/');
                    }
                }
            } catch (err) {
                console.error("Error fetching cart for checkout:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCartData();
    }, [auth.isAuthenticated]);

    const getCartTotal = () => {
        return cartItems.reduce((acc, item) => {
            const price = item.product?.price || 0;
            return acc + (price * item.quantity);
        }, 0);
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        if (!recipientName.trim() || !phoneNumber.trim() || !shippingAddress.trim()) {
            notification.error({
                message: 'Thiếu thông tin',
                description: 'Vui lòng điền đầy đủ Tên người nhận, Số điện thoại và Địa chỉ giao hàng.'
            });
            return;
        }

        try {
            setSubmitting(true);
            const res = await createOrderApi(recipientName, phoneNumber, shippingAddress);
            if (res && res.EC === 0) {
                notification.success({
                    message: 'Đặt hàng thành công!',
                    description: 'Đơn hàng của bạn đã được khởi tạo và đang ở trạng thái đơn hàng mới.'
                });
                
                // Clear global cart count
                setCartCount(0);

                // Navigate to account page and pass state to show the Orders tab
                navigate('/user', { state: { activeTab: 'orders' } });
            } else {
                notification.error({
                    message: 'Đặt hàng thất bại',
                    description: res.EM || 'Không thể tạo đơn đặt hàng.'
                });
            }
        } catch (error) {
            console.error("Error creating order:", error);
            notification.error({
                message: 'Lỗi hệ thống',
                description: 'Đã xảy ra lỗi khi tạo đơn hàng. Vui lòng thử lại sau.'
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center text-white bg-dark">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="pt-32 pb-20 min-h-screen bg-dark container mx-auto px-6">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-10 tracking-tight flex items-center gap-3">
                Thanh Toán Đơn Hàng
            </h1>

            <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left side: Information form & payment method */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Shipping Address Section */}
                    <div className="glass-card p-8 border-white/5 space-y-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-primary" /> Thông tin giao nhận hàng
                        </h2>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Tên người nhận hàng</label>
                                <div className="relative group">
                                    <input 
                                        type="text" 
                                        required
                                        value={recipientName}
                                        onChange={(e) => setRecipientName(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-11 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                        placeholder="Nhập họ và tên người nhận"
                                    />
                                    <User className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Số điện thoại liên lạc</label>
                                <div className="relative group">
                                    <input 
                                        type="tel" 
                                        required
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-11 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                        placeholder="Nhập số điện thoại"
                                    />
                                    <Phone className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Địa chỉ nhận hàng chi tiết</label>
                                <div className="relative group">
                                    <textarea 
                                        required
                                        rows={3}
                                        value={shippingAddress}
                                        onChange={(e) => setShippingAddress(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-11 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium custom-scrollbar"
                                        placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                                    />
                                    <MapPin className="w-5 h-5 text-gray-500 absolute left-4 top-4 group-focus-within:text-primary transition-colors" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Method Section (Mandatory COD) */}
                    <div className="glass-card p-8 border-white/5 space-y-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-secondary" /> Phương thức thanh toán
                        </h2>

                        <div className="relative overflow-hidden p-6 rounded-2xl bg-primary/5 border border-primary/40 shadow-[0_0_15px_rgba(0,242,255,0.1)] flex items-start gap-4">
                            <div className="p-2 bg-primary text-dark rounded-full flex-shrink-0">
                                <Check className="w-5 h-5 font-bold" />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-white text-lg">Thanh toán khi nhận hàng (COD)</h3>
                                <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                                    Phương thức thanh toán mặc định và bắt buộc đối với đơn hàng này. Bạn sẽ thanh toán trực tiếp số tiền đơn hàng bằng tiền mặt cho nhân viên giao hàng khi nhận được bưu kiện.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side: Summary Column */}
                <div>
                    <div className="glass-card p-8 border-white/5 space-y-6 sticky top-32">
                        <h2 className="text-xl font-bold text-white border-b border-white/10 pb-4">Giỏ hàng của bạn</h2>
                        
                        {/* Items summary list */}
                        <div className="max-h-64 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                            {cartItems.map((item) => (
                                <div key={item._id} className="flex gap-4 items-center">
                                    <div className="w-12 h-12 bg-white/5 rounded-lg border border-white/10 p-1 flex-shrink-0 flex items-center justify-center">
                                        <img 
                                            src={item.product?.images && item.product.images[0] ? item.product.images[0] : ''} 
                                            alt={item.product?.name} 
                                            className="max-w-full max-h-full object-contain rounded"
                                        />
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <h4 className="text-xs font-bold text-white line-clamp-1">{item.product?.name}</h4>
                                        <span className="text-[10px] text-gray-400 font-medium block mt-0.5">
                                            {item.quantity} x ${item.product?.price.toLocaleString()}
                                        </span>
                                    </div>
                                    <span className="text-sm font-bold text-white text-right">
                                        ${(item.product?.price * item.quantity).toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <hr className="border-white/10" />

                        {/* Prices recap */}
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-gray-400">
                                <span>Tạm tính</span>
                                <span className="text-white font-medium">${getCartTotal().toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-gray-400">
                                <span>Phí vận chuyển</span>
                                <span className="text-green-400 font-bold">Miễn phí</span>
                            </div>
                            <hr className="border-white/10" />
                            <div className="flex justify-between items-baseline">
                                <span className="text-white font-bold">Tổng thanh toán</span>
                                <span className="text-2xl font-extrabold text-primary shadow-primary/20 drop-shadow-[0_0_8px_rgba(0,242,255,0.4)]">
                                    ${getCartTotal().toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={submitting}
                            className="w-full btn-primary py-4 text-base font-bold flex items-center justify-center gap-3 shadow-lg shadow-primary/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <>
                                    <Spin size="small" /> Đang tạo đơn hàng...
                                </>
                            ) : (
                                <>
                                    Xác nhận đặt hàng (COD) <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>

                        <div className="text-center">
                            <Link to="/cart" className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-white transition-colors">
                                <ArrowLeft className="w-3.5 h-3.5" /> Quay lại giỏ hàng
                            </Link>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CheckoutPage;
