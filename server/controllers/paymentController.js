import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse, sendError } from '../utils/apiResponse.js';
import { createRazorpayOrderService, verifyRazorpaySignatureService } from '../services/razorpayService.js';
import Order from '../models/Order.js';

// @desc    Create Razorpay Order
// @route   POST /api/v1/payments/razorpay/create-order
export const createPaymentOrder = asyncHandler(async (req, res) => {
  const { amount, currency = 'INR', receipt } = req.body;

  if (!amount || amount <= 0) {
    return sendError(res, 400, 'Invalid payment amount');
  }

  const razorpayOrder = await createRazorpayOrderService(amount, currency, receipt);
  return sendResponse(res, 200, 'Razorpay order created', {
    orderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    key: process.env.RAZORPAY_KEY_ID || 'rzp_test_hayroo2026',
  });
});

// @desc    Verify Razorpay Payment Signature
// @route   POST /api/v1/payments/razorpay/verify
export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

  const isValid = verifyRazorpaySignatureService(razorpayOrderId, razorpayPaymentId, razorpaySignature);

  if (!isValid) {
    return sendError(res, 400, 'Payment signature verification failed');
  }

  if (orderId) {
    await Order.findOneAndUpdate(
      { $or: [{ _id: orderId.match(/^[0-9a-fA-F]{24}$/) ? orderId : null }, { orderId: orderId.toUpperCase() }] },
      {
        paymentStatus: 'Paid',
        razorpayOrderId,
        razorpayPaymentId,
      }
    );
  }

  return sendResponse(res, 200, 'Payment verified successfully', {
    verified: true,
    paymentId: razorpayPaymentId,
  });
});
