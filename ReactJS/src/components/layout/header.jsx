import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/auth.context';
import { ShoppingCart, User, LogOut, Search, Menu, X, Cpu, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../../util/axios.customize';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { auth, setAuth, cartCount } = useContext(AuthContext);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [categories, setCategories] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Extract active category slug from query string
    const activeCategory = new URLSearchParams(location.search).get('category');

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get('/v1/api/categories');
                if (res.EC === 0) setCategories(res.DT);
            } catch (err) {
                console.error("Error fetching categories for header:", err);
            }
        };
        fetchCategories();
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        setAuth({
            isAuthenticated: false,
            user: { email: "", name: "" }
        });
        navigate("/");
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <header 
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                isScrolled ? 'py-3 glass' : 'py-5 bg-transparent'
            }`}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="p-2 rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-colors">
                        <Cpu className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-xl font-bold tracking-tighter text-white">
                        CYBER<span className="text-primary">STORE</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    <Link
                        to="/"
                        className={`text-sm font-medium transition-colors hover:text-primary ${
                            location.pathname === '/' ? 'text-primary' : 'text-gray-300'
                        }`}
                    >
                        Trang Chủ
                    </Link>

                    {/* Categories Dropdown */}
                    <div 
                        className="relative"
                        onMouseEnter={() => setIsDropdownOpen(true)}
                        onMouseLeave={() => setIsDropdownOpen(false)}
                    >
                        <button 
                            className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary focus:outline-none py-2 cursor-pointer ${
                                location.pathname === '/search' && activeCategory ? 'text-primary font-bold' : 'text-gray-300'
                            }`}
                        >
                            Danh Mục <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {isDropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute left-0 mt-1 w-56 glass rounded-2xl p-4 shadow-xl border border-white/10 backdrop-blur-xl z-50"
                                >
                                    <div className="flex flex-col gap-2">
                                        {categories.map((cat) => (
                                            <Link
                                                key={cat._id}
                                                to={`/search?category=${cat.slug}`}
                                                onClick={() => setIsDropdownOpen(false)}
                                                className={`text-sm py-2 px-3 rounded-lg hover:bg-white/5 transition-all flex items-center gap-3 ${
                                                    activeCategory === cat.slug ? 'text-primary font-bold bg-white/10' : 'text-gray-300'
                                                }`}
                                            >
                                                {cat.image && (
                                                    <img src={cat.image} alt={cat.name} className="w-5 h-5 object-contain opacity-70" />
                                                )}
                                                {cat.name}
                                            </Link>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <Link
                        to="/search"
                        className={`text-sm font-medium transition-colors hover:text-primary ${
                            location.pathname === '/search' && !activeCategory ? 'text-primary font-bold' : 'text-gray-300'
                        }`}
                    >
                        Tất Cả Sản Phẩm
                    </Link>

                    {auth.isAuthenticated && (
                        <Link
                            to="/user"
                            className={`text-sm font-medium transition-colors hover:text-primary ${
                                location.pathname === '/user' ? 'text-primary' : 'text-gray-300'
                            }`}
                        >
                            Tài Khoản
                        </Link>
                    )}
                </nav>

                {/* Actions */}
                <div className="hidden md:flex items-center gap-6">
                    <form onSubmit={handleSearch} className="relative group">
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white/10 border border-white/10 rounded-full py-1.5 px-4 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-48 focus:w-64 transition-all text-white font-medium"
                        />
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" />
                    </form>

                    {/* Cart Icon */}
                    <Link 
                        to="/cart" 
                        className="relative p-2.5 hover:bg-white/10 rounded-full transition-colors text-gray-300 hover:text-primary cursor-pointer flex items-center justify-center border border-white/5"
                        title="Giỏ Hàng"
                    >
                        <ShoppingCart className="w-5 h-5" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-secondary text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-dark shadow-[0_0_10px_rgba(255,0,234,0.5)]">
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    {auth.isAuthenticated ? (
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-white/5 py-1.5 px-3 rounded-full border border-white/10">
                                <User className="w-4 h-4 text-primary" />
                                <span className="text-xs font-medium text-gray-200">{auth.user.name || auth.user.email}</span>
                            </div>
                            <button 
                                onClick={handleLogout}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-red-400 cursor-pointer"
                                title="Đăng Xuất"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <Link 
                            to="/login"
                            className="btn-primary flex items-center gap-2"
                        >
                            <User className="w-4 h-4" />
                            Đăng Nhập
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button 
                    className="md:hidden p-2 text-gray-300"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden glass border-t border-white/10"
                    >
                        <div className="container mx-auto px-6 py-6 flex flex-col gap-4">
                            <Link
                                to="/"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`text-lg font-medium ${
                                    location.pathname === '/' ? 'text-primary font-bold' : 'text-gray-300'
                                }`}
                            >
                                Trang Chủ
                            </Link>

                            {/* Mobile Categories section */}
                            <div>
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Danh Mục</span>
                                <div className="grid grid-cols-2 gap-2 pl-2">
                                    {categories.map((cat) => (
                                        <Link
                                            key={cat._id}
                                            to={`/search?category=${cat.slug}`}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`text-sm py-1 transition-colors ${
                                                activeCategory === cat.slug ? 'text-primary font-bold' : 'text-gray-400'
                                            }`}
                                        >
                                            {cat.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <Link
                                to="/search"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`text-lg font-medium ${
                                    location.pathname === '/search' && !activeCategory ? 'text-primary font-bold' : 'text-gray-300'
                                }`}
                            >
                                Tất Cả Sản Phẩm
                            </Link>

                            {auth.isAuthenticated && (
                                <Link
                                    to="/user"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`text-lg font-medium ${
                                        location.pathname === '/user' ? 'text-primary font-bold' : 'text-gray-300'
                                    }`}
                                >
                                    Tài Khoản
                                </Link>
                            )}
                            <Link
                                to="/cart"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`text-lg font-medium flex items-center justify-between ${
                                    location.pathname === '/cart' ? 'text-primary font-bold' : 'text-gray-300'
                                }`}
                            >
                                <span className="flex items-center gap-2">
                                    <ShoppingCart className="w-5 h-5" /> Giỏ Hàng
                                </span>
                                {cartCount > 0 && (
                                    <span className="bg-secondary text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>

                            <hr className="border-white/10" />
                            <form onSubmit={handleSearch} className="relative">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white/10 border border-white/10 rounded-xl py-2 px-4 pl-10 text-gray-200"
                                />
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            </form>
                            {auth.isAuthenticated ? (
                                <button 
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 text-red-400 font-medium cursor-pointer"
                                >
                                    <LogOut className="w-5 h-5" /> Đăng Xuất
                                </button>
                            ) : (
                                <Link 
                                    to="/login"
                                    className="btn-primary text-center"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Đăng Nhập
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Header;