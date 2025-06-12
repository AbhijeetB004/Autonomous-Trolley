const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, requireAdmin } = require('../middlewares/authMiddleware');

// Customer: Create order
router.post('/', authenticate, orderController.createOrder);
// Customer: Get all their orders
router.get('/user', authenticate, orderController.getUserOrders);
// Customer: Get a specific order if it belongs to them
router.get('/user/:id', authenticate, orderController.getUserOrderById);

// Admin: Get all orders, optionally filter by status
router.get('/', authenticate, requireAdmin, orderController.getOrders);
// Admin: Get order by id
router.get('/:id', authenticate, requireAdmin, orderController.getOrderById);
// Admin: Update order status
router.put('/:id/status', authenticate, requireAdmin, orderController.updateOrderStatus);
// Admin: Delete order
router.delete('/:id', authenticate, requireAdmin, orderController.deleteOrder);

module.exports = router; 