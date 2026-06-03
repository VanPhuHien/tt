import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/auth.context';
import { addToCartApi } from '../../util/api';
import { notification } from 'antd';

const ProductCard = ({ product }) => {
    const { _id, name, price, images, category, isNewArrival, discountPercentage, soldCount } = product;
    const navigate = useNavigate();
    const { auth, setCartCount } = useContext(AuthContext);

    const handleQuickAdd = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!auth.isAuthenticated) {
            notification.warning({
                message: 'Vui lòng đăng nhập',
                description: 'Bạn cần đăng nhập tài khoản để thêm sản phẩm vào giỏ hàng.'
            });
            navigate('/login');
            return;
        }

        try {
            const res = await addToCartApi(_id, 1);
            if (res && res.EC === 0) {
                notification.success({
                    message: 'Đã thêm vào giỏ hàng',
                    description: `Đã thêm 1x "${name}" vào giỏ hàng.`
                });
                const count = res.DT.items.reduce((acc, item) => acc + item.quantity, 0);
                setCartCount(count);
            } else {
                notification.error({
                    message: 'Lỗi giỏ hàng',
                    description: res.EM || 'Không thể thêm sản phẩm.'
                });
            }
        } catch (err) {
            console.error("Error quick adding to cart:", err);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card group flex flex-col h-full"
        >
            {/* Image Container */}
            <div className="relative aspect-square overflow-hidden rounded-t-2xl">
                <img 
                    src={images[0]} 
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {isNewArrival && (
                        <span className="bg-primary/90 text-dark text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                            Mới
                        </span>
                    )}
                    {discountPercentage > 0 && (
                        <span className="bg-secondary/90 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                            -{discountPercentage}%
                        </span>
                    )}
                </div>

                {/* Quick Add Button */}
                <button 
                    onClick={handleQuickAdd}
                    className="absolute bottom-3 right-3 p-2.5 bg-primary text-dark rounded-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-lg shadow-primary/20 cursor-pointer z-10"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                        {category?.name}
                    </span>
                    <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-[10px] text-gray-400">4.9</span>
                    </div>
                </div>

                <Link to={`/product/${_id}`} className="group-hover:text-primary transition-colors">
                    <h3 className="font-bold text-gray-100 mb-1 line-clamp-1">{name}</h3>
                </Link>
                
                <p className="text-xs text-gray-400 mb-4 line-clamp-2 flex-grow">
                    Thiết kế sang trọng và hiệu năng đỉnh cao.
                </p>

                <div className="flex items-center justify-between mt-auto">
                    <div>
                        <span className="text-lg font-bold text-white">${price.toLocaleString()}</span>
                        {discountPercentage > 0 && (
                            <span className="text-xs text-gray-500 line-through ml-2">
                                ${(price * (1 + discountPercentage/100)).toFixed(0)}
                            </span>
                        )}
                    </div>
                    <span className="text-[10px] text-gray-500 italic">
                        Đã bán {soldCount}+
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
