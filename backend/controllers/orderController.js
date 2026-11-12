import crypto from 'crypto';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import Coupon from '../models/Coupon.js';
import SellerProfile from '../models/SellerProfile.js';
import SellerLedger from '../models/SellerLedger.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse, sendError } from '../utils/apiResponse.js';

const generateOrderNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = crypto.randomInt(1000, 9999);
  return `APX-${dateStr}-${random}`;
};

const computeVerifiedCouponDiscount = async (couponCode, subtotal) => {
  if (!couponCode || typeof couponCode !== 'string' || subtotal <= 0) {
    return 0;
  }
  const coupon = await Coupon.findOne({ code: couponCode.trim().toUpperCase(), isActive: true });
  if (!coupon) return 0;
  if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) return 0;
  if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) return 0;

  let discount = (subtotal * coupon.discountPercent) / 100;
  if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
    discount = coupon.maxDiscountAmount;
  }
  return Math.round(discount);
};

// @desc    Calculate checkout summary with split sub-orders and tax breakdown
// @route   POST /api/v1/orders/checkout-summary
export const checkoutSummary = asyncHandler(async (req, res) => {
  const { shippingAddress, items, couponCode } = req.body;
  const buyerState = shippingAddress?.state || 'Karnataka';

  let rawItems = items;
  let cartCouponCode = couponCode;

  if (!rawItems || rawItems.length === 0) {
    const cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      populate: { path: 'sellerId' },
    });
    if (!cart || cart.items.length === 0) {
      return sendError(res, 400, 'Cannot generate checkout summary for empty cart');
    }
    rawItems = cart.items;
    if (!cartCouponCode && cart.couponCode) {
      cartCouponCode = cart.couponCode;
    }
  }

  const sellerPartitions = {};
  let masterSubtotal = 0;
  let masterShipping = 0;

  for (const entry of rawItems) {
    const productId = entry.product?._id || entry.product || entry.productId || entry.id;
    const quantity = Number(entry.quantity ?? 1);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      return sendError(res, 400, 'Item quantity must be an integer between 1 and 99');
    }

    const product = await Product.findById(productId).populate('sellerId');
    if (!product) continue;

    const seller = product.sellerId || {
      _id: 'default_seller',
      businessName: 'Apex Direct Retail',
      commissionPercent: 10.0,
      businessAddress: { state: 'Karnataka' },
    };
    const sellerId = seller._id.toString();

    if (!sellerPartitions[sellerId]) {
      sellerPartitions[sellerId] = {
        sellerId: seller._id,
        sellerBusinessName: seller.businessName || 'Apex Direct',
        sellerState: seller.businessAddress?.state || 'Karnataka',
        commissionPercent: seller.commissionPercent || 10.0,
        subtotal: 0,
        shippingFee: 0,
        items: [],
      };
    }

    // Always use authoritative database product price
    const itemPrice = product.price;
    const lineTotal = itemPrice * quantity;
    masterSubtotal += lineTotal;
    sellerPartitions[sellerId].subtotal += lineTotal;

    sellerPartitions[sellerId].items.push({
      product: product._id,
      title: product.title,
      price: itemPrice,
      quantity,
      attributes: entry.attributes || {},
      imageLight: product.imageLight,
    });
  }

  const subOrdersPreview = Object.values(sellerPartitions).map((part, index) => {
    const isIntrastate = part.sellerState.toLowerCase() === buyerState.toLowerCase();
    const taxType = isIntrastate ? 'CGST_SGST' : 'IGST';
    const taxAmount = Number(((part.subtotal * 0.18) / 1.18).toFixed(2));
    const commissionAmount = Number(((part.subtotal * part.commissionPercent) / 100).toFixed(2));
    const tcsAmount = Number((part.subtotal * 0.01).toFixed(2));
    const sellerNetPayout = Number((part.subtotal - commissionAmount - tcsAmount).toFixed(2));
    const shippingFee = part.subtotal >= 999 ? 0 : 99;
    masterShipping += shippingFee;

    return {
      subOrderNumber: `PREVIEW-S${index + 1}`,
      sellerId: part.sellerId,
      sellerBusinessName: part.sellerBusinessName,
      itemsCount: part.items.length,
      subtotal: part.subtotal,
      shippingFee,
      taxType,
      taxAmount,
      commissionAmount,
      tcsAmount,
      sellerNetPayout,
      escrowHoldingDays: 7,
      estimatedDelivery: '3-5 Business Days',
    };
  });

  const discountAmount = await computeVerifiedCouponDiscount(cartCouponCode, masterSubtotal);
  const grandTotal = Math.max(0, masterSubtotal + masterShipping - discountAmount);

  return sendResponse(res, 200, 'Checkout summary calculated successfully', {
    buyerState,
    masterSubtotal,
    masterShipping,
    discountAmount,
    grandTotal,
    subOrdersPreview,
  });
});

