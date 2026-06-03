const { 
    getProductsService, 
    getProductByIdService, 
    getRelatedProductsService,
    getCategoriesService
} = require('../services/productService');

const getProducts = async (req, res) => {
    try {
        const limit = req.query.limit || 10;
        const page = req.query.page || 1;
        const data = await getProductsService({ ...req.query, limit, page });
        return res.status(200).json({
            EC: 0,
            DT: data
        });
    } catch (error) {
        return res.status(500).json({
            EC: -1,
            EM: error.message
        });
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await getProductByIdService(req.params.id);
        if (!product) {
            return res.status(404).json({ EC: 1, EM: 'Product not found' });
        }
        const related = await getRelatedProductsService(product._id, product.category._id);
        return res.status(200).json({
            EC: 0,
            DT: {
                product,
                related
            }
        });
    } catch (error) {
        return res.status(500).json({
            EC: -1,
            EM: error.message
        });
    }
};

const getCategories = async (req, res) => {
    try {
        const data = await getCategoriesService();
        return res.status(200).json({
            EC: 0,
            DT: data
        });
    } catch (error) {
        return res.status(500).json({
            EC: -1,
            EM: error.message
        });
    }
}

module.exports = {
    getProducts,
    getProductById,
    getCategories
};
