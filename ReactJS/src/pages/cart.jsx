import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/context/auth.context';
import { getCartApi, updateCartApi, removeFromCartApi } from '../util/api';
import { ShoppingCart, Trash2, Minus, Plus, ArrowRight, ArrowLeft } from 'lucide-react';
import { Spin, notification } from 'antd';
import { motion } from 'framer-motion';

const CartPage = () => {
    const navigate = useNavigate();
    const { auth, setCartCount } = useContext(AuthContext);
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCart = async () => {
        if (!auth.isAuthenticated) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const res = await getCartApi();
            if (res && res.EC === 0 && res.DT) {
                setCartItems(res.DT.items || []);
                const count = res.DT.items.reduce((acc, item) => acc + item.quantity, 0);
                setCartCount(count);
            }
        } catch (error) {
            console.error("Error fetching cart:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, [auth.isAuthenticated]);

    const handleQuantityChange = async (productId, currentQty, increment) => {
        const newQty = currentQty + increment;
        if (newQty < 1) return;

        try {
            const res = await updateCartApi(productId, newQty);
            if (res && res.EC === 0) {
                setCartItems(res.DT.items);
                const count = res.DT.items.reduce((acc, item) => acc + item.quantity, 0);
                setCartCount(count);
            } else {
                notification.error({
                    message: 'Lỗi cập nhật',
                    description: res.EM || 'Không thể cập nhật số lượng.'
                });
            }
        } catch (error) {
            console.error("Error updating quantity:", error);
        }
    };

    const handleRemoveItem = async (productId, productName) => {
        try {
            const res = await removeFromCartApi(productId);
            if (res && res.EC === 0) {
                notification.success({
                    message: 'Đã xóa sản phẩm',
                    description: `Đã xóa "${productName}" khỏi giỏ hàng.`
                });
                setCartItems(res.DT.items);
                const count = res.DT.items.reduce((acc, item) => acc + item.quantity, 0);
                setCartCount(count);
            } else {
                notification.error({
                    message: 'Lỗi xóa sản phẩm',
                    description: res.EM
                });
            }
        } catch (error) {
            console.error("Error removing item:", error);
        }
    };

    const getCartTotal = () => {
        return cartItems.reduce((acc, item) => {
            const price = item.product?.price || 0;
            return acc + (price * item.quantity);
        }, 0);
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center text-white bg-dark">
                <Spin size="large" />
            </div>
        );
    }

    if (!auth.isAuthenticated) {
        return (
            <div className="pt-32 pb-20 min-h-screen bg-dark flex flex-col items-center justify-center container mx-auto px-6">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-10 max-w-md w-full text-center border-white/5"
                >
                    <div className="p-4 bg-primary/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 border border-primary/20">
                        <ShoppingCart className="w-10 h-10 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">Vui lòng đăng nhập</h2>
                    <p className="text-gray-400 mb-8 leading-relaxed">
                        Bạn cần đăng nhập tài khoản của mình để có thể xem và quản lý giỏ hàng của bạn.
                    </p>
                    <Link to="/login" className="w-full btn-primary py-3.5 text-base font-bold flex items-center justify-center gap-2">
                        Đăng nhập ngay <ArrowRight className="w-4 h-4" />
                    </Link>
                </motion.div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="pt-32 pb-20 min-h-screen bg-dark flex flex-col items-center justify-center container mx-auto px-6">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card p-10 max-w-lg w-full text-center border-white/5"
                >
                    <div className="p-4 bg-secondary/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 border border-secondary/20">
                        <ShoppingCart className="w-10 h-10 text-secondary" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">Giỏ hàng trống</h2>
                    <p className="text-gray-400 mb-8 leading-relaxed">
                        Bạn chưa thêm bất kỳ thiết bị công nghệ nào vào giỏ hàng của mình. Hãy quay lại trang chủ và chọn những món đồ ưng ý nhé!
                    </p>
                    <Link to="/" className="inline-flex items-center gap-2 btn-primary px-8 py-3.5 font-bold">
                        <ArrowLeft className="w-4 h-4" /> Tiếp tục mua sắm
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="pt-32 pb-20 min-h-screen bg-dark container mx-auto px-6">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-10 tracking-tight flex items-center gap-3">
                <ShoppingCart className="w-8 h-8 text-primary" /> Giỏ Hàng Của Bạn
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left: Cart Items list */}
                <div className="lg:col-span-2 space-y-6">
                    {cartItems.map((item) => {
                        const product = item.product;
                        if (!product) return null;
                        
                        return (
                            <motion.div 
                                key={item._id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-card p-6 border-white/5 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden group"
                            >
                                {/* Glow Effect */}
                                <div className="absolute top-0 left-0 w-[4px] h-full bg-primary/20 group-hover:bg-primary transition-all"></div>

                                {/* Product Image */}
                                <div className="w-24 h-24 rounded-2xl bg-white/5 p-2 border border-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                    <img 
                                        src={product.images && product.images[0] ? product.images[0] : ''} 
                                        alt={product.name} 
                                        className="max-w-full max-h-full object-contain rounded-lg"
                                    />
                                </div>

                                {/* Product Info */}
                                <div className="flex-grow text-center sm:text-left">
                                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">
                                        {product.category?.name || 'Gadget'}
                                    </span>
                                    <Link to={`/product/${product._id}`} className="text-lg font-bold text-white hover:text-primary transition-colors line-clamp-1">
                                        {product.name}
                                    </Link>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Đơn giá: <span className="text-white font-semibold">${product.price.toLocaleString()}</span>
                                    </p>
                                </div>

                                {/* Quantity Control */}
                                <div className="flex items-center gap-3 bg-white/5 p-1 rounded-xl border border-white/10">
                                    <button 
                                        onClick={() => handleQuantityChange(product._id, item.quantity, -1)}
                                        className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                        disabled={item.quantity <= 1}
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="w-8 text-center font-bold text-white">{item.quantity}</span>
                                    <button 
                                        onClick={() => handleQuantityChange(product._id, item.quantity, 1)}
                                        className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Subtotal */}
                                <div className="text-right min-w-[100px]">
                                    <span className="text-xs text-gray-500 block">Thành tiền</span>
                                    <span className="text-lg font-bold text-white">${(product.price * item.quantity).toLocaleString()}</span>
                                </div>

                                {/* Delete Button */}
                                <button 
                                    onClick={() => handleRemoveItem(product._id, product.name)}
                                    className="p-2.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-xl transition-all border border-red-500/20 cursor-pointer flex-shrink-0"
                                    title="Xóa khỏi giỏ hàng"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </motion.div>
                        );
                    })}

                    <div className="flex justify-between items-center pt-4">
                        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-primary transition-colors text-sm font-semibold">
                            <ArrowLeft className="w-4 h-4" /> Tiếp tục mua sắm
                        </Link>
                    </div>
                </div>

                {/* Right: Checkout Order Summary panel */}
                <div>
                    <div className="glass-card p-8 border-white/5 sticky top-32 space-y-6">
                        <h2 className="text-xl font-bold text-white border-b border-white/10 pb-4">Tóm tắt đơn hàng</h2>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between text-gray-400 text-sm">
                                <span>Tạm tính ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} món)</span>
                                <span className="text-white font-medium">${getCartTotal().toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-gray-400 text-sm">
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

                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-xs text-gray-400 leading-relaxed">
                            💡 Giao hàng nhanh toàn quốc. Hỗ trợ phương thức thanh toán **COD (Thanh toán khi nhận hàng)** bắt buộc, cực kỳ an toàn và tin cậy.
                        </div>

                        <button 
                            onClick={() => navigate('/checkout')}
                            className="w-full btn-primary py-4 text-base font-bold flex items-center justify-center gap-3 shadow-lg shadow-primary/20 cursor-pointer"
                        >
                            Tiến hành thanh toán <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
