import express from 'express';
import {
  getDeliveryManifest,
  verifyDeliveryOtp,
  reportDeliveryFailure,
} from '../controllers/deliveryController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('DELIVERY_PARTNER', 'ADMIN'));

router.get('/manifest', getDeliveryManifest);
router.post('/shipments/:shipmentId/verify-otp-delivery', verifyDeliveryOtp);
router.post('/shipments/:shipmentId/report-failure', reportDeliveryFailure);

export default router;

