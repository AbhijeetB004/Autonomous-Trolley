const express = require('express');
const router = express.Router();
const trolleyController = require('../controllers/trolleyController');
const { authenticate, requireAdmin } = require('../middlewares/authMiddleware');

// Admin: Get all trolleys
router.get('/', authenticate, requireAdmin, trolleyController.getTrolleys);
// Admin: Get trolley by id
router.get('/:id', authenticate, requireAdmin, trolleyController.getTrolleyById);
// Admin: Update trolley status
router.put('/:id/status', authenticate, requireAdmin, trolleyController.updateTrolleyStatus);
// Admin: Update trolley (mock location/battery/task)
router.put('/:id', authenticate, requireAdmin, trolleyController.updateTrolley);
// Admin: Create a new trolley
router.post('/', authenticate, requireAdmin, trolleyController.createTrolley);

module.exports = router; 