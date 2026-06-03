import React, { useEffect, useState, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../components/context/auth.context';
import { getUserApi, adminGetOrdersApi, adminUpdateOrderStatusApi } from '../util/api';
import { OrderHistoryList, OrderTracker } from './orders';
import { User, ShoppingBag, Layers, Cpu, Check, Package, Truck, ThumbsUp, Ban, RefreshCw, Star } from 'lucide-react';
import { Table, Spin, notification } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';

const getStatusBadgeClass = (status) => {
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

const getStatusLabelVN = (status) => {
    switch (status) {
        case 'New': return 'Đơn mới';
        case 'Confirmed': return 'Đã xác nhận';
        case 'Preparing': return 'Chuẩn bị hàng';
        case 'Delivering': return 'Đang giao hàng';
        case 'Delivered': return 'Giao thành công';
        case 'Canceled': return 'Đã hủy';
        case 'CancelRequested': return 'Yêu cầu hủy';
        default: return status;
    }
};

const UserPage = () => {
    const location = useLocation();
    const { auth } = useContext(AuthContext);
    
    // Set initial tab from navigation state if available
    const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'orders');
    
    // Profile states
    const [userList, setUserList] = useState([]);
    const [loadingProfile, setLoadingProfile] = useState(false);

    // Selected order for tracking tab
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    // Admin Simulator states
    const [allOrders, setAllOrders] = useState([]);
    const [loadingAdmin, setLoadingAdmin] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState(null);

    // Fetch user list (profile tab)
    const fetchUsers = async () => {
        try {
            setLoadingProfile(true);
            const res = await getUserApi();
            if (res && !res.message) {
                setUserList(res);
            }
        } catch (err) {
            console.error("Error fetching users:", err);
        } finally {
            setLoadingProfile(false);
        }
    };

    // Fetch all system orders for Admin Simulator
    const fetchAdminOrders = async () => {
        try {
            setLoadingAdmin(true);
            const res = await adminGetOrdersApi();
            if (res && res.EC === 0) {
                setAllOrders(res.DT || []);
            }
        } catch (err) {
            console.error("Error fetching admin simulator orders:", err);
        } finally {
            setLoadingAdmin(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'profile') {
            fetchUsers();
        } else if (activeTab === 'simulator') {
            fetchAdminOrders();
        }
    }, [activeTab]);



    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            setActionLoadingId(orderId);
            const res = await adminUpdateOrderStatusApi(orderId, newStatus);
            if (res && res.EC === 0) {
                notification.success({
                    message: 'Cập nhật thành công',
                    description: res.EM
                });
                fetchAdminOrders();
            } else {
                notification.error({
                    message: 'Lỗi cập nhật',
                    description: res.EM || 'Có lỗi xảy ra.'
                });
            }
        } catch (err) {
            console.error("Error simulating order status:", err);
        } finally {
            setActionLoadingId(null);
        }
    };

    const userColumns = [
        {
            title: 'Tên thành viên',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <span className="font-bold text-white">{text}</span>
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (text) => <span className="text-gray-300">{text}</span>
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            render: (text) => (
                <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                    text === 'Admin' ? 'bg-primary/20 text-primary border border-primary/20' : 'bg-white/5 text-gray-400 border border-white/5'
                }`}>
                    {text}
                </span>
            )
        }
    ];

    return (
        <div className="pt-32 pb-20 min-h-screen bg-dark container mx-auto px-6">
            {/* Page Title */}
            <div className="mb-10 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                    Trang Cá Nhân
                </h1>
                <p className="text-gray-400 mt-2">Quản lý tài khoản, theo dõi đơn hàng và giả lập quản lý hệ thống</p>
            </div>

            {/* Layout tabs */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left Sidebar Menu */}
                <div className="lg:col-span-1">
                    <div className="glass-card p-6 border-white/5 space-y-2 sticky top-32">

                        
                        <button 
                            onClick={() => setActiveTab('orders')}
                            className={`w-full py-3.5 px-4 rounded-xl flex items-center gap-3 font-bold text-sm transition-all cursor-pointer ${
                                activeTab === 'orders' 
                                    ? 'bg-primary text-dark shadow-[0_0_15px_rgba(0,242,255,0.3)]' 
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            <ShoppingBag className="w-5 h-5" /> Theo Dõi Đơn Hàng
                        </button>

                        <button 
                            onClick={() => setActiveTab('simulator')}
                            className={`w-full py-3.5 px-4 rounded-xl flex items-center gap-3 font-bold text-sm transition-all cursor-pointer ${
                                activeTab === 'simulator' 
                                    ? 'bg-secondary text-white shadow-[0_0_15px_rgba(255,0,234,0.3)] border border-secondary/20' 
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            <Layers className="w-5 h-5" /> Giả Lập Admin / Shop
                        </button>
                    </div>
                </div>

                {/* Right Content Panel */}
                <div className="lg:col-span-3">
                    <AnimatePresence mode="wait">
                        {/* TAB 1: PROFILE INFO & MEMBERS */}
                        {activeTab === 'profile' && (
                            <motion.div
                                key="profile"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-8"
                            >
                                {/* Active User Card */}
                                <div className="glass-card p-8 border-white/5 relative overflow-hidden flex flex-col md:flex-row items-center gap-6">
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 blur-[50px] -mr-10 -mt-10"></div>
                                    
                                    <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                                        <User className="w-10 h-10" />
                                    </div>
                                    <div className="flex-grow text-center md:text-left space-y-1">
                                        <div className="flex items-center justify-center md:justify-start gap-2">
                                            <h2 className="text-2xl font-bold text-white">{auth.user.name || 'Member'}</h2>
                                            <span className="bg-primary/20 text-primary border border-primary/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                                Active Account
                                            </span>
                                        </div>
                                        <p className="text-gray-400 font-medium">{auth.user.email}</p>
                                    </div>
                                </div>

                                {/* Members List */}
                                <div className="glass-card p-8 border-white/5 space-y-6">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Cpu className="w-5 h-5 text-primary" /> Thành viên trong ứng dụng
                                    </h3>
                                    {loadingProfile ? (
                                        <div className="text-center p-6"><Spin /></div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <Table 
                                                dataSource={userList} 
                                                columns={userColumns} 
                                                rowKey="_id"
                                                bordered={false}
                                                className="cyber-table"
                                                pagination={{ pageSize: 5 }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* TAB 2: ORDER HISTORY & LIVE TRACKER */}
                        {activeTab === 'orders' && (
                            <motion.div
                                key="orders"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="grid grid-cols-1 xl:grid-cols-3 gap-6"
                            >
                                <div className="xl:col-span-1">
                                    <OrderHistoryList 
                                        onSelectOrder={(id) => setSelectedOrderId(id)} 
                                        selectedOrderId={selectedOrderId} 
                                    />
                                </div>
                                <div className="xl:col-span-2">
                                    <OrderTracker 
                                        orderId={selectedOrderId} 
                                        onActionComplete={() => {}}
                                    />
                                </div>
                            </motion.div>
                        )}

                        {/* TAB 3: ADMIN SIMULATOR (MANAGE ALL ORDER LIFECYCLES) */}
                        {activeTab === 'simulator' && (
                            <motion.div
                                key="simulator"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="glass-card p-8 border-white/5 space-y-6"
                            >
                                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                            <Layers className="w-5 h-5 text-secondary" /> Bảng Giả Lập Trạng Thái Đơn Hàng (Shop & Admin)
                                        </h3>
                                        <p className="text-xs text-gray-400 mt-1">Dễ dàng kiểm thử, phê duyệt các trạng thái và yêu cầu hủy đơn.</p>
                                    </div>
                                    <button 
                                        onClick={fetchAdminOrders} 
                                        className="btn-primary py-2 px-4 text-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                                        disabled={loadingAdmin}
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" /> Làm mới
                                    </button>
                                </div>

                                {loadingAdmin ? (
                                    <div className="text-center py-12"><Spin size="large" /></div>
                                ) : allOrders.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500 italic">
                                        Chưa có đơn hàng nào trên hệ thống để giả lập.
                                    </div>
                                ) : (
                                    <div className="space-y-6 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                                        {allOrders.map((order) => (
                                            <div 
                                                key={order._id}
                                                className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative overflow-hidden group hover:bg-white/10 transition-all"
                                            >
                                                <div className="space-y-2 min-w-0">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] font-mono font-bold bg-white/5 px-2 py-0.5 border border-white/10 rounded text-gray-400">
                                                            #{order._id.substring(order._id.length - 8).toUpperCase()}
                                                        </span>
                                                        <span className="text-xs text-gray-500">{order.userEmail}</span>
                                                    </div>
                                                    
                                                    <h4 className="font-extrabold text-white text-sm line-clamp-1">
                                                        {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                                    </h4>
                                                    
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-400">
                                                        <span>Địa chỉ: <span className="text-white font-medium">{order.shippingAddress}</span></span>
                                                        <span>Tổng: <span className="text-primary font-bold">${order.totalAmount.toLocaleString()}</span></span>
                                                        <span>Thanh toán: <span className="text-white font-bold">{order.paymentMethod}</span></span>
                                                    </div>
                                                </div>

                                                {/* Simulator Controls */}
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-shrink-0">
                                                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full border flex-shrink-0 ${getStatusBadgeClass(order.status)}`}>
                                                        {getStatusLabelVN(order.status)}
                                                    </span>

                                                    {actionLoadingId === order._id ? (
                                                        <Spin size="small" />
                                                    ) : (
                                                        <div className="flex flex-wrap gap-2">
                                                            {/* Transition buttons based on current status */}
                                                            {order.status === 'New' && (
                                                                <button 
                                                                    onClick={() => handleUpdateStatus(order._id, 'Confirmed')}
                                                                    className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1"
                                                                >
                                                                    <Check className="w-3.5 h-3.5" /> Xác nhận
                                                                </button>
                                                            )}

                                                            {(order.status === 'New' || order.status === 'Confirmed') && (
                                                                <button 
                                                                    onClick={() => handleUpdateStatus(order._id, 'Preparing')}
                                                                    className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-dark rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1"
                                                                >
                                                                    <Package className="w-3.5 h-3.5" /> Chuẩn bị hàng
                                                                </button>
                                                            )}

                                                            {order.status === 'Preparing' && (
                                                                <button 
                                                                    onClick={() => handleUpdateStatus(order._id, 'Delivering')}
                                                                    className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1"
                                                                >
                                                                    <Truck className="w-3.5 h-3.5" /> Giao hàng
                                                                </button>
                                                            )}

                                                            {order.status === 'Delivering' && (
                                                                <button 
                                                                    onClick={() => handleUpdateStatus(order._id, 'Delivered')}
                                                                    className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1"
                                                                >
                                                                    <ThumbsUp className="w-3.5 h-3.5" /> Đã giao xong
                                                                </button>
                                                            )}

                                                            {order.status === 'CancelRequested' && (
                                                                <button 
                                                                    onClick={() => handleUpdateStatus(order._id, 'Canceled')}
                                                                    className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1 animate-pulse"
                                                                >
                                                                    <ThumbsUp className="w-3.5 h-3.5" /> Duyệt yêu cầu Hủy
                                                                </button>
                                                            )}

                                                            {/* General cancel button (only allowed for non-completed/non-canceled) */}
                                                            {!['Delivered', 'Canceled'].includes(order.status) && (
                                                                <button 
                                                                    onClick={() => handleUpdateStatus(order._id, 'Canceled')}
                                                                    className="px-3 py-1.5 bg-red-950 hover:bg-red-900 border border-red-500/20 text-red-400 hover:text-white rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1"
                                                                >
                                                                    <Ban className="w-3.5 h-3.5" /> Hủy
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default UserPage;