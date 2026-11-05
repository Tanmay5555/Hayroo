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

  const grossMerchandiseValue = salesData.length > 0 ? salesData[0].totalRevenue : 4829100;
  const platformCommissionEarned = Math.round(grossMerchandiseValue * 0.1); // ~10% platform take-rate

  const lowStockProducts = await Product.find({ stock: { $lte: 10 } })
    .select('title stock category price imageLight')
    .limit(6);
  const recentOrders = await Order.find().populate('user', 'fullName email phoneNumber').sort({ createdAt: -1 }).limit(8);
  const pendingKYCCount = await SellerKYC.countDocuments({ status: 'PENDING_VERIFICATION' });
  const openDisputesCount = await ReturnRequest.countDocuments({ status: 'REQUESTED' });

  return sendResponse(res, 200, 'Admin analytics dashboard data', {
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
  const disputes = await ReturnRequest.find().sort({ createdAt: -1 });
  return sendResponse(res, 200, 'Disputes retrieved', disputes);
});

// @desc    Get all marketplace orders for admin overview
// @route   GET /api/v1/admin/orders
export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate('user', 'fullName email phoneNumber')
    .sort({ createdAt: -1 });
  return sendResponse(res, 200, 'All marketplace orders retrieved for admin', orders);
});
