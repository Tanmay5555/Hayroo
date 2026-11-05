import express from 'express';
import {
  submitKYC,
  getKYCStatus,
  getSellerProducts,
  createSellerProduct,
  getSellerOrders,
  generateShippingLabel,
  getSellerLedger,
} from '../controllers/sellerController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('SELLER', 'ADMIN'));

router.post('/kyc/submit', submitKYC);
router.get('/kyc/status', getKYCStatus);
router.get('/products', getSellerProducts);
router.post('/products', createSellerProduct);
router.get('/orders', getSellerOrders);
router.post('/orders/:subOrderId/generate-label', generateShippingLabel);
router.get('/ledger', getSellerLedger);

export default router;