// @desc    Create Razorpay payment intent
// @route   POST /api/v1/orders/create-payment-intent
export const createPaymentIntent = asyncHandler(async (req, res) => {
  const { amount, currency = 'INR' } = req.body;
  const numericAmount = Number(amount || 1000);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return sendError(res, 400, 'Invalid payment amount');
  }

  const targetAmount = Math.round(numericAmount * 100);
  const gatewayOrderId = `order_rzp_${Date.now()}_${crypto.randomInt(1000, 9999)}`;

  return sendResponse(res, 201, 'Payment intent created', {
    gatewayOrderId,
    amount: targetAmount,
    currency,
    razorpayKey: process.env.RAZORPAY_KEY_ID || (process.env.NODE_ENV !== 'production' ? 'rzp_test_ApexBazaarDemoKey' : ''),
  });
});

// @desc    Confirm payment and create Master + Sub-Orders
// @route   POST /api/v1/orders/confirm (and POST /api/v1/orders)
export const confirmOrder = asyncHandler(async (req, res) => {
  const {
    items,
    shippingAddress,
    paymentMethod = 'Razorpay',
    gatewayOrderId,
    gatewayPaymentId,
    couponCode,
  } = req.body;

  let orderItems = items;
  let activeCouponCode = couponCode;

  if (!orderItems || orderItems.length === 0) {
    const cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      populate: { path: 'sellerId' },
    });
    if (cart && cart.items.length > 0) {
      orderItems = cart.items;
      if (!activeCouponCode && cart.couponCode) {
        activeCouponCode = cart.couponCode;
      }
    }
  }

  if (!orderItems || orderItems.length === 0) {
    return sendError(res, 400, 'Cannot place order with empty items');
  }

  const defaultAddress = req.user.addresses && req.user.addresses[0];
  const finalAddress = {
    fullName: shippingAddress?.fullName || req.user.fullName || 'Shopper',
    phone: shippingAddress?.phone || shippingAddress?.phoneNumber || req.user.phoneNumber || '+919876543210',
    street: shippingAddress?.street || shippingAddress?.addressLine1 || defaultAddress?.addressLine1 || 'Main Street',
    city: shippingAddress?.city || defaultAddress?.city || 'Bangalore',
    state: shippingAddress?.state || defaultAddress?.state || 'Karnataka',
    pincode: shippingAddress?.pincode || shippingAddress?.postalCode || defaultAddress?.postalCode || '560001',
    country: shippingAddress?.country || 'India',
  };

  const masterOrderNumber = generateOrderNumber();
  const sellerGroups = {};
  let masterSubtotal = 0;
  let masterShipping = 0;
  const flattenedItems = [];
  const decrementedStock = [];

  for (const entry of orderItems) {
    const productId = entry.product?._id || entry.product || entry.productId || entry.id;
    const quantity = Number(entry.quantity ?? 1);

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      // Rollback previously decremented stock
      for (const dec of decrementedStock) {
        await Product.findByIdAndUpdate(dec.productId, { $inc: { stock: dec.quantity } });
      }
      return sendError(res, 400, 'Invalid item quantity. Must be an integer between 1 and 99.');
    }

    // Atomic Stock Check & Decrement to prevent overselling under concurrency
    const product = await Product.findOneAndUpdate(
      { _id: productId, stock: { $gte: quantity } },
      { $inc: { stock: -quantity } },
      { new: true }
    ).populate('sellerId');

    if (!product) {
      for (const dec of decrementedStock) {
        await Product.findByIdAndUpdate(dec.productId, { $inc: { stock: dec.quantity } });
      }
      const existing = await Product.findById(productId).select('title stock');
      if (!existing) {
        return sendError(res, 404, 'One or more products in your order could not be found');
      }
      return sendError(res, 400, `Insufficient stock for "${existing.title}" (${existing.stock} available)`);
    }

    decrementedStock.push({ productId: product._id, quantity });

    const seller = product.sellerId || {
      _id: null,
      businessName: 'Apex Direct Retail',
      commissionPercent: 10.0,
      businessAddress: { state: 'Karnataka' },
    };
    const sellerId = seller._id ? seller._id.toString() : 'apex_direct';

    if (!sellerGroups[sellerId]) {
      sellerGroups[sellerId] = {
        sellerId: seller._id,
        sellerBusinessName: seller.businessName || 'Apex Direct Retail',
        sellerState: seller.businessAddress?.state || 'Karnataka',
        commissionPercent: seller.commissionPercent || 10.0,
        subtotal: 0,
        shippingFee: 0,
        items: [],
      };
    }

    // Always use authoritative database product price
    const itemPrice = product.price;
    const lineTotal = itemPrice * quantity;
    masterSubtotal += lineTotal;
    sellerGroups[sellerId].subtotal += lineTotal;

    const orderItemObj = {
      product: product._id,
      title: product.title,
      price: itemPrice,
      quantity,
      attributes: entry.attributes || {},
      imageLight: product.imageLight,
    };
    sellerGroups[sellerId].items.push(orderItemObj);
    flattenedItems.push(orderItemObj);
  }

  const escrowReleaseDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const isProd = process.env.NODE_ENV === 'production';
  const ledgerPromises = [];

  const subOrders = Object.values(sellerGroups).map((part, index) => {
    const isIntrastate = (part.sellerState || '').toLowerCase() === finalAddress.state.toLowerCase();
    const taxType = isIntrastate ? 'CGST_SGST' : 'IGST';
    const taxAmount = Number(((part.subtotal * 0.18) / 1.18).toFixed(2));
    const commissionAmount = Number(((part.subtotal * part.commissionPercent) / 100).toFixed(2));
    const sellerNetPayout = Number((part.subtotal - commissionAmount).toFixed(2));
    const shippingFee = part.subtotal >= 999 ? 0 : 99;
    masterShipping += shippingFee;

    const subOrderNum = `${masterOrderNumber}-S${index + 1}`;
    const deliveryOtp = isProd ? crypto.randomInt(1000, 9999).toString() : '4912';

    if (part.sellerId) {
      ledgerPromises.push(
        SellerProfile.findByIdAndUpdate(
          part.sellerId,
          { $inc: { unsettledEscrowBalance: sellerNetPayout } },
          { new: true }
        ).then((prof) => {
          if (prof) {
            return SellerLedger.create({
              sellerId: part.sellerId,
              referenceType: 'ORDER_CREDIT',
              referenceId: subOrderNum,
              amount: sellerNetPayout,
              balanceAfter: prof.unsettledEscrowBalance,
              description: `Escrow hold for sub-order ${subOrderNum} (T+7 release)`,
            });
          }
          return null;
        })
      );
    }

    return {
      subOrderNumber: subOrderNum,
      sellerId: part.sellerId,
      sellerBusinessName: part.sellerBusinessName,
      items: part.items,
      subtotal: part.subtotal,
      shippingFee,
      taxAmount,
      taxType,
      commissionPercent: part.commissionPercent,
      commissionAmount,
      sellerNetPayout,
      status: 'CONFIRMED',
      escrowStatus: 'HELD',
      escrowReleaseDate,
      shipment: {
        carrierName: 'Delhivery Express',
        trackingNumber: `DEL-${Date.now().toString().slice(-6)}${index}`,
        shippingLabelUrl: `https://cdn.apexbazaar.com/labels/${subOrderNum}.pdf`,
        deliveryOtp,
      },
    };
  });

  await Promise.all(ledgerPromises);

  const discountAmount = await computeVerifiedCouponDiscount(activeCouponCode, masterSubtotal);
  const grandTotal = Math.max(0, masterSubtotal + masterShipping - discountAmount);

  const order = await Order.create({
    orderId: masterOrderNumber,
    user: req.user._id,
    shippingAddress: finalAddress,
    subOrders,
    items: flattenedItems,
    paymentMethod,
    paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid',
    razorpayOrderId: gatewayOrderId || `mock_rzp_${Date.now()}`,
    razorpayPaymentId: gatewayPaymentId || `pay_mock_${Date.now()}`,
    subtotal: masterSubtotal,
    discountAmount,
    shippingFee: masterShipping,
    taxAmount: Number(((masterSubtotal * 0.18) / 1.18).toFixed(2)),
    grandTotal,
    orderStatus: 'Processing',
    trackingHistory: [
      {
        status: 'Order Confirmed',
        location: 'Bangalore Hub',
        timestamp: new Date(),
        note: `Payment authorized via ${paymentMethod}. Decomposed into ${subOrders.length} vendor sub-orders.`,
      },
    ],
  });

  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], discountAmount: 0, couponCode: null });

  return sendResponse(res, 201, 'Order placed successfully', order);
});

