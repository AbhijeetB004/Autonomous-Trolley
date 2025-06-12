const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, requireAdmin } = require('../middlewares/authMiddleware');

// Public: Get all products, get product by id
router.get('/', authenticate, productController.getProducts);
router.get('/category/:category', authenticate, productController.getProductsByCategory);
router.get('/:id', authenticate, productController.getProductById);

// Admin only: Create, update, delete
router.post('/', authenticate, requireAdmin, productController.createProduct);
router.put('/:id', authenticate, requireAdmin, productController.updateProduct);
router.delete('/:id', authenticate, requireAdmin, productController.deleteProduct);

// Admin only: Update inventory
router.put('/:id/inventory', authenticate, requireAdmin, productController.updateInventory);
// Admin only: Get low stock products
router.get('/low-stock', authenticate, requireAdmin, productController.getLowStockProducts);

module.exports = router; 