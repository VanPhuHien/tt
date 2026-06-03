import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from '../util/axios.customize';
import ProductCard from '../components/common/ProductCard';
import { Search, Filter, SlidersHorizontal, X, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Spin, Slider, Select } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';

const SearchResultsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

    // Filter states
    const [priceRange, setPriceRange] = useState([0, 5000]);
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
    const [sort, setSort] = useState(searchParams.get('sort') || '-createdAt');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            const res = await axios.get('/v1/api/categories');
            if (res.EC === 0) setCategories(res.DT);
        };
        fetchCategories();
    }, []);

    const currentPage = parseInt(searchParams.get('page') || '1', 10);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const query = searchParams.get('q') || '';
                const cat = searchParams.get('category') || '';
                const min = searchParams.get('minPrice') || '';
                const max = searchParams.get('maxPrice') || '';
                const sorting = searchParams.get('sort') || '-createdAt';
                const page = searchParams.get('page') || '1';

                // Sync sidebar filters with active URL search params
                setSelectedCategory(cat);
                setSort(sorting);
                if (min && max) {
                    setPriceRange([Number(min), Number(max)]);
                } else {
                    setPriceRange([0, 5000]);
                }

                const res = await axios.get(`/v1/api/products?name=${query}&category=${cat}&minPrice=${min}&maxPrice=${max}&sort=${sorting}&limit=12&page=${page}`);
                if (res.EC === 0) {
                    setProducts(res.DT.results);
                    setTotal(res.DT.total);
                }
            } catch (error) {
                console.error("Error fetching search results:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [searchParams]);

    const handlePageChange = (newPage) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', newPage);
        setSearchParams(params);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const applyFilters = () => {
        const params = new URLSearchParams(searchParams);
        if (selectedCategory) params.set('category', selectedCategory);
        else params.delete('category');

        params.set('minPrice', priceRange[0]);
        params.set('maxPrice', priceRange[1]);
        params.set('sort', sort);
        params.set('page', '1'); // Reset to page 1 on filter apply

        setSearchParams(params);
        setIsSidebarOpen(false);
    };

    const resetFilters = () => {
        setPriceRange([0, 5000]);
        setSelectedCategory('');
        setSort('-createdAt');
        setSearchParams(new URLSearchParams());
    };

    return (
        <div className="pt-24 pb-20 container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-start gap-8">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:block w-72 glass-card p-6 sticky top-24">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Filter className="w-5 h-5 text-primary" /> Bộ Lọc
                        </h2>
                        <button onClick={resetFilters} className="text-xs text-gray-500 hover:text-primary transition-colors">Thiết lập lại</button>
                    </div>

                    <div className="space-y-8">
                        {/* Category */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-4">Danh Mục</h3>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="category"
                                        checked={selectedCategory === ''}
                                        onChange={() => setSelectedCategory('')}
                                        className="w-4 h-4 rounded-full border-white/20 bg-transparent text-primary focus:ring-primary/50"
                                    />
                                    <span className={`text-sm transition-colors ${selectedCategory === '' ? 'text-primary' : 'text-gray-400 group-hover:text-gray-200'}`}>Tất Cả Sản Phẩm</span>
                                </label>
                                {categories.map(cat => (
                                    <label key={cat._id} className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="category"
                                            checked={selectedCategory === cat.slug}
                                            onChange={() => setSelectedCategory(cat.slug)}
                                            className="w-4 h-4 rounded-full border-white/20 bg-transparent text-primary focus:ring-primary/50"
                                        />
                                        <span className={`text-sm transition-colors ${selectedCategory === cat.slug ? 'text-primary' : 'text-gray-400 group-hover:text-gray-200'}`}>{cat.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-4">Khoảng Giá</h3>
                            <Slider
                                range
                                min={0}
                                max={5000}
                                defaultValue={priceRange}
                                onChange={setPriceRange}
                                className="mb-4"
                                trackStyle={[{ backgroundColor: '#00f2ff' }]}
                                handleStyle={[{ borderColor: '#00f2ff' }, { borderColor: '#00f2ff' }]}
                            />
                            <div className="flex justify-between text-xs text-gray-400">
                                <span>${priceRange[0]}</span>
                                <span>${priceRange[1]}</span>
                            </div>
                        </div>

                        <button
                            onClick={applyFilters}
                            className="w-full btn-primary py-3 rounded-xl shadow-lg shadow-primary/20 cursor-pointer"
                        >
                            Áp Dụng Bộ Lọc
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 w-full">
                    {/* Header */}
                    <div className="glass-card p-4 mb-8 flex flex-wrap items-center justify-between gap-4">
                        <h1 className="text-lg font-bold text-white">
                            {loading ? 'Đang tìm kiếm...' : `Tìm thấy ${total} kết quả`}
                            {searchParams.get('q') && <span className="text-gray-400 font-normal ml-2">cho "${searchParams.get('q')}"</span>}
                        </h1>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="lg:hidden glass p-2 rounded-lg text-gray-300 cursor-pointer"
                            >
                                <SlidersHorizontal className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 hidden sm:block">Sắp xếp:</span>
                                <Select
                                    defaultValue={sort}
                                    onChange={(val) => {
                                        setSort(val);
                                        const params = new URLSearchParams(searchParams);
                                        params.set('sort', val);
                                        setSearchParams(params);
                                    }}
                                    className="cyber-select w-48"
                                    popupClassName="cyber-dropdown"
                                    variant="borderless"
                                    options={[
                                        { value: '-createdAt', label: 'Mới nhất' },
                                        { value: 'price', label: 'Giá: Thấp đến Cao' },
                                        { value: '-price', label: 'Giá: Cao đến Thấp' },
                                        { value: '-soldCount', label: 'Phổ biến nhất' },
                                    ]}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Grid */}
                    {loading ? (
                        <div className="h-64 flex items-center justify-center"><Spin size="large" /></div>
                    ) : products.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {products.map(product => (
                                    <ProductCard key={product._id} product={product} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {total > 12 && (
                                <div className="flex justify-center items-center gap-2 mt-12">
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        className="p-3 glass rounded-xl text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>

                                    {Array.from({ length: Math.ceil(total / 12) }, (_, i) => i + 1).map(pageNum => (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`w-12 h-12 rounded-xl font-bold transition-all cursor-pointer ${currentPage === pageNum
                                                    ? 'bg-primary text-dark shadow-lg shadow-primary/20'
                                                    : 'glass text-gray-400 hover:text-white'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    ))}

                                    <button
                                        disabled={currentPage === Math.ceil(total / 12)}
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        className="p-3 glass rounded-xl text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="glass-card p-20 text-center">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search className="w-10 h-10 text-gray-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Không tìm thấy kết quả nào</h2>
                            <p className="text-gray-400">Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSidebarOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                        />
                        <motion.aside
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-[300px] bg-dark-card border-l border-white/10 z-[70] p-6 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold text-white">Bộ Lọc</h2>
                                <button onClick={() => setIsSidebarOpen(false)} className="cursor-pointer"><X className="w-6 h-6 text-gray-400" /></button>
                            </div>
                            {/* Reusing filters logic here */}
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Danh Mục</h3>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => setSelectedCategory('')}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${selectedCategory === '' ? 'bg-primary text-dark' : 'bg-white/5 text-gray-400 border border-white/10'}`}
                                        >
                                            Tất cả
                                        </button>
                                        {categories.map(cat => (
                                            <button
                                                key={cat._id}
                                                onClick={() => setSelectedCategory(cat.slug)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${selectedCategory === cat.slug ? 'bg-primary text-dark' : 'bg-white/5 text-gray-400 border border-white/10'}`}
                                            >
                                                {cat.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Khoảng Giá</h3>
                                    <Slider range min={0} max={5000} value={priceRange} onChange={setPriceRange} className="mb-4" />
                                </div>
                                <button onClick={applyFilters} className="w-full btn-primary py-4 rounded-xl cursor-pointer">Áp Dụng Bộ Lọc</button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SearchResultsPage;
