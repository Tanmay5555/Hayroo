import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import SellerProfile from '../models/SellerProfile.js';
import SellerKYC from '../models/SellerKYC.js';
import ReturnRequest from '../models/ReturnRequest.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse, sendError } from '../utils/apiResponse.js';

// @desc    Get comprehensive marketplace admin analytics
// @route   GET /api/v1/admin/analytics/overview (and /api/v1/admin/stats)
export const getAdminStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalSellers, totalProducts, totalOrders] = await Promise.all([
    User.countDocuments({ role: 'CUSTOMER' }),
    SellerProfile.countDocuments(),
    Product.countDocuments(),
    Order.countDocuments(),
  ]);

  const salesData = await Order.aggregate([
    { $match: { paymentStatus: 'Paid' } },
    { $group: { _id: null, totalRevenue: { $sum: '$grandTotal' } } },
  ]);

  const grossMerchandiseValue = salesData.length > 0 ? salesData[0].totalRevenue : 0;
  const platformCommissionEarned = Math.round(grossMerchandiseValue * 0.1);

  const lowStockProducts = await Product.find({ stock: { $lte: 10 } })
    .select('title stock category price imageLight')
    .limit(6);
  const recentOrders = await Order.find().populate('user', 'fullName email phoneNumber').sort({ createdAt: -1 }).limit(8);
  const pendingKYCCount = await SellerKYC.countDocuments({ status: 'PENDING_VERIFICATION' });
  const openDisputesCount = await ReturnRequest.countDocuments({ status: 'REQUESTED' });

  return sendResponse(res, 200, 'Admin analytics dashboard data', {
    totalSales: grossMerchandiseValue,
    ordersCount: totalOrders,
    usersCount: totalUsers,
    metrics: {
      grossMerchandiseValue,
      platformCommissionEarned,
      totalUsers,
      totalSellers,
      totalProducts,
      totalOrders,
      averageOrderValue: totalOrders > 0 ? Math.round(grossMerchandiseValue / totalOrders) : 0,
      pendingKYCCount,
      openDisputesCount,
    },
    lowStockProducts,
    recentOrders,
  });
});

// @desc    Get pending seller KYC verification queue
// @route   GET /api/v1/admin/sellers/pending
export const getPendingSellers = asyncHandler(async (req, res) => {
  const pendingKYCs = await SellerKYC.find().populate({
    path: 'sellerProfileId',
    populate: { path: 'userId', select: 'fullName email phoneNumber' },
  });

  return sendResponse(res, 200, 'Pending seller KYC applications retrieved', pendingKYCs);
});

// @desc    Approve or reject seller KYC
// @route   POST /api/v1/admin/sellers/:id/kyc-decision
export const decideSellerKyc = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { decision, customCommissionPercent, rejectionReason } = req.body; // "APPROVED" or "REJECTED"

  const kyc = await SellerKYC.findById(id).populate('sellerProfileId');
  if (!kyc) return sendError(res, 404, 'KYC application not found');

  if (decision === 'APPROVED') {
    kyc.status = 'APPROVED';
    kyc.verifiedAt = new Date();
    await kyc.save();

    if (kyc.sellerProfileId) {
      kyc.sellerProfileId.isApproved = true;
      if (customCommissionPercent !== undefined) {
        kyc.sellerProfileId.commissionPercent = Number(customCommissionPercent);
      }
      await kyc.sellerProfileId.save();
    }

    return sendResponse(res, 200, 'Seller KYC approved and store activated for trading', kyc);
  } else {
    kyc.status = 'REJECTED';
    kyc.rejectionReason = rejectionReason || 'Documents illegible or GSTIN mismatch.';
    await kyc.save();

    if (kyc.sellerProfileId) {
      kyc.sellerProfileId.isApproved = false;
      await kyc.sellerProfileId.save();
    }

    return sendResponse(res, 200, 'Seller KYC rejected with documented feedback', kyc);
  }
});

