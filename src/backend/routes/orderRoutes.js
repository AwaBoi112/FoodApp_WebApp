import express from 'express';
import {
  createOrder,
  getUserOrders,
  getRestaurantOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/', requireAuth, requireRole('CUSTOMER'), createOrder);
router.get('/user/:userId', requireAuth, getUserOrders);

// restaurant admin
router.get('/restaurant', requireAuth, requireRole('RESTAURANT_ADMIN'), getRestaurantOrders);
router.patch('/:id/status', requireAuth, requireRole('RESTAURANT_ADMIN'), updateOrderStatus);

export default router;