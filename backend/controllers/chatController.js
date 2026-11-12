import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse, sendError } from '../utils/apiResponse.js';
import { processChatMessage } from '../services/geminiChatService.js';
import ChatSession from '../models/ChatSession.js';

// @desc    Send message to AI Chatbot
// @route   POST /api/v1/chat
export const chatWithMessage = asyncHandler(async (req, res) => {
  const { sessionId = `session-${Date.now()}`, message } = req.body;

  if (!message) {
    return sendError(res, 400, 'Message content is required');
  }

  const response = await processChatMessage({
    sessionId,
    message,
    user: req.user,
  });

  return sendResponse(res, 200, 'Chat response generated', response);
});

// @desc    Get chat session history
// @route   GET /api/v1/chat/history/:sessionId
export const getChatHistory = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const session = await ChatSession.findOne({ sessionId }).populate('messages.products');
  return sendResponse(res, 200, 'Chat history retrieved', session ? session.messages : []);
});
