import express from 'express';
import { updateProfile, addAddress, deleteAddress } from '../controllers/userController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.put('/profile', updateProfile);
router.post('/addresses', addAddress);
router.delete('/addresses/:addressId', deleteAddress);

export default router;