// @desc    Get logged in user orders
// @route   GET /api/v1/orders
export const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  return sendResponse(res, 200, 'Orders retrieved successfully', orders);
});

// @desc    Get single order by orderId
// @route   GET /api/v1/orders/:orderId
export const getOrderById = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const query = orderId.match(/^[0-9a-fA-F]{24}$/)
    ? { $or: [{ orderId }, { _id: orderId }] }
    : { orderId };

  const order = await Order.findOne(query);
  if (!order) return sendError(res, 404, 'Order not found');

  if (order.user.toString() !== req.user._id.toString() && (req.user.role || '').toUpperCase() !== 'ADMIN') {
    return sendError(res, 403, 'Access denied: You do not have permission to view this order');
  }

  return sendResponse(res, 200, 'Order details retrieved', order);
});

// @desc    Cancel an order or sub-order
// @route   POST /api/v1/orders/:id/cancel
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return sendError(res, 404, 'Order not found');

  if (order.user.toString() !== req.user._id.toString() && (req.user.role || '').toUpperCase() !== 'ADMIN') {
    return sendError(res, 403, 'Access denied: You do not have permission to cancel this order');
  }

  if (order.orderStatus === 'Delivered' || order.orderStatus === 'Cancelled') {
    return sendError(res, 400, `Cannot cancel an order that is already ${order.orderStatus}`);
  }

  // Restore inventory for cancelled items
  for (const item of order.items) {
    if (item.product && item.quantity > 0) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }
  }

  order.orderStatus = 'Cancelled';
  order.paymentStatus = order.paymentStatus === 'Paid' ? 'Refunded' : 'Cancelled';
  order.subOrders.forEach((so) => {
    so.status = 'CANCELLED';
    so.escrowStatus = 'DEBITED_REFUND';
  });

  await order.save();
  return sendResponse(res, 200, 'Order cancelled and refund initiated', order);
});
