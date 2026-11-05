import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import SellerProfile from '../models/SellerProfile.js';
import Coupon from '../models/Coupon.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse, sendError } from '../utils/apiResponse.js';

const findOrCreateCart = async (userId, guestSessionId) => {
  let cart = null;
  if (userId) {
    cart = await Cart.findOne({ user: userId }).populate({
      path: 'items.product',
      populate: { path: 'sellerId', select: 'businessName storeSlug ratingAverage' },
    });
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }
  } else if (guestSessionId) {
    cart = await Cart.findOne({ guestSessionId }).populate({
      path: 'items.product',
      populate: { path: 'sellerId', select: 'businessName storeSlug ratingAverage' },
    });
    if (!cart) {
      cart = await Cart.create({ guestSessionId, items: [] });
    }
  }
  return cart;
};

// Formats cart into multi-seller groups per PRD and API spec
const formatCartResponse = (cart) => {
  if (!cart || !cart.items || cart.items.length === 0) {
    return {
      cartId: cart?._id,
      items: [],
      itemsBySeller: [],
      summary: { subtotal: 0, shippingTotal: 0, discountTotal: 0, taxEstimated: 0, grandTotal: 0 },
    };
  }

  const sellerGroups = {};
  let subtotal = 0;

  cart.items.forEach((item) => {
    const product = item.product;
    if (!product) return;

    const seller = product.sellerId || {
      _id: 'default_seller',
      businessName: 'Apex Direct Retail',
    };
    const sellerId = seller._id ? seller._id.toString() : 'default_seller';

    if (!sellerGroups[sellerId]) {
      sellerGroups[sellerId] = {
        sellerId,
        businessName: seller.businessName || 'Apex Direct',
        rating: seller.ratingAverage || 4.9,
        estimatedDelivery: '2-3 Business Days',
        sellerSubtotal: 0,
        sellerShippingFee: 0,
        items: [],
      };
    }

    const lineTotal = (item.price || product.price) * item.quantity;
    subtotal += lineTotal;
    sellerGroups[sellerId].sellerSubtotal += lineTotal;

    sellerGroups[sellerId].items.push({
      itemId: item._id,
      productId: product._id,
      title: product.title,
      slug: product.slug,
      imageLight: item.imageLight || product.imageLight,
      price: item.price || product.price,
      quantity: item.quantity,
      selectedColor: item.selectedColor,
      selectedSize: item.selectedSize,
      lineTotal,
      stockAvailable: product.stock,
    });
  });

  // Calculate seller shipping fees (e.g. Free shipping if subtotal >= 999 per seller, else ₹99)
  let shippingTotal = 0;
  const itemsBySeller = Object.values(sellerGroups).map((group) => {
    if (group.sellerSubtotal < 999 && group.sellerSubtotal > 0) {
      group.sellerShippingFee = 99;
    } else {
      group.sellerShippingFee = 0;
    }
    shippingTotal += group.sellerShippingFee;
    return group;
  });

  const discountTotal = cart.discountAmount || 0;
  const taxEstimated = Number(((subtotal * 0.18) / 1.18).toFixed(2)); // 18% included GST
  const grandTotal = Math.max(0, subtotal + shippingTotal - discountTotal);

  return {
    cartId: cart._id,
    items: cart.items,
    itemsBySeller,
    couponCode: cart.couponCode || '',
    summary: {
      subtotal,
      shippingTotal,
      discountTotal,
      taxEstimated,
      grandTotal,
    },
  };
};

// @desc    Get user/guest cart
// @route   GET /api/v1/cart
export const getCart = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const guestSessionId = req.headers['x-guest-session-id'] || req.query.sessionId || 'guest-session';

  const cart = await findOrCreateCart(userId, guestSessionId);
  return sendResponse(res, 200, 'Cart retrieved successfully', formatCartResponse(cart));
});

