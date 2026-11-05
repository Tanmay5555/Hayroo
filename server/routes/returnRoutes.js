import express from 'express';
import {
  createReturnRequest,
  getMyReturns,
  verifyReturnAndRefund,
} from '../controllers/returnController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.post('/', createReturnRequest);
router.get('/', getMyReturns);
router.post('/:id/verify', verifyReturnAndRefund);

export default router;

