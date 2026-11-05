import express from 'express';
import {
  checkoutSummary,
  createPaymentIntent,
  confirmOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
} from '../controllers/orderController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.post('/checkout-summary', checkoutSummary);
router.post('/create-payment-intent', createPaymentIntent);
router.post('/confirm', confirmOrder);
router.post('/', confirmOrder);
router.get('/', getUserOrders);
router.get('/:orderId', getOrderById);
router.post('/:id/cancel', cancelOrder);

export default router;