// @desc    Add item to cart
// @route   POST /api/v1/cart/items (and POST /api/v1/cart/add)
export const addToCart = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const guestSessionId = req.headers['x-guest-session-id'] || req.body.sessionId || 'guest-session';
  const { productId, productVariantId, quantity = 1, selectedColor, selectedSize } = req.body;

  const targetId = productId || productVariantId;
  const product = await Product.findById(targetId);
  if (!product) return sendError(res, 404, 'Product not found');

  let cart = await findOrCreateCart(userId, guestSessionId);
  if (!cart) {
    cart = await Cart.create({ user: userId, guestSessionId, items: [] });
  }

  const existingIndex = cart.items.findIndex(
    (item) => item.product?._id?.toString() === targetId || item.product?.toString() === targetId
  );

  if (existingIndex > -1) {
    cart.items[existingIndex].quantity += Number(quantity);
  } else {
    cart.items.push({
      product: targetId,
      quantity: Number(quantity),
      selectedColor: selectedColor || '',
      selectedSize: selectedSize || '',
      price: product.price,
      imageLight: product.imageLight,
    });
  }

  await cart.save();
  const reloaded = await findOrCreateCart(userId, guestSessionId);
  return sendResponse(res, 200, 'Item added to cart successfully', formatCartResponse(reloaded));
});

// @desc    Update cart item quantity
// @route   PUT /api/v1/cart/items/:id (and PUT /api/v1/cart/update)
export const updateCartItem = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const guestSessionId = req.headers['x-guest-session-id'] || req.body.sessionId || 'guest-session';
  const itemId = req.params.id || req.body.itemId;
  const quantity = Number(req.body.quantity);

  const cart = await findOrCreateCart(userId, guestSessionId);
  if (!cart) return sendError(res, 404, 'Cart not found');

  if (quantity <= 0) {
    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
  } else {
    const item = cart.items.find((item) => item._id.toString() === itemId);
    if (item) {
      item.quantity = quantity;
    }
  }

  await cart.save();
  const reloaded = await findOrCreateCart(userId, guestSessionId);
  return sendResponse(res, 200, 'Cart updated successfully', formatCartResponse(reloaded));
});

// @desc    Remove item from cart
// @route   DELETE /api/v1/cart/items/:id (and DELETE /api/v1/cart/remove/:itemId)
export const removeCartItem = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const guestSessionId = req.headers['x-guest-session-id'] || req.query.sessionId || 'guest-session';
  const itemId = req.params.id || req.params.itemId;

  const cart = await findOrCreateCart(userId, guestSessionId);
  if (!cart) return sendError(res, 404, 'Cart not found');

  cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
  await cart.save();

  const reloaded = await findOrCreateCart(userId, guestSessionId);
  return sendResponse(res, 200, 'Item removed from cart', formatCartResponse(reloaded));
});

// @desc    Apply coupon to cart
// @route   POST /api/v1/cart/apply-coupon
export const applyCoupon = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const guestSessionId = req.headers['x-guest-session-id'] || req.body.sessionId || 'guest-session';
  const { code } = req.body;

  if (!code) return sendError(res, 400, 'Coupon code is required');

  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  if (!coupon) return sendError(res, 400, 'Invalid or expired coupon code');

  const cart = await findOrCreateCart(userId, guestSessionId);
  if (!cart || cart.items.length === 0) return sendError(res, 400, 'Cart is empty');

  const subtotal = cart.items.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);
  if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
    return sendError(res, 400, `Minimum cart value of ₹${coupon.minOrderValue} required for this coupon`);
  }

  let discount;
  if (coupon.discountType === 'percentage' || coupon.discountType === 'PERCENTAGE') {
    discount = (subtotal * coupon.discountValue) / 100;
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else {
    discount = coupon.discountValue;
  }

  cart.discountAmount = discount;
  cart.couponCode = coupon.code;
  await cart.save();

  const reloaded = await findOrCreateCart(userId, guestSessionId);
  return sendResponse(res, 200, `Coupon '${coupon.code}' applied! You saved ₹${discount}`, formatCartResponse(reloaded));
});

// @desc    Clear cart
// @route   DELETE /api/v1/cart
export const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const guestSessionId = req.headers['x-guest-session-id'] || req.query.sessionId || 'guest-session';

  const cart = await findOrCreateCart(userId, guestSessionId);
  if (cart) {
    cart.items = [];
    cart.discountAmount = 0;
    cart.couponCode = null;
    await cart.save();
  }

  return sendResponse(res, 200, 'Cart cleared', { items: [] });
});
