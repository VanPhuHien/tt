import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import ProductCard from '../common/ProductCard';

// Swiper CSS
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const HorizontalProductSlider = ({ products }) => {
    return (
        <div className="relative horizontal-slider-container pb-12">
            <Swiper
                spaceBetween={24}
                slidesPerView={1}
                pagination={{
                    clickable: true,
                    dynamicBullets: true,
                }}
                navigation={true}
                modules={[Pagination, Navigation]}
                breakpoints={{
                    640: {
                        slidesPerView: 2,
                        spaceBetween: 20,
                    },
                    768: {
                        slidesPerView: 3,
                        spaceBetween: 24,
                    },
                    1024: {
                        slidesPerView: 4,
                        spaceBetween: 24,
                    },
                }}
                className="w-full !px-2 !py-4"
            >
                {products.map(product => (
                    <SwiperSlide key={product._id} className="!h-auto flex">
                        <div className="w-full h-full">
                            <ProductCard product={product} />
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default HorizontalProductSlider;
