import Razorpay from 'razorpay';
import crypto from 'crypto';

const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_hayroo2026';
const key_secret = process.env.RAZORPAY_KEY_SECRET || 'secret_hayroo_razorpay_2026';

let razorpayInstance = null;

try {
  razorpayInstance = new Razorpay({
    key_id,
    key_secret,
  });
} catch (err) {
  console.warn('⚠️ Razorpay initialized in mock mode (Key ID/Secret not set)');
}

export const createRazorpayOrderService = async (amount, currency = 'INR', receipt = 'receipt_1') => {
  if (razorpayInstance && process.env.RAZORPAY_KEY_ID) {
    return await razorpayInstance.orders.create({
      amount: Math.round(amount * 100), // Amount in paise
      currency,
      receipt,
    });
  }

  // Fallback mock Razorpay order for test mode execution
  return {
    id: `order_rzp_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    entity: 'order',
    amount: Math.round(amount * 100),
    amount_paid: 0,
    amount_due: Math.round(amount * 100),
    currency,
    receipt,
    status: 'created',
    attempts: 0,
    created_at: Math.floor(Date.now() / 1000),
  };
};

export const verifyRazorpaySignatureService = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  if (!process.env.RAZORPAY_KEY_SECRET) {
    // In mock test mode, accept simulated signatures
    return true;
  }
  const body = razorpayOrderId + '|' + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac('sha256', key_secret)
    .update(body.toString())
    .digest('hex');

  return expectedSignature === razorpaySignature;
};
