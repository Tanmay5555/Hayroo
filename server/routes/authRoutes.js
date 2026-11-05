import express from 'express';
import {
  register,
  login,
  requestPhoneOtp,
  verifyPhoneOtp,
  refreshToken,
  logout,
  getMe,
  firebaseLogin,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/phone/otp-request', requestPhoneOtp);
router.post('/phone/otp-verify', verifyPhoneOtp);
router.post('/firebase-login', firebaseLogin);
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);

export default router;
