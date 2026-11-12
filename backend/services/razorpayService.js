import Razorpay from 'razorpay';
import crypto from 'crypto';

const getRazorpayKeys = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const isPlaceholder =
    !keyId ||
    !keySecret ||
    keyId.includes('YourTestKeyId') ||
    keySecret.includes('YourRazorpaySecretKey');
  return { keyId, keySecret, isConfigured: !isPlaceholder };
};

export const createRazorpayOrderService = async (amount, currency = 'INR', receipt = 'receipt_1') => {
  const { keyId, keySecret, isConfigured } = getRazorpayKeys();

  if (isConfigured) {
    const razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
    return await razorpayInstance.orders.create({
      amount: Math.round(Number(amount) * 100),
      currency,
      receipt,
    });
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Razorpay payment gateway is not configured for production');
  }

  // Fallback mock Razorpay order for local development & automated tests
  return {
    id: `order_rzp_${Date.now()}_${crypto.randomInt(100, 999)}`,
    entity: 'order',
    amount: Math.round(Number(amount) * 100),
    amount_paid: 0,
    amount_due: Math.round(Number(amount) * 100),
    currency,
    receipt,
    status: 'created',
    attempts: 0,
    created_at: Math.floor(Date.now() / 1000),
  };
};

export const verifyRazorpaySignatureService = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  const { keySecret, isConfigured } = getRazorpayKeys();

  if (!isConfigured) {
    if (process.env.NODE_ENV === 'production') {
      return false;
    }
    return Boolean(razorpayOrderId && razorpayPaymentId);
  }

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return false;
  }

  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(body)
    .digest('hex');

  const expectedBuf = Buffer.from(expectedSignature, 'utf8');
  const receivedBuf = Buffer.from(String(razorpaySignature), 'utf8');
  if (expectedBuf.length !== receivedBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuf, receivedBuf);
};
