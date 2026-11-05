import ReturnRequest from '../models/ReturnRequest.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import SellerProfile from '../models/SellerProfile.js';
import SellerLedger from '../models/SellerLedger.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse, sendError } from '../utils/apiResponse.js';

// @desc    Initiate an item return
// @route   POST /api/v1/returns
export const createReturnRequest = asyncHandler(async (req, res) => {
  const { orderId, subOrderNumber, productId, reason, customerNotes, proofImageUrls } = req.body;

  if (!orderId || !subOrderNumber || !productId || !reason) {
    return sendError(res, 400, 'Order ID, Sub-Order Number, Product ID, and Reason are required');
  }

  const order = await Order.findOne({ orderId });
  if (!order) return sendError(res, 404, 'Master order not found');

  const subOrder = order.subOrders.find((so) => so.subOrderNumber === subOrderNumber);
  if (!subOrder) return sendError(res, 404, 'Sub-order not found');

  const item = subOrder.items.find((i) => i.product.toString() === productId);
  if (!item) return sendError(res, 404, 'Product not found in this sub-order');

  const refundAmount = item.price * item.quantity;
  const reverseAwb = `REV-DEL-${Date.now().toString().slice(-8)}`;

  const returnReq = await ReturnRequest.create({
    orderId,
    subOrderNumber,
    userId: req.user._id,
    sellerId: subOrder.sellerId,
    productId,
    productTitle: item.title,
    refundAmount,
    reason,
    customerNotes: customerNotes || '',
    proofImageUrls: proofImageUrls || [],
    reverseAwb,
    status: 'REQUESTED',
  });

  // Suspend escrow payout for this sub-order
  subOrder.escrowStatus = 'DISPUTED';
  await order.save();

  return sendResponse(res, 201, 'Return request initiated. Reverse pickup scheduled.', returnReq);
});

// @desc    Get customer's returns
// @route   GET /api/v1/returns
export const getMyReturns = asyncHandler(async (req, res) => {
  const returns = await ReturnRequest.find({ userId: req.user._id }).sort({ createdAt: -1 });
  return sendResponse(res, 200, 'Returns retrieved', returns);
});

// @desc    Seller / Admin inspects returned item and approves refund
// @route   POST /api/v1/returns/:id/verify
export const verifyReturnAndRefund = asyncHandler(async (req, res) => {
  const { decision, sellerNotes } = req.body; // "APPROVED" or "REJECTED"
  const returnReq = await ReturnRequest.findById(req.params.id);
  if (!returnReq) return sendError(res, 404, 'Return request not found');

  if (decision === 'APPROVED') {
    returnReq.status = 'VERIFIED_REFUNDED';
    returnReq.sellerNotes = sellerNotes || 'Item verified in good condition. Refund approved.';
    await returnReq.save();

    // Restock product inventory
    await Product.findByIdAndUpdate(returnReq.productId, { $inc: { stock: 1 } });

    // Debit seller unsettled escrow
    if (returnReq.sellerId) {
      const seller = await SellerProfile.findById(returnReq.sellerId);
      if (seller) {
        seller.unsettledEscrowBalance = Math.max(0, (seller.unsettledEscrowBalance || 0) - returnReq.refundAmount);
        await seller.save();

        await SellerLedger.create({
          sellerId: returnReq.sellerId,
          referenceType: 'REFUND_DEBIT',
          referenceId: returnReq.subOrderNumber,
          amount: -returnReq.refundAmount,
          balanceAfter: seller.unsettledEscrowBalance,
          description: `Refund debited for returned item in ${returnReq.subOrderNumber}`,
        });
      }
    }

    return sendResponse(res, 200, 'Return approved and customer refund processed', returnReq);
  } else {
    returnReq.status = 'REJECTED';
    returnReq.sellerNotes = sellerNotes || 'Item damaged or missing original accessories.';
    await returnReq.save();
    return sendResponse(res, 200, 'Return rejected with documented reason', returnReq);
  }
});

