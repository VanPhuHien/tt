const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    images: [{ type: String }], // Array of image URLs
    description: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    stock: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },
    isNewArrival: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    discountPercentage: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    specifications: { type: Map, of: String } // Dynamic specs like "CPU: M3", "RAM: 16GB"
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
