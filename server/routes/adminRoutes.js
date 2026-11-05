import express from 'express';
import {
  getAdminStats,
  getPendingSellers,
  decideSellerKyc,
  getDisputes,
  getAllOrders,
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/stats', getAdminStats);
router.get('/analytics/overview', getAdminStats);
router.get('/orders', getAllOrders);
router.get('/sellers/pending', getPendingSellers);
router.post('/sellers/:id/kyc-decision', decideSellerKyc);
router.get('/disputes', getDisputes);

export default router;
