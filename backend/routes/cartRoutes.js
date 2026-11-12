import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  applyCoupon,
  clearCart,
} from '../controllers/cartController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(optionalAuth);

router.get('/', getCart);
router.post('/items', addToCart);
router.put('/items/:id', updateCartItem);
router.delete('/items/:id', removeCartItem);
router.post('/apply-coupon', applyCoupon);
router.delete('/', clearCart);
router.delete('/clear', clearCart);

// Legacy routes for backwards-compatibility
router.post('/add', addToCart);
router.put('/update', updateCartItem);
router.delete('/remove/:itemId', removeCartItem);

export default router;