// @desc    Get dispute arbitration tickets
// @route   GET /api/v1/admin/disputes
export const getDisputes = asyncHandler(async (req, res) => {
  const disputes = await ReturnRequest.find()
    .populate('userId', 'fullName email phoneNumber')
    .populate('sellerId', 'businessName businessEmail businessPhone')
    .sort({ createdAt: -1 });
  return sendResponse(res, 200, 'Disputes retrieved', disputes);
});

// @desc    Get all marketplace orders for admin overview
// @route   GET /api/v1/admin/orders
export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate('user', 'fullName email phoneNumber')
    .sort({ createdAt: -1 })
    .limit(100);
  return sendResponse(res, 200, 'All marketplace orders retrieved for admin', orders);
});

const STATUS_MAP = {
  Placed: 'Order Placed',
  Confirmed: 'Processing',
  Dispatched: 'In Transit',
  Delivered: 'Delivered',
  Cancelled: 'Cancelled',
  'Order Placed': 'Order Placed',
  Processing: 'Processing',
  'In Transit': 'In Transit',
  'Out for Delivery': 'Out for Delivery',
};

// @desc    Update order status (Admin)
// @route   PATCH /api/v1/admin/orders/:id/status
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const mappedStatus = STATUS_MAP[status];
  if (!mappedStatus) {
    return sendError(res, 400, 'Invalid order status value');
  }

  const order = await Order.findById(req.params.id);
  if (!order) return sendError(res, 404, 'Order not found');

  order.orderStatus = mappedStatus;
  order.trackingHistory.push({
    status: mappedStatus,
    location: 'Admin Dispatch Control',
    timestamp: new Date(),
    note: `Order status updated to ${mappedStatus} by administrator`,
  });
  await order.save();

  return sendResponse(res, 200, 'Order status updated successfully', order);
});

// @desc    Get all registered users (Admin)
// @route   GET /api/v1/admin/users
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find()
    .select('-password -refreshToken')
    .sort({ createdAt: -1 })
    .limit(100);
  return sendResponse(res, 200, 'Users retrieved successfully', users);
});

// @desc    Update user role & account status (Admin)
// @route   PATCH /api/v1/admin/users/:id/role
export const updateUserRole = asyncHandler(async (req, res) => {
  const { role, isActive } = req.body;
  const validRoles = ['CUSTOMER', 'SELLER', 'ADMIN', 'DELIVERY_PARTNER', 'SUPPORT_STAFF'];

  const user = await User.findById(req.params.id);
  if (!user) return sendError(res, 404, 'User not found');

  if (role) {
    if (!validRoles.includes(role)) {
      return sendError(res, 400, 'Invalid role value');
    }
    user.role = role;
  }

  if (typeof isActive === 'boolean') {
    user.isActive = isActive;
  }

  await user.save();
  return sendResponse(res, 200, `User account updated successfully`, user);
});

// @desc    Get all registered sellers (Admin)
// @route   GET /api/v1/admin/sellers
export const getAllSellers = asyncHandler(async (req, res) => {
  const sellers = await SellerProfile.find()
    .populate('userId', 'fullName email phoneNumber')
    .sort({ createdAt: -1 });
  return sendResponse(res, 200, 'Sellers retrieved successfully', sellers);
});

// @desc    Toggle seller active/approved status
// @route   PATCH /api/v1/admin/sellers/:id/toggle-status
export const toggleSellerStatus = asyncHandler(async (req, res) => {
  const seller = await SellerProfile.findById(req.params.id);
  if (!seller) return sendError(res, 404, 'Seller not found');

  seller.isApproved = !seller.isApproved;
  await seller.save();
  return sendResponse(res, 200, `Seller status updated to ${seller.isApproved ? 'Active' : 'Suspended'}`, seller);
});

// @desc    Resolve dispute arbitration ticket
// @route   PATCH /api/v1/admin/disputes/:id
export const resolveDispute = asyncHandler(async (req, res) => {
  const { status, adminNotes } = req.body;
  const dispute = await ReturnRequest.findById(req.params.id);
  if (!dispute) return sendError(res, 404, 'Dispute ticket not found');

  if (status) dispute.status = status;
  if (adminNotes) dispute.adminNotes = adminNotes;
  await dispute.save();

  return sendResponse(res, 200, 'Dispute resolved successfully', dispute);
});
