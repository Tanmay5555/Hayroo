import express from 'express';
import {
  getAdminStats,
  getPendingSellers,
  getAllSellers,
  toggleSellerStatus,
  decideSellerKyc,
  getDisputes,
  resolveDispute,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  updateUserRole,
} from '../controllers/adminController.js';
import { updateSiteTheme } from '../controllers/themeController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/stats', getAdminStats);
router.get('/analytics/overview', getAdminStats);
router.get('/orders', getAllOrders);
router.patch('/orders/:id/status', updateOrderStatus);
router.get('/sellers', getAllSellers);
router.patch('/sellers/:id/toggle-status', toggleSellerStatus);
router.get('/sellers/pending', getPendingSellers);
router.post('/sellers/:id/kyc-decision', decideSellerKyc);
router.get('/users', getAllUsers);
router.patch('/users/:id/role', updateUserRole);
router.get('/disputes', getDisputes);
router.patch('/disputes/:id', resolveDispute);
router.patch('/theme', updateSiteTheme);

export default router;
