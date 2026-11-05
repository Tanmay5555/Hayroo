import express from 'express';
import { createPaymentOrder, verifyPayment } from '../controllers/paymentController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.post('/razorpay/create-order', createPaymentOrder);
router.post('/razorpay/verify', verifyPayment);

export default router;
