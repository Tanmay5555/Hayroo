import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse, sendError } from '../utils/apiResponse.js';
import { createRazorpayOrderService, verifyRazorpaySignatureService } from '../services/razorpayService.js';
import Order from '../models/Order.js';

// @desc    Create Razorpay Order
// @route   POST /api/v1/payments/razorpay/create-order
export const createPaymentOrder = asyncHandler(async (req, res) => {
  const { amount, currency = 'INR', receipt } = req.body;
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return sendError(res, 400, 'Invalid payment amount');
  }

  const razorpayOrder = await createRazorpayOrderService(numericAmount, currency, receipt);
  return sendResponse(res, 200, 'Razorpay order created', {
    orderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    key: process.env.RAZORPAY_KEY_ID || (process.env.NODE_ENV !== 'production' ? 'rzp_test_hayroo2026' : ''),
  });
});

// @desc    Verify Razorpay Payment Signature
// @route   POST /api/v1/payments/razorpay/verify
export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

  if (!razorpayOrderId || !razorpayPaymentId) {
    return sendError(res, 400, 'Razorpay order ID and payment ID are required');
  }

  const isValid = verifyRazorpaySignatureService(razorpayOrderId, razorpayPaymentId, razorpaySignature);

  if (!isValid) {
    return sendError(res, 400, 'Payment signature verification failed');
  }

  if (orderId) {
    const idQuery = orderId.match(/^[0-9a-fA-F]{24}$/)
      ? { $or: [{ _id: orderId }, { orderId: orderId.toUpperCase() }] }
      : { orderId: String(orderId).toUpperCase() };

    const order = await Order.findOne(idQuery);
    if (!order) {
      return sendError(res, 404, 'Order not found');
    }
    if (order.user.toString() !== req.user._id.toString() && (req.user.role || '').toUpperCase() !== 'ADMIN') {
      return sendError(res, 403, 'Access denied for this order');
    }

    order.paymentStatus = 'Paid';
    order.razorpayOrderId = razorpayOrderId;
    order.razorpayPaymentId = razorpayPaymentId;
    await order.save();
  }

  return sendResponse(res, 200, 'Payment verified successfully', {
    verified: true,
    paymentId: razorpayPaymentId,
  });
});
