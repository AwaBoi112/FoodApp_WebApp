import express from 'express';
import { createOrder, getMyOrders, getUserOrders } from '../controllers/orderController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/', requireAuth, requireRole('CUSTOMER'), createOrder);
router.get('/', requireAuth, requireRole('CUSTOMER'), getMyOrders);
router.get('/user/:userId', requireAuth, getUserOrders);

export default router;