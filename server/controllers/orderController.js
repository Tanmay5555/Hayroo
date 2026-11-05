import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import SellerProfile from '../models/SellerProfile.js';
import SellerLedger from '../models/SellerLedger.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse, sendError } from '../utils/apiResponse.js';

// Helper to generate unique order numbers
const generateOrderNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `APX-${dateStr}-${random}`;
};

// @desc    Calculate checkout summary with split sub-orders and tax breakdown
// @route   POST /api/v1/orders/checkout-summary
export const checkoutSummary = asyncHandler(async (req, res) => {
  const { shippingAddress, items, couponCode } = req.body;
  const buyerState = shippingAddress?.state || 'Karnataka';

  let rawItems = items;
  if (!rawItems || rawItems.length === 0) {
    const cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      populate: { path: 'sellerId' },
    });
    if (!cart || cart.items.length === 0) {
      return sendError(res, 400, 'Cannot generate checkout summary for empty cart');
    }
    rawItems = cart.items;
  }

  const sellerPartitions = {};
  let masterSubtotal = 0;
  let masterShipping = 0;

  for (const entry of rawItems) {
    const productId = entry.product?._id || entry.product || entry.productId || entry.id;
    const quantity = entry.quantity || 1;
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

    const itemPrice = entry.price || product.price;
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

  // Calculate taxes, commissions, and shipping per vendor
  const subOrdersPreview = Object.values(sellerPartitions).map((part, index) => {
    const isIntrastate = part.sellerState.toLowerCase() === buyerState.toLowerCase();
    const taxType = isIntrastate ? 'CGST_SGST' : 'IGST';
    const taxAmount = Number(((part.subtotal * 0.18) / 1.18).toFixed(2)); // Included GST
    const commissionAmount = Number(((part.subtotal * part.commissionPercent) / 100).toFixed(2));
    const tcsAmount = Number((part.subtotal * 0.01).toFixed(2)); // 1% Indian GST TCS
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

  const discountAmount = req.body.discountAmount || 0;
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
  const { amount, currency = 'INR', shippingAddressId } = req.body;
  const targetAmount = Math.round((amount || 1000) * 100); // In paise

  // Simulated / Mock Razorpay Order ID for sandbox execution
  const gatewayOrderId = `order_rzp_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

  return sendResponse(res, 201, 'Payment intent created', {
    gatewayOrderId,
    amount: targetAmount,
    currency,
    razorpayKey: process.env.RAZORPAY_KEY_ID || 'rzp_test_ApexBazaarDemoKey',
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
    discountAmount = 0,
  } = req.body;

  let orderItems = items;
  if (!orderItems || orderItems.length === 0) {
    const cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      populate: { path: 'sellerId' },
    });
    if (cart && cart.items.length > 0) {
      orderItems = cart.items;
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

  for (const entry of orderItems) {
    const productId = entry.product?._id || entry.product || entry.productId || entry.id;
    const quantity = Number(entry.quantity || 1);
    const product = await Product.findById(productId).populate('sellerId');
    if (!product) continue;

    // Atomic Stock Check & Decrement
    if (product.stock >= quantity) {
      product.stock -= quantity;
      await product.save();
    }

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

    const itemPrice = entry.price || product.price;
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

  // Construct Sub-Orders with Escrow HELD and T+7 days release
  const escrowReleaseDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const subOrders = Object.values(sellerGroups).map((part, index) => {
    const isIntrastate = (part.sellerState || '').toLowerCase() === finalAddress.state.toLowerCase();
    const taxType = isIntrastate ? 'CGST_SGST' : 'IGST';
    const taxAmount = Number(((part.subtotal * 0.18) / 1.18).toFixed(2));
    const commissionAmount = Number(((part.subtotal * part.commissionPercent) / 100).toFixed(2));
    const sellerNetPayout = Number((part.subtotal - commissionAmount).toFixed(2));
    const shippingFee = part.subtotal >= 999 ? 0 : 99;
    masterShipping += shippingFee;

    const subOrderNum = `${masterOrderNumber}-S${index + 1}`;

    // Record unsettled escrow credit in seller profile if seller exists
    if (part.sellerId) {
      SellerProfile.findById(part.sellerId).then((prof) => {
        if (prof) {
          prof.unsettledEscrowBalance = (prof.unsettledEscrowBalance || 0) + sellerNetPayout;
          prof.save();
          // Write ledger entry
          SellerLedger.create({
            sellerId: part.sellerId,
            referenceType: 'ORDER_CREDIT',
            referenceId: subOrderNum,
            amount: sellerNetPayout,
            balanceAfter: prof.unsettledEscrowBalance,
            description: `Escrow hold for sub-order ${subOrderNum} (T+7 release)`,
          });
        }
      });
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
        deliveryOtp: '4912',
      },
    };
  });

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

  // Clear customer cart
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
  const order = await Order.findOne({
    $or: [{ orderId }, { _id: orderId.match(/^[0-9a-fA-F]{24}$/) ? orderId : null }],
  });

  if (!order) return sendError(res, 404, 'Order not found');
  return sendResponse(res, 200, 'Order details retrieved', order);
});

// @desc    Cancel an order or sub-order
// @route   POST /api/v1/orders/:id/cancel
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return sendError(res, 404, 'Order not found');

  order.orderStatus = 'Cancelled';
  order.paymentStatus = order.paymentStatus === 'Paid' ? 'Refunded' : 'Cancelled';
  order.subOrders.forEach((so) => {
    so.status = 'CANCELLED';
    so.escrowStatus = 'DEBITED_REFUND';
  });

  await order.save();
  return sendResponse(res, 200, 'Order cancelled and refund initiated', order);
});
