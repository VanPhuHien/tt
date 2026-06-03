import React, { useContext, useEffect, useState, useRef } from 'react';
import { getOrdersApi, cancelOrderApi } from '../util/api';
import { AuthContext } from '../components/context/auth.context';
import { Clock, ShieldAlert, Package, CheckCircle, Truck, FileText, XCircle, ChevronRight, Ban, RefreshCw } from 'lucide-react';
import { Spin, notification } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';

// Order Status Mapper to Stepper Index (1 to 5)
const getStepIndex = (status) => {
    switch (status) {
        case 'New': return 1;
        case 'Confirmed': return 2;
        case 'Preparing': return 3;
        case 'Delivering': return 4;
        case 'Delivered': return 5;
        case 'CancelRequested': return 3; // Positioned around preparing
        case 'Canceled': return 0;
        default: return 1;
    }
};

const getStatusLabel = (status) => {
    switch (status) {
        case 'New': return 'Đơn hàng mới';
        case 'Confirmed': return 'Đã xác nhận';
        case 'Preparing': return 'Shop đang chuẩn bị hàng';
        case 'Delivering': return 'Đang giao hàng';
        case 'Delivered': return 'Đã giao thành công';
        case 'Canceled': return 'Đơn hàng đã hủy';
        case 'CancelRequested': return 'Yêu cầu hủy đơn đang xử lý';
        default: return status;
    }
};

