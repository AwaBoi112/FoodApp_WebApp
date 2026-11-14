import express from 'express';
import { createReview } from '../controllers/reviewController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/', requireAuth, requireRole('CUSTOMER'), createReview);

export default router;