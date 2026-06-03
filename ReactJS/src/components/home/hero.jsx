import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import { ShoppingBag, ChevronRight } from 'lucide-react';

const slides = [
    {
        id: 1,
        title: "Kỷ Nguyên Máy Tính Mới",
        subtitle: "MacBook Pro M3 Max",
        description: "MacBook mạnh mẽ nhất từ trước đến nay. Khơi nguồn sáng tạo với kiến trúc chip Apple M3 Max hoàn toàn mới.",
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
        color: "from-blue-600/20",
    },
    {
        id: 2,
        title: "Cách Mạng Di Động",
        subtitle: "iPhone 15 Pro Titanium",
        description: "Bền bỉ hơn. Nhẹ nhàng hơn. Đẳng cấp hơn. Khám phá thiết kế titan đột phá cùng chip A17 Pro siêu việt.",
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
        color: "from-purple-600/20",
    },
    {
        id: 3,
        title: "Tuyệt Tác Cơ Học",
        subtitle: "Bàn Phím Cơ Cao Cấp",
        description: "Nâng tầm trải nghiệm gõ phím của bạn với bộ sưu tập bàn phím cơ high-end được tuyển chọn kỹ lưỡng.",
        image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae",
        color: "from-pink-600/20",
    }
];

const Hero = () => {
    return (
        <section className="relative w-full h-[600px] md:h-[800px] pt-20">
            <Swiper
                modules={[Autoplay, Pagination, EffectFade]}
                effect="fade"
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                pagination={{ clickable: true }}
                loop={true}
                className="w-full h-full"
            >
                {slides.map((slide) => (
                    <SwiperSlide key={slide.id}>
                        <div className="relative w-full h-full overflow-hidden">
                            {/* Background Image */}
                            <img 
                                src={slide.image} 
                                alt={slide.title}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            
                            {/* Overlay */}
                            <div className={`absolute inset-0 bg-gradient-to-r ${slide.color} to-dark via-dark/60`} />

                            {/* Content */}
                            <div className="container mx-auto px-6 h-full flex flex-col justify-center relative z-10">
                                <span className="text-primary font-bold tracking-[0.2em] uppercase mb-4 block animate-fade-in">
                                    {slide.title}
                                </span>
                                <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight max-w-2xl leading-[1.1]">
                                    {slide.subtitle}
                                </h1>
                                <p className="text-gray-300 text-lg md:text-xl max-w-xl mb-10 leading-relaxed">
                                    {slide.description}
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <button className="btn-primary flex items-center gap-2 group cursor-pointer">
                                        Mua Ngay
                                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                    <button className="glass py-2 px-8 rounded-full font-medium text-white hover:bg-white/10 transition-colors cursor-pointer">
                                        Tìm Hiểu Thêm
                                    </button>
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
};

export default Hero;
