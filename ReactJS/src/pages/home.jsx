import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/home/hero';
import ProductCard from '../components/common/ProductCard';
import HorizontalProductSlider from '../components/home/HorizontalProductSlider';
import axios from '../util/axios.customize';
import { motion } from 'framer-motion';
import { ChevronRight, Zap, Trophy, Eye } from 'lucide-react';
import { Spin } from 'antd';

const HomePage = () => {
    const [newArrivals, setNewArrivals] = useState([]);
    const [bestSellers, setBestSellers] = useState([]);
    const [mostViewed, setMostViewed] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [resNew, resBest, resViewed, resCat] = await Promise.all([
                    axios.get('/v1/api/products?isNewArrival=true&limit=4'),
                    axios.get('/v1/api/products?isBestSeller=true&limit=10'),
                    axios.get('/v1/api/products?sort=-viewCount&limit=10'),
                    axios.get('/v1/api/categories')
                ]);

                if (resNew.EC === 0) setNewArrivals(resNew.DT.results);
                if (resBest.EC === 0) setBestSellers(resBest.DT.results);
                if (resViewed.EC === 0) setMostViewed(resViewed.DT.results);
                if (resCat.EC === 0) setCategories(resCat.DT);
            } catch (error) {
                console.error("Error fetching homepage data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <main className="pb-20 bg-dark min-h-screen">
            <Hero />

            {/* Categories Grid */}
            <section className="container mx-auto px-6 -mt-16 relative z-20">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                    {categories.map((cat, idx) => (
                        <Link 
                            key={cat._id}
                            to={`/search?category=${cat.slug}`}
                            className="block"
                        >
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className="glass p-6 rounded-2xl flex flex-col items-center gap-3 cursor-pointer group hover:bg-primary/10 border border-white/5 hover:border-primary/30 transition-all h-full"
                            >
                                <img src={cat.image} alt={cat.name} className="w-12 h-12 object-contain opacity-70 group-hover:opacity-100 transition-opacity" />
                                <span className="font-bold text-gray-300 group-hover:text-primary transition-colors">{cat.name}</span>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* New Arrivals (Static Grid) */}
            <section className="container mx-auto px-6 mt-24">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-lg">
                            <Zap className="w-6 h-6 text-primary" />
                        </div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Sản Phẩm Mới</h2>
                    </div>
                    <button className="flex items-center gap-2 text-primary hover:gap-3 transition-all font-medium">
                        Xem Tất Cả <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {newArrivals.map(product => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            </section>

            {/* Best Sellers (Horizontal Slider - Top 10) */}
            <section className="container mx-auto px-6 mt-24">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-secondary/20 rounded-lg">
                            <Trophy className="w-6 h-6 text-secondary" />
                        </div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Sản Phẩm Bán Chạy</h2>
                    </div>
                </div>
                {bestSellers.length > 0 ? (
                    <HorizontalProductSlider products={bestSellers} />
                ) : (
                    <p className="text-gray-500 italic">Không tìm thấy sản phẩm bán chạy nào.</p>
                )}
            </section>

            {/* Most Viewed (Horizontal Slider - Top 10) */}
            <section className="container mx-auto px-6 mt-24">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-lg">
                            <Eye className="w-6 h-6 text-primary" />
                        </div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Sản Phẩm Xem Nhiều</h2>
                    </div>
                </div>
                {mostViewed.length > 0 ? (
                    <HorizontalProductSlider products={mostViewed} />
                ) : (
                    <p className="text-gray-500 italic">Không tìm thấy sản phẩm xem nhiều nào.</p>
                )}
            </section>

            {/* Newsletter/Promo Section */}
            <section className="container mx-auto px-6 mt-32">
                <div className="glass-card p-10 md:p-16 relative overflow-hidden flex flex-col md:flex-row items-center gap-10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 blur-[100px] -ml-32 -mb-32"></div>
                    
                    <div className="flex-1 relative z-10">
                        <h2 className="text-4xl font-bold text-white mb-4">Tham Gia Cuộc Cách Mạng Công Nghệ</h2>
                        <p className="text-gray-400 max-w-md">Đăng ký nhận bản tin để nhận thông báo về các sản phẩm mới ra mắt và ưu đãi giảm giá độc quyền cho thành viên.</p>
                    </div>
                    
                    <div className="flex-1 w-full relative z-10">
                        <div className="flex gap-2 p-2 bg-white/5 rounded-2xl border border-white/10">
                            <input 
                                type="email" 
                                placeholder="Nhập email của bạn" 
                                className="flex-grow bg-transparent border-none focus:ring-0 px-4 text-white font-medium"
                            />
                            <button className="btn-primary">Đăng Ký</button>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default HomePage;