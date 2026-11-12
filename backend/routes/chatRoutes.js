import express from 'express';
import { chatWithMessage, getChatHistory } from '../controllers/chatController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', optionalAuth, chatWithMessage);
router.get('/history/:sessionId', optionalAuth, getChatHistory);

export default router;