const getStatusColorClass = (status) => {
    switch (status) {
        case 'New': return 'text-primary bg-primary/10 border-primary/20';
        case 'Confirmed': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
        case 'Preparing': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
        case 'Delivering': return 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20';
        case 'Delivered': return 'text-green-400 bg-green-400/10 border-green-400/20';
        case 'Canceled': return 'text-red-400 bg-red-400/10 border-red-400/20';
        case 'CancelRequested': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
        default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
};

// Countdown Timer Component for 30m cancellation limit
const CancelCountdownTimer = ({ orderedAt, orderStatus, onTimerExpire }) => {
    const [timeLeftStr, setTimeLeftStr] = useState('');
    const [isExpired, setIsExpired] = useState(false);
    const intervalRef = useRef(null);

    useEffect(() => {
        const updateTimer = () => {
            const limitMs = 30 * 60 * 1000; // 30 minutes
            const orderTimeMs = new Date(orderedAt).getTime();
            const elapsedMs = Date.now() - orderTimeMs;
            const remainingMs = limitMs - elapsedMs;

            if (remainingMs <= 0) {
                setTimeLeftStr('Đã hết hạn hủy (30 phút)');
                setIsExpired(true);
                clearInterval(intervalRef.current);
                if (onTimerExpire) onTimerExpire();
            } else {
                const minutes = Math.floor(remainingMs / (1000 * 60));
                const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
                setTimeLeftStr(`${minutes} phút ${seconds} giây còn lại để hủy`);
            }
        };

        updateTimer();
        intervalRef.current = setInterval(updateTimer, 1000);

        return () => clearInterval(intervalRef.current);
    }, [orderedAt]);

    if (isExpired || ['Delivering', 'Delivered', 'Canceled'].includes(orderStatus)) {
        return (
            <span className="text-xs text-gray-500 font-medium">
                ⏱️ Hết thời gian hủy đơn tự do (Quá 30 phút)
            </span>
        );
    }

    return (
        <span className="text-xs font-bold text-secondary flex items-center gap-1.5 shadow-secondary/10 drop-shadow-[0_0_6px_rgba(255,0,234,0.3)] animate-pulse">
            <Clock className="w-3.5 h-3.5 text-secondary" /> {timeLeftStr}
        </span>
    );
};

export const OrderHistoryList = ({ onSelectOrder, selectedOrderId }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await getOrdersApi();
            if (res && res.EC === 0) {
                setOrders(res.DT || []);
            }
        } catch (error) {
            console.error("Error fetching order history:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    if (loading) return <div className="p-10 text-center"><Spin /></div>;
    if (orders.length === 0) {
        return (
            <div className="glass-card p-10 text-center border-white/5">
                <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Bạn chưa có đơn hàng nào</h3>
                <p className="text-gray-400 mb-6 text-sm">Hãy sắm ngay những món đồ công nghệ ưa thích của bạn.</p>
                <Link to="/" className="btn-primary py-2.5 px-6 text-sm">Mua sắm ngay</Link>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-white">Lịch sử đơn hàng ({orders.length})</h3>
                <button 
                    onClick={fetchOrders} 
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
                    title="Làm mới lịch sử"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {orders.map((order) => {
                    const isSelected = order._id === selectedOrderId;
                    return (
                        <div 
                            key={order._id}
                            onClick={() => onSelectOrder(order._id)}
                            className={`glass-card p-5 border cursor-pointer relative overflow-hidden transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                                isSelected ? 'border-primary bg-primary/5 shadow-[0_0_15px_rgba(0,242,255,0.05)]' : 'border-white/5 hover:border-white/10'
                            }`}
                        >
                            {/* Blue left bar for selected */}
                            {isSelected && <div className="absolute left-0 top-0 w-[4px] h-full bg-primary"></div>}

                            <div className="space-y-2 min-w-0">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block font-mono">
                                        #{order._id.substring(order._id.length - 8).toUpperCase()}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {new Date(order.orderedAt).toLocaleString('vi-VN')}
                                    </span>
                                </div>
                                <h4 className="font-bold text-white text-sm line-clamp-1">
                                    {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                </h4>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-gray-400">
                                        Tổng tiền: <span className="text-white font-bold">${order.totalAmount.toLocaleString()}</span>
                                    </span>
                                    <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-400 border border-white/5 font-bold">
                                        {order.paymentMethod}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 self-end md:self-center">
                                <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${getStatusColorClass(order.status)}`}>
                                    {getStatusLabel(order.status)}
                                </span>
                                <ChevronRight className="w-5 h-5 text-gray-600 hidden md:block" />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export const OrderTracker = ({ orderId, onActionComplete }) => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (!orderId) return;
            try {
                setLoading(true);
                const res = await getOrdersApi();
                if (res && res.EC === 0) {
                    const matched = res.DT.find(o => o._id === orderId);
                    setOrder(matched || null);
                }
            } catch (err) {
                console.error("Error fetching order details:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId, refreshTrigger]);

    const handleCancel = async () => {
        if (!order) return;
        
        try {
            setSubmitting(true);
            const res = await cancelOrderApi(order._id);
            if (res && res.EC === 0) {
                notification.success({
                    message: res.EM || 'Thao tác thành công!'
                });
                setRefreshTrigger(prev => prev + 1);
                if (onActionComplete) onActionComplete();
            } else {
                notification.error({
                    message: 'Không thể thực hiện',
                    description: res.EM || 'Có lỗi xảy ra.'
                });
            }
        } catch (error) {
            console.error("Error canceling order:", error);
        } finally {
            setSubmitting(false);
        }
    };

    if (!orderId) {
        return (
            <div className="glass-card p-10 text-center border-white/5 h-full flex flex-col items-center justify-center min-h-[300px]">
                <Package className="w-12 h-12 text-gray-600 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Chọn đơn hàng cần theo dõi</h3>
                <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
                    Vui lòng chọn một đơn hàng từ danh sách bên trái để xem tiến độ giao hàng và thông tin chi tiết.
                </p>
            </div>
        );
    }

    if (loading) return <div className="p-10 text-center"><Spin /></div>;
    if (!order) return <div className="p-10 text-center text-white">Không tìm thấy đơn hàng.</div>;

    const currentStep = getStepIndex(order.status);
    const steps = [
        { label: 'Đơn mới', icon: FileText, desc: 'Đã tiếp nhận' },
        { label: 'Xác nhận', icon: CheckCircle, desc: 'Đã duyệt đơn' },
        { label: 'Chuẩn bị', icon: Package, desc: 'Đang xếp hàng' },
        { label: 'Đang giao', icon: Truck, desc: 'Shipper đã lấy' },
        { label: 'Đã nhận', icon: CheckCircle, desc: 'Thành công' }
    ];

    // Enforce 30m cancel buttons
    const elapsed = Date.now() - new Date(order.orderedAt).getTime();
    const canCancel = elapsed < 30 * 60 * 1000 && ['New', 'Confirmed', 'Preparing'].includes(order.status);

    return (
        <div className="glass-card p-8 border-white/5 space-y-8 h-full">
            {/* Header section */}
            <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block font-mono mb-1">
                        MÃ ĐƠN HÀNG: #{order._id.toUpperCase()}
                    </span>
                    <h2 className="text-xl font-extrabold text-white">
                        Đặt ngày: {new Date(order.orderedAt).toLocaleString('vi-VN')}
                    </h2>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${getStatusColorClass(order.status)}`}>
                        {getStatusLabel(order.status)}
                    </span>
                    
                    {/* Live Cancel Countdown */}
                    {canCancel && (
                        <CancelCountdownTimer 
                            orderedAt={order.orderedAt} 
                            orderStatus={order.status}
                            onTimerExpire={() => setRefreshTrigger(prev => prev + 1)}
                        />
                    )}
                </div>
            </div>

            {/* Stepper Progress bar */}
            {order.status !== 'Canceled' && order.status !== 'CancelRequested' ? (
                <div className="py-6">
                    <div className="relative flex flex-col md:flex-row justify-between items-center gap-8 md:gap-4">
                        {/* Connecting Line (Desktop) */}
                        <div className="absolute top-[22px] left-[5%] right-[5%] h-[4px] bg-white/10 hidden md:block z-0">
                            <motion.div 
                                className="h-full bg-primary" 
                                initial={{ width: '0%' }}
                                animate={{ width: `${((currentStep - 1) / 4) * 100}%` }}
                                transition={{ duration: 0.8 }}
                            />
                        </div>

                        {steps.map((step, idx) => {
                            const stepNum = idx + 1;
                            const isActive = stepNum <= currentStep;
                            const isCurrent = stepNum === currentStep;
                            const IconComponent = step.icon;

                            return (
                                <div key={idx} className="relative z-10 flex flex-row md:flex-col items-center gap-4 md:gap-3 flex-1 text-left md:text-center w-full md:w-auto">
                                    {/* Circle Icon */}
                                    <div 
                                        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                                            isActive 
                                                ? isCurrent
                                                    ? 'bg-primary border-primary text-dark shadow-[0_0_15px_rgba(0,242,255,0.6)]'
                                                    : 'bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(0,242,255,0.2)]'
                                                : 'bg-white/5 border-white/10 text-gray-500'
                                        }`}
                                    >
                                        <IconComponent className="w-5 h-5" />
                                    </div>

                                    {/* Text Info */}
                                    <div>
                                        <h4 className={`text-sm font-extrabold transition-colors duration-500 ${isActive ? 'text-white' : 'text-gray-500'}`}>
                                            {step.label}
                                        </h4>
                                        <p className="text-[10px] text-gray-500 font-medium mt-0.5">{step.desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-center space-y-3">
                    {order.status === 'Canceled' ? (
                        <>
                            <XCircle className="w-12 h-12 text-red-500 mx-auto" />
                            <h3 className="text-lg font-bold text-white">Đơn hàng đã bị hủy</h3>
                            <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                                Đơn hàng này đã bị hủy. Tất cả số lượng sản phẩm tương ứng đã được hoàn trả lại kho hàng.
                            </p>
                        </>
                    ) : (
                        <>
                            <ShieldAlert className="w-12 h-12 text-orange-400 mx-auto animate-bounce" />
                            <h3 className="text-lg font-bold text-white">Đang gửi yêu cầu hủy đơn</h3>
                            <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                                Bạn đã gửi yêu cầu hủy đơn hàng (do đơn đã được chuẩn bị). Shop đang xử lý duyệt yêu cầu của bạn.
                            </p>
                        </>
                    )}
                </div>
            )}

            {/* Recipient Details & Items summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-b border-white/10 py-6">
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Thông tin giao nhận</h3>
                    <div className="space-y-2 text-sm text-gray-300">
                        <p><span className="text-gray-500 font-medium">Người nhận:</span> <span className="text-white font-bold">{order.recipientName}</span></p>
                        <p><span className="text-gray-500 font-medium">Điện thoại:</span> <span className="text-white font-bold">{order.phoneNumber}</span></p>
                        <p><span className="text-gray-500 font-medium">Địa chỉ:</span> <span className="text-white font-bold">{order.shippingAddress}</span></p>
                        <p><span className="text-gray-500 font-medium">Thanh toán:</span> <span className="text-white font-bold">COD (Khi nhận hàng)</span></p>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Sản phẩm đặt mua</h3>
                    <div className="space-y-3">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/5 rounded-lg border border-white/10 p-1 flex items-center justify-center">
                                        <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain rounded" />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-xs font-bold text-white line-clamp-1">{item.name}</h4>
                                        <span className="text-[10px] text-gray-500">{item.quantity} x ${item.price.toLocaleString()}</span>
                                    </div>
                                </div>
                                <span className="text-xs font-extrabold text-white">${(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Total and Cancel button */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                <div>
                    <span className="text-xs text-gray-500 block">Tổng số tiền thanh toán</span>
                    <span className="text-2xl font-extrabold text-primary shadow-primary/20 drop-shadow-[0_0_8px_rgba(0,242,255,0.4)]">
                        ${order.totalAmount.toLocaleString()}
                    </span>
                </div>

                {canCancel && (
                    <button 
                        onClick={handleCancel}
                        disabled={submitting}
                        className={`btn-primary px-8 py-3.5 text-sm font-bold flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50 ${
                            order.status === 'Preparing' 
                                ? 'bg-orange-500 text-white hover:shadow-orange-500/20 border-orange-500/10'
                                : 'bg-red-600 text-white hover:shadow-red-600/20 border-red-600/10'
                        }`}
                    >
                        {submitting ? (
                            <>
                                <Spin size="small" /> Đang xử lý...
                            </>
                        ) : order.status === 'Preparing' ? (
                            <>
                                <ShieldAlert className="w-4 h-4" /> Gửi Yêu Cầu Hủy Đơn
                            </>
                        ) : (
                            <>
                                <Ban className="w-4 h-4" /> Hủy Đơn Hàng Ngay
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Status History Timeline */}
            <div className="space-y-4 pt-4 border-t border-white/10">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nhật ký trạng thái</h3>
                <div className="space-y-3 relative pl-4 border-l border-white/10">
                    {order.statusHistory.map((history, idx) => (
                        <div key={idx} className="relative text-xs space-y-1">
                            {/* Bullet */}
                            <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary border-2 border-dark shadow-[0_0_5px_rgba(0,242,255,0.5)]"></div>
                            
                            <div className="flex justify-between text-[10px] text-gray-500">
                                <span>{new Date(history.changedAt).toLocaleString('vi-VN')}</span>
                                <span className="font-bold text-gray-400">{getStatusLabel(history.status)}</span>
                            </div>
                            <p className="text-gray-300 leading-relaxed font-medium">{history.note}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const OrdersPage = () => {
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    return (
        <div className="pt-32 pb-20 min-h-screen bg-dark container mx-auto px-6">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-10 tracking-tight flex items-center gap-3">
                Theo Dõi Đơn Hàng
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-1">
                    <OrderHistoryList 
                        onSelectOrder={(id) => setSelectedOrderId(id)} 
                        selectedOrderId={selectedOrderId} 
                    />
                </div>
                <div className="lg:col-span-2">
                    <OrderTracker 
                        orderId={selectedOrderId} 
                        onActionComplete={() => {}}
                    />
                </div>
            </div>
        </div>
    );
};

export default OrdersPage;
export { OrdersPage };
