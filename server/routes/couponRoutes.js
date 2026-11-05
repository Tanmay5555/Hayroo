import express from 'express';
import { applyCoupon, getCoupons, createCoupon, deleteCoupon } from '../controllers/couponController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/apply', applyCoupon);
router.get('/', authenticate, authorize('ADMIN'), getCoupons);
router.post('/', authenticate, authorize('ADMIN'), createCoupon);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteCoupon);

export default router;
