require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/category');
const Product = require('../models/product');

const categories = [
    { name: 'Laptops', slug: 'laptops', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853', description: 'Premium computing machines' },
    { name: 'Smartphones', slug: 'smartphones', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9', description: 'Latest mobile technology' },
    { name: 'Accessories', slug: 'accessories', image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf', description: 'Essential tech gear' }
];

const products = [
    // --- LAPTOPS ---
    {
        name: 'MacBook Pro M3 Max',
        slug: 'macbook-pro-m3-max',
        price: 3499,
        images: [
            'https://images.unsplash.com/photo-1517336714731-489689fd1ca8',
            'https://images.unsplash.com/photo-1611186871348-b1ec696e5237'
        ],
        description: 'The most powerful MacBook ever. Featuring the ground-breaking M3 Max chip, advanced graphics, and stunning Liquid Retina XDR display.',
        categoryName: 'Laptops',
        stock: 15,
        soldCount: 120,
        isNewArrival: true,
        isBestSeller: true,
        discountPercentage: 5,
        specifications: { CPU: 'M3 Max', RAM: '64GB', SSD: '1TB', Screen: '16.2 inch' }
    },
    {
        name: 'Dell XPS 15',
        slug: 'dell-xps-15',
        price: 1899,
        images: [
            'https://images.unsplash.com/photo-1593642632823-8f785ba67e45'
        ],
        description: 'InfinityEdge 4-sided display brings stunning visuals and immense performance powered by Intel Core i9 processor.',
        categoryName: 'Laptops',
        stock: 10,
        soldCount: 30,
        isNewArrival: false,
        isBestSeller: false,
        discountPercentage: 0,
        specifications: { CPU: 'Intel i9', GPU: 'RTX 4060', RAM: '32GB', SSD: '1TB' }
    },
    {
        name: 'ASUS ROG Zephyrus G14',
        slug: 'asus-rog-zephyrus-g14',
        price: 1599,
        images: [
            'https://images.unsplash.com/photo-1603302576837-37561b2e2302'
        ],
        description: 'Dynamic 14-inch gaming laptop. Packs AMD Ryzen 9 and RTX 4070 in a super-thin, highly portable design.',
        categoryName: 'Laptops',
        stock: 25,
        soldCount: 85,
        isNewArrival: true,
        isBestSeller: true,
        discountPercentage: 10,
        specifications: { CPU: 'Ryzen 9', GPU: 'RTX 4070', RAM: '16GB', SSD: '1TB' }
    },
    {
        name: 'Razer Blade 16',
        slug: 'razer-blade-16',
        price: 2999,
        images: [
            'https://images.unsplash.com/photo-1593642632823-8f785ba67e45'
        ],
        description: 'Experience ultra-premium build quality and phenomenal performance. Dual-mode Mini-LED display.',
        categoryName: 'Laptops',
        stock: 8,
        soldCount: 40,
        isNewArrival: true,
        isBestSeller: false,
        discountPercentage: 0,
        specifications: { CPU: 'Intel i9', GPU: 'RTX 4080', RAM: '32GB', SSD: '2TB' }
    },
    {
        name: 'Lenovo ThinkPad X1 Carbon Gen 12',
        slug: 'lenovo-thinkpad-x1-carbon-gen-12',
        price: 1999,
        images: [
            'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed'
        ],
        description: 'The pinnacle of business laptops. Super lightweight carbon-fiber chassis, comfortable keyboard, and outstanding reliability.',
        categoryName: 'Laptops',
        stock: 18,
        soldCount: 140,
        isNewArrival: false,
        isBestSeller: true,
        discountPercentage: 8,
        specifications: { CPU: 'Intel Ultra 7', RAM: '32GB', SSD: '1TB', Weight: '1.09 kg' }
    },
    {
        name: 'HP Spectre x360',
        slug: 'hp-spectre-x360',
        price: 1499,
        images: [
            'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0'
        ],
        description: 'Elegant convertible 2-in-1 laptop with stunning OLED display and supreme battery life.',
        categoryName: 'Laptops',
        stock: 14,
        soldCount: 55,
        isNewArrival: false,
        isBestSeller: false,
        discountPercentage: 12,
        specifications: { CPU: 'Intel Ultra 5', Screen: '14 inch OLED', RAM: '16GB', SSD: '512GB' }
    },
    {
        name: 'MacBook Air M3',
        slug: 'macbook-air-m3',
        price: 1099,
        images: [
            'https://images.unsplash.com/photo-1517336714731-489689fd1ca8'
        ],
        description: 'Strikingly thin, incredibly fast, and completely silent. Best-in-class portable computing.',
        categoryName: 'Laptops',
        stock: 30,
        soldCount: 300,
        isNewArrival: true,
        isBestSeller: true,
        discountPercentage: 0,
        specifications: { CPU: 'Apple M3', RAM: '8GB', SSD: '256GB', Battery: 'Up to 18 hours' }
    },
    {
        name: 'MSI Raider GE78',
        slug: 'msi-raider-ge78',
        price: 3299,
        images: [
            'https://images.unsplash.com/photo-1541807084-5c52b6b3adef'
        ],
        description: 'Extreme gaming powerhouse. Features gorgeous RGB lightbars and high-refresh QHD screen.',
        categoryName: 'Laptops',
        stock: 5,
        soldCount: 15,
        isNewArrival: false,
        isBestSeller: false,
        discountPercentage: 0,
        specifications: { CPU: 'Intel i9', GPU: 'RTX 4090', RAM: '64GB', SSD: '2TB' }
    },

    // --- SMARTPHONES ---
    {
        name: 'iPhone 15 Pro',
        slug: 'iphone-15-pro',
        price: 999,
        images: [
            'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9',
            'https://images.unsplash.com/photo-1592890288564-76628a30a657'
        ],
        description: 'Titanium design. Dynamic Island. Advanced camera systems with the powerful A17 Pro chip.',
        categoryName: 'Smartphones',
        stock: 50,
        soldCount: 500,
        isNewArrival: false,
        isBestSeller: true,
        discountPercentage: 5,
        specifications: { Screen: '6.1 inch OLED', Chip: 'A17 Pro', Storage: '128GB' }
    },
    {
        name: 'Samsung Galaxy S24 Ultra',
        slug: 'samsung-galaxy-s24-ultra',
        price: 1299,
        images: [
            'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf'
        ],
        description: 'Ultimate camera zoom, built-in S Pen, premium Titanium frame, and incredible Galaxy AI experiences.',
        categoryName: 'Smartphones',
        stock: 40,
        soldCount: 420,
        isNewArrival: true,
        isBestSeller: true,
        discountPercentage: 8,
        specifications: { Screen: '6.8 inch Dynamic AMOLED', Camera: '200MP Zoom', Storage: '256GB' }
    },
    {
        name: 'Google Pixel 8 Pro',
        slug: 'google-pixel-8-pro',
        price: 899,
        images: [
            'https://images.unsplash.com/photo-1598327105666-5b89351aff97'
        ],
        description: 'The all-pro Google phone. Unparalleled software integration and advanced AI-powered magic camera features.',
        categoryName: 'Smartphones',
        stock: 35,
        soldCount: 190,
        isNewArrival: false,
        isBestSeller: false,
        discountPercentage: 15,
        specifications: { Screen: '6.7 inch LTPO OLED', Chip: 'Google Tensor G3', Storage: '128GB' }
    },
    {
        name: 'OnePlus 12',
        slug: 'oneplay-12',
        price: 799,
        images: [
            'https://images.unsplash.com/photo-1565630916779-e303be97b6f5'
        ],
        description: 'Smooth beyond belief. Exceptionally fast charging, high battery capacity, and gorgeous AMOLED display.',
        categoryName: 'Smartphones',
        stock: 30,
        soldCount: 150,
        isNewArrival: true,
        isBestSeller: false,
        discountPercentage: 0,
        specifications: { Chip: 'Snapdragon 8 Gen 3', Charge: '100W SuperVOOC', Storage: '256GB' }
    },
    {
        name: 'Xiaomi 14 Ultra',
        slug: 'xiaomi-14-ultra',
        price: 1199,
        images: [
            'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9'
        ],
        description: 'Co-engineered with Leica. Professional-grade quad camera sensors for legendary imagery.',
        categoryName: 'Smartphones',
        stock: 12,
        soldCount: 60,
        isNewArrival: true,
        isBestSeller: false,
        discountPercentage: 5,
        specifications: { Camera: '50MP Leica Quad', Screen: '6.73 inch WQHD+', RAM: '16GB' }
    },
    {
        name: 'Nothing Phone (2)',
        slug: 'nothing-phone-2',
        price: 649,
        images: [
            'https://images.unsplash.com/photo-1616348436168-de43ad0db179'
        ],
        description: 'A beautiful journey back to hardware excitement. Unique Glyph Interface brings customizable back LED alerts.',
        categoryName: 'Smartphones',
        stock: 22,
        soldCount: 95,
        isNewArrival: false,
        isBestSeller: false,
        discountPercentage: 10,
        specifications: { OS: 'Nothing OS 2.0', LED: 'Glyph Interface', Storage: '256GB' }
    },
    {
        name: 'ASUS ROG Phone 8 Pro',
        slug: 'asus-rog-phone-8-pro',
        price: 1099,
        images: [
            'https://images.unsplash.com/photo-1598327105666-5b89351aff97'
        ],
        description: 'The ultimate gaming phone. Built-in air triggers, premium thermal design, and high-performance gaming ecosystem.',
        categoryName: 'Smartphones',
        stock: 15,
        soldCount: 40,
        isNewArrival: true,
        isBestSeller: true,
        discountPercentage: 0,
        specifications: { Display: '165Hz AMOLED', Chip: 'Snapdragon 8 Gen 3', Battery: '5500mAh' }
    },
    {
        name: 'iPhone 15 Plus',
        slug: 'iphone-15-plus',
        price: 899,
        images: [
            'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9'
        ],
        description: 'Huge battery, big screen, stunning high-resolution photography, and gorgeous satin finish.',
        categoryName: 'Smartphones',
        stock: 25,
        soldCount: 180,
        isNewArrival: false,
        isBestSeller: false,
        discountPercentage: 0,
        specifications: { Screen: '6.7 inch Super Retina', Chip: 'A16 Bionic', Storage: '128GB' }
    },

    // --- ACCESSORIES ---
    {
        name: 'Mechanical Keyboard K3',
        slug: 'mechanical-keyboard-k3',
        price: 129,
        images: [
            'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae'
        ],
        description: 'Compact 75% layout premium mechanical keyboard with vibrant RGB backlighting and hot-swappable tactile switches.',
        categoryName: 'Accessories',
        stock: 100,
        soldCount: 45,
        isNewArrival: true,
        isBestSeller: false,
        discountPercentage: 15,
        specifications: { Switch: 'Brown', RGB: 'Yes', Connection: 'Bluetooth / USB-C' }
    },
    {
        name: 'Sony WH-1000XM5 Headphones',
        slug: 'sony-wh-1000xm5-headphones',
        price: 399,
        images: [
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e'
        ],
        description: 'Industry-leading noise canceling overhead headphones. Crystal clear hands-free calling and exceptional audio fidelity.',
        categoryName: 'Accessories',
        stock: 45,
        soldCount: 220,
        isNewArrival: false,
        isBestSeller: true,
        discountPercentage: 10,
        specifications: { Battery: '30 Hours', ANC: 'Industry Leading', Weight: '250g' }
    },
    {
        name: 'Keychron Q1 Pro',
        slug: 'keychron-q1-pro',
        price: 199,
        images: [
            'https://images.unsplash.com/photo-1587829741301-dc798b83add3'
        ],
        description: 'Full aluminum custom wireless mechanical keyboard. Heavy premium base with double-gasket structural damping.',
        categoryName: 'Accessories',
        stock: 30,
        soldCount: 80,
        isNewArrival: true,
        isBestSeller: true,
        discountPercentage: 0,
        specifications: { Layout: '75%', Case: 'CNC Aluminum', Switches: 'Keychron K Pro Red' }
    },
    {
        name: 'Logitech MX Master 3S Mouse',
        slug: 'logitech-mx-master-3s-mouse',
        price: 99,
        images: [
            'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7'
        ],
        description: 'Ergonomic performance mouse. Smart MagSpeed scrolling and high-precision 8K DPI sensor for silent clicks.',
        categoryName: 'Accessories',
        stock: 80,
        soldCount: 310,
        isNewArrival: false,
        isBestSeller: true,
        discountPercentage: 0,
        specifications: { DPI: '8000', Battery: 'Up to 70 days', Buttons: '7 fully customizable' }
    },
    {
        name: 'Apple AirPods Pro 2',
        slug: 'apple-airpods-pro-2',
        price: 249,
        images: [
            'https://images.unsplash.com/photo-1588449668365-d15e397f6787'
        ],
        description: 'Up to 2x more Active Noise Cancellation. Adaptive Audio tailors the sound profile to your environment.',
        categoryName: 'Accessories',
        stock: 60,
        soldCount: 500,
        isNewArrival: false,
        isBestSeller: true,
        discountPercentage: 5,
        specifications: { Chip: 'Apple H2', Case: 'MagSafe charging Speaker', ANC: 'Adaptive' }
    },
    {
        name: 'Samsung Galaxy Watch 6 Classic',
        slug: 'samsung-galaxy-watch-6-classic',
        price: 349,
        images: [
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30'
        ],
        description: 'Features a premium rotating bezel and comprehensive fitness analysis to track sleep and heart health.',
        categoryName: 'Accessories',
        stock: 20,
        soldCount: 95,
        isNewArrival: true,
        isBestSeller: false,
        discountPercentage: 10,
        specifications: { Bezel: 'Rotating bezel', Size: '47mm', OS: 'Wear OS' }
    },
    {
        name: 'Anker Prime 20,000mAh Power Bank',
        slug: 'anker-prime-20000mah-power-bank',
        price: 129,
        images: [
            'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf'
        ],
        description: 'Ultra-high-capacity charging brick capable of delivering massive output to keep all your gadgets alive on the go.',
        categoryName: 'Accessories',
        stock: 50,
        soldCount: 150,
        isNewArrival: true,
        isBestSeller: false,
        discountPercentage: 15,
        specifications: { Capacity: '20,000mAh', Output: '200W Combined', Display: 'Smart LCD Display' }
    },
    {
        name: 'Elgato Stream Deck MK.2',
        slug: 'elgato-stream-deck-mk-2',
        price: 149,
        images: [
            'https://images.unsplash.com/photo-1542751371-adc38448a05e'
        ],
        description: 'Customizable studio controller with 15 programmable LCD keys to trigger shortcuts and toggle lights.',
        categoryName: 'Accessories',
        stock: 15,
        soldCount: 75,
        isNewArrival: false,
        isBestSeller: false,
        discountPercentage: 0,
        specifications: { Keys: '15 LCD Keys', Connection: 'USB-C', Dimensions: '118 x 84 mm' }
    },
    {
        name: 'SteelSeries Arctis Nova Pro',
        slug: 'steelseries-arctis-nova-pro',
        price: 349,
        images: [
            'https://images.unsplash.com/photo-1546435770-a3e426bf472b'
        ],
        description: 'High-fidelity gaming audio system. Multi-system dual USB DAC connection for instant platform switching.',
        categoryName: 'Accessories',
        stock: 12,
        soldCount: 85,
        isNewArrival: true,
        isBestSeller: true,
        discountPercentage: 8,
        specifications: { Drivers: 'Premium Hi-Res', Connection: 'Wireless / Bluetooth', Battery: 'Hot-Swappable' }
    },
    {
        name: 'Shure SM7B Studio Microphone',
        slug: 'shure-sm7b-studio-microphone',
        price: 399,
        images: [
            'https://images.unsplash.com/photo-1590602847861-f357a9332bbc'
        ],
        description: 'The golden standard of professional broadcasting and studio vocal recording. Crystal-clear sound shielding.',
        categoryName: 'Accessories',
        stock: 8,
        soldCount: 110,
        isNewArrival: false,
        isBestSeller: true,
        discountPercentage: 0,
        specifications: { Type: 'Dynamic', PolarPattern: 'Cardioid', Connection: 'XLR' }
    },
    {
        name: 'Nomad Base One Max MagSafe Charger',
        slug: 'nomad-base-one-max-magsafe-charger',
        price: 149,
        images: [
            'https://images.unsplash.com/photo-1622445262465-2481c8573226'
        ],
        description: 'Weighted solid glass and steel charging dock for magnetic dual iPhone and Apple Watch premium charge.',
        categoryName: 'Accessories',
        stock: 25,
        soldCount: 120,
        isNewArrival: true,
        isBestSeller: false,
        discountPercentage: 5,
        specifications: { ChargerType: 'Official MagSafe', Weight: '900g', PowerOutput: '15W Fast Charge' }
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_DB_URL);
        console.log('Connected to DB for seeding...');

        // Clear existing data
        await Category.deleteMany({});
        await Product.deleteMany({});

        // Seed Categories
        const createdCategories = await Category.insertMany(categories);
        console.log('Categories seeded.');

        // Map category names to IDs
        const categoryMap = {};
        createdCategories.forEach(cat => {
            categoryMap[cat.name] = cat._id;
        });

        // Fallback galleries to ensure at least 3 unique images per product
        const laptopGallery = [
            'https://images.unsplash.com/photo-1517336714731-489689fd1ca8',
            'https://images.unsplash.com/photo-1611186871348-b1ec696e5237',
            'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed',
            'https://images.unsplash.com/photo-1593642632823-8f785ba67e45',
            'https://images.unsplash.com/photo-1541807084-5c52b6b3adef'
        ];

        const smartphoneGallery = [
            'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9',
            'https://images.unsplash.com/photo-1592890288564-76628a30a657',
            'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf',
            'https://images.unsplash.com/photo-1598327105666-5b89351aff97',
            'https://images.unsplash.com/photo-1565630916779-e303be97b6f5'
        ];

        const accessoryGallery = [
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
            'https://images.unsplash.com/photo-1587829741301-dc798b83add3',
            'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7',
            'https://images.unsplash.com/photo-1588449668365-d15e397f6787',
            'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf'
        ];

        // Prepare products with category IDs, arbitrary view counts and at least 3 unique high-quality images
        const finalProducts = products.map((p, idx) => {
            let pImages = [...p.images];
            let fallbackGallery = [];
            
            if (p.categoryName === 'Laptops') fallbackGallery = laptopGallery;
            else if (p.categoryName === 'Smartphones') fallbackGallery = smartphoneGallery;
            else fallbackGallery = accessoryGallery;

            let fallbackIdx = 0;
            while (pImages.length < 3) {
                const candidate = fallbackGallery[fallbackIdx % fallbackGallery.length];
                if (!pImages.includes(candidate)) {
                    pImages.push(candidate);
                }
                fallbackIdx++;
            }

            return {
                ...p,
                category: categoryMap[p.categoryName],
                viewCount: p.viewCount || Math.floor(Math.random() * 800) + 100,
                images: pImages
            };
        });

        // Seed Products
        await Product.insertMany(finalProducts);
        console.log('Products seeded.');

        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

seedDB();
