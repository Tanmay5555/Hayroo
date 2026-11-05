import Coupon from '../models/Coupon.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse, sendError } from '../utils/apiResponse.js';

// @desc    Validate and apply coupon
// @route   POST /api/v1/coupons/apply
export const applyCoupon = asyncHandler(async (req, res) => {
  const { code, cartSubtotal } = req.body;

  if (!code) return sendError(res, 400, 'Coupon code is required');

  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  if (!coupon) return sendError(res, 404, 'Invalid or expired coupon code');

  if (new Date() > new Date(coupon.expiresAt)) {
    return sendError(res, 400, 'This coupon code has expired');
  }

  if (cartSubtotal && cartSubtotal < coupon.minOrderAmount) {
    return sendError(res, 400, `Minimum order amount for code ${coupon.code} is ₹${coupon.minOrderAmount}`);
  }

  let discountAmount = (cartSubtotal * coupon.discountPercent) / 100;
  if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
    discountAmount = coupon.maxDiscountAmount;
  }

  return sendResponse(res, 200, `Coupon ${coupon.code} applied successfully!`, {
    code: coupon.code,
    discountPercent: coupon.discountPercent,
    discountAmount: Math.round(discountAmount),
  });
});

// @desc    Admin CRUD coupons
export const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  return sendResponse(res, 200, 'Coupons fetched', coupons);
});

export const createCoupon = asyncHandler(async (req, res) => {
  const { code, discountPercent, minOrderAmount, expiresAt } = req.body;
  const coupon = await Coupon.create({
    code: code.toUpperCase(),
    discountPercent,
    minOrderAmount: minOrderAmount || 0,
    expiresAt: expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });
  return sendResponse(res, 201, 'Coupon created', coupon);
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  return sendResponse(res, 200, 'Coupon deleted');
});
