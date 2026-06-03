const Product = require('../models/product');
const Category = require('../models/category');

const getProductsService = async (queryString) => {
    let { 
        limit, page, name, category, minPrice, maxPrice, 
        sort, isNewArrival, isBestSeller 
    } = queryString;

    let filter = {};

    // Name search (regex)
    if (name) {
        filter.name = { $regex: name, $options: 'i' };
    }

    // Category filter
    if (category) {
        const cat = await Category.findOne({ slug: category });
        if (cat) filter.category = cat._id;
    }

    // Price range
    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Flags
    if (isNewArrival === 'true') filter.isNewArrival = true;
    if (isBestSeller === 'true') filter.isBestSeller = true;

    // Pagination
    let offset = (page - 1) * limit;
    
    // Sort
    let sortBy = sort ? sort.split(',').join(' ') : '-createdAt';

    const results = await Product.find(filter)
        .populate('category')
        .limit(limit)
        .skip(offset)
        .sort(sortBy);

    const total = await Product.countDocuments(filter);

    return {
        results,
        totalPages: Math.ceil(total / limit),
        total
    };
};

const getProductByIdService = async (id) => {
    return await Product.findByIdAndUpdate(id, { $inc: { viewCount: 1 } }, { new: true }).populate('category');
};

const getRelatedProductsService = async (productId, categoryId) => {
    return await Product.find({
        category: categoryId,
        _id: { $ne: productId }
    }).limit(4);
};

const getCategoriesService = async () => {
    return await Category.find();
}

module.exports = {
    getProductsService,
    getProductByIdService,
    getRelatedProductsService,
    getCategoriesService
};
