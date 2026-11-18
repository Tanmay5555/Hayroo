import SellerProfile from '../models/SellerProfile.js';
import SellerKYC from '../models/SellerKYC.js';
import SellerLedger from '../models/SellerLedger.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse, sendError } from '../utils/apiResponse.js';

// Helper to get or create seller profile for authenticated seller
const getSellerProfile = async (userId) => {
  let profile = await SellerProfile.findOne({ userId });
  if (!profile) {
    profile = await SellerProfile.create({
      userId,
      businessName: 'Vendor Store',
      businessEmail: 'vendor@apexbazaar.com',
      businessPhone: '+919876543210',
      storeSlug: `store-${userId.toString().slice(-6)}`,
      isApproved: true,
    });
  }
  return profile;
};

// @desc    Submit seller KYC
// @route   POST /api/v1/seller/kyc/submit
export const submitKYC = asyncHandler(async (req, res) => {
  const profile = await getSellerProfile(req.user._id);
  const { gstinNumber, panNumber, bankAccountNumber, bankIfscCode, bankAccountName, businessAddress, documentProofUrls } =
    req.body;

  if (!panNumber || !bankAccountNumber || !bankIfscCode || !bankAccountName) {
    return sendError(res, 400, 'PAN, Bank Account Number, IFSC, and Account Name are required');
  }

  let kyc = await SellerKYC.findOne({ sellerProfileId: profile._id });
  if (!kyc) {
    kyc = await SellerKYC.create({
      sellerProfileId: profile._id,
      gstinNumber,
      panNumber,
      bankAccountNumber,
      bankIfscCode,
      bankAccountName,
      businessAddress: businessAddress || { street: 'Main Rd', city: 'Bangalore', state: 'Karnataka', postalCode: '560001' },
      documentProofUrls: documentProofUrls || [],
      status: 'PENDING_VERIFICATION',
    });
  } else {
    kyc.gstinNumber = gstinNumber || kyc.gstinNumber;
    kyc.panNumber = panNumber;
    kyc.bankAccountNumber = bankAccountNumber;
    kyc.bankIfscCode = bankIfscCode;
    kyc.bankAccountName = bankAccountName;
    if (businessAddress) kyc.businessAddress = businessAddress;
    if (documentProofUrls) kyc.documentProofUrls = documentProofUrls;
    kyc.status = 'PENDING_VERIFICATION';
    await kyc.save();
  }

  return sendResponse(res, 200, 'KYC submitted successfully and queued for verification', {
    kycStatus: kyc.status,
    submittedAt: kyc.updatedAt,
  });
});

// @desc    Get KYC status
// @route   GET /api/v1/seller/kyc/status
export const getKYCStatus = asyncHandler(async (req, res) => {
  const profile = await getSellerProfile(req.user._id);
  const kyc = await SellerKYC.findOne({ sellerProfileId: profile._id });

  return sendResponse(res, 200, 'KYC status retrieved', {
    isApproved: profile.isApproved,
    kyc: kyc || { status: 'NOT_SUBMITTED' },
  });
});

// @desc    Get seller's products
// @route   GET /api/v1/seller/products
export const getSellerProducts = asyncHandler(async (req, res) => {
  const profile = await getSellerProfile(req.user._id);
  const products = await Product.find({ sellerId: profile._id }).sort({ createdAt: -1 });
  return sendResponse(res, 200, 'Seller products retrieved', products);
});

// @desc    Create product under seller
// @route   POST /api/v1/seller/products
export const createSellerProduct = asyncHandler(async (req, res) => {
  const profile = await getSellerProfile(req.user._id);
  const { title, description, price, originalPrice, category, brand, hsnCode, stock, images, imageLight, dynamicAttributes, discountTag } =
    req.body;

  if (!title || !description || price === undefined || !category) {
    return sendError(res, 400, 'Title, description, price, and category are required');
  }
  const numPrice = Number(price);
  const numStock = stock !== undefined ? Number(stock) : 50;
  if (!Number.isFinite(numPrice) || numPrice <= 0) {
    return sendError(res, 400, 'Product price must be greater than 0');
  }
  if (!Number.isFinite(numStock) || numStock < 0) {
    return sendError(res, 400, 'Product stock cannot be negative');
  }

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4);
  const product = await Product.create({
    sellerId: profile._id,
    title: String(title).trim(),
    slug,
    description: String(description).trim(),
    price: numPrice,
    originalPrice: originalPrice ? Number(originalPrice) : numPrice * 1.25,
    discountTag: discountTag || '',
    category,
    brand: brand || profile.businessName,
    hsnCode: hsnCode || '85183000',
    stock: numStock,
    imageLight: imageLight || (images && images[0]) || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80',
    images: images || [],
    dynamicAttributes: dynamicAttributes || {},
  });

  return sendResponse(res, 201, 'Product listed successfully', product);
});

// @desc    Update product under seller
// @route   PUT /api/v1/seller/products/:id
export const updateSellerProduct = asyncHandler(async (req, res) => {
  const profile = await getSellerProfile(req.user._id);
  const { id } = req.params;

  const query = req.user.role === 'ADMIN' ? { _id: id } : { _id: id, sellerId: profile._id };
  const product = await Product.findOne(query);
  if (!product) {
    return sendError(res, 404, 'Product not found or not owned by seller');
  }

  const {
    title,
    description,
    price,
    originalPrice,
    category,
    brand,
    hsnCode,
    stock,
    imageLight,
    images,
    discountTag,
  } = req.body;

  if (title !== undefined) product.title = String(title).trim();
  if (description !== undefined) product.description = String(description).trim();
  if (price !== undefined) {
    const numPrice = Number(price);
    if (!Number.isFinite(numPrice) || numPrice <= 0) {
      return sendError(res, 400, 'Price must be greater than 0');
    }
    product.price = numPrice;
  }
  if (originalPrice !== undefined) product.originalPrice = Number(originalPrice);
  if (category !== undefined) product.category = category;
  if (brand !== undefined) product.brand = brand;
  if (hsnCode !== undefined) product.hsnCode = hsnCode;
  if (stock !== undefined) {
    const numStock = Number(stock);
    if (!Number.isFinite(numStock) || numStock < 0) {
      return sendError(res, 400, 'Stock cannot be negative');
    }
    product.stock = numStock;
  }
  if (imageLight !== undefined) product.imageLight = imageLight;
  if (images !== undefined) product.images = images;
  if (discountTag !== undefined) product.discountTag = discountTag;

  await product.save();
  return sendResponse(res, 200, 'Product updated successfully', product);
});

// @desc    Delete product under seller
// @route   DELETE /api/v1/seller/products/:id
export const deleteSellerProduct = asyncHandler(async (req, res) => {
  const profile = await getSellerProfile(req.user._id);
  const { id } = req.params;

  const query = req.user.role === 'ADMIN' ? { _id: id } : { _id: id, sellerId: profile._id };
  const product = await Product.findOne(query);
  if (!product) {
    return sendError(res, 404, 'Product not found or not owned by seller');
  }

  await Product.deleteOne({ _id: id });
  return sendResponse(res, 200, 'Product removed successfully from marketplace');
});

// @desc    Get seller's sub-orders
// @route   GET /api/v1/seller/orders
export const getSellerOrders = asyncHandler(async (req, res) => {
  const profile = await getSellerProfile(req.user._id);
  // Find all orders that have a sub-order for this seller
  const orders = await Order.find({ 'subOrders.sellerId': profile._id }).sort({ createdAt: -1 });

  // Extract relevant sub-orders with customer shipping info
  const sellerSubOrders = [];
  orders.forEach((ord) => {
    ord.subOrders.forEach((so) => {
      if (so.sellerId && so.sellerId.toString() === profile._id.toString()) {
        sellerSubOrders.push({
          masterOrderId: ord.orderId,
          orderDbId: ord._id,
          subOrderNumber: so.subOrderNumber,
          subOrderId: so._id,
          status: so.status,
          escrowStatus: so.escrowStatus,
          escrowReleaseDate: so.escrowReleaseDate,
          subtotal: so.subtotal,
          shippingFee: so.shippingFee,
          commissionAmount: so.commissionAmount,
          sellerNetPayout: so.sellerNetPayout,
          items: so.items,
          shippingAddress: ord.shippingAddress,
          createdAt: ord.createdAt,
          shipment: so.shipment,
        });
      }
    });
  });

  return sendResponse(res, 200, 'Seller sub-orders retrieved', sellerSubOrders);
});

// @desc    Generate shipping label & AWB for sub-order
// @route   POST /api/v1/seller/orders/:subOrderId/generate-label
export const generateShippingLabel = asyncHandler(async (req, res) => {
  const { subOrderId } = req.params;
  const order = await Order.findOne({ 'subOrders._id': subOrderId });
  if (!order) return sendError(res, 404, 'Sub-order not found');

  const subOrder = order.subOrders.id(subOrderId);
  if (!subOrder) return sendError(res, 404, 'Sub-order not found');

  const isAdmin = (req.user.role || '').toUpperCase() === 'ADMIN';
  if (!isAdmin) {
    const profile = await getSellerProfile(req.user._id);
    if (!subOrder.sellerId || subOrder.sellerId.toString() !== profile._id.toString()) {
      return sendError(res, 403, 'Access denied: You do not own this sub-order');
    }
  }

  const awb = `AWB-DEL-${Date.now().toString().slice(-8)}`;
  const existingOtp = subOrder.shipment?.deliveryOtp;

  subOrder.status = 'READY_FOR_PICKUP';
  subOrder.shipment = {
    carrierName: 'Delhivery Express',
    trackingNumber: awb,
    shippingLabelUrl: `https://cdn.apexbazaar.com/labels/${awb}.pdf`,
    deliveryOtp: existingOtp || '4912',
    assignedAgentName: 'Amit Kumar',
    assignedAgentPhone: '+919876543210',
  };

  await order.save();

  return sendResponse(res, 200, 'Shipping label and AWB generated successfully', {
    subOrderId,
    trackingNumber: awb,
    carrierName: 'Delhivery Express',
    shippingLabelUrl: subOrder.shipment.shippingLabelUrl,
    status: 'READY_FOR_PICKUP',
  });
});

// @desc    Get seller's financial ledger & balance
// @route   GET /api/v1/seller/ledger
export const getSellerLedger = asyncHandler(async (req, res) => {
  const profile = await getSellerProfile(req.user._id);
  const ledgerEntries = await SellerLedger.find({ sellerId: profile._id }).sort({ createdAt: -1 });

  return sendResponse(res, 200, 'Seller ledger retrieved', {
    currentBalance: profile.currentBalance || 0,
    unsettledEscrowBalance: profile.unsettledEscrowBalance || 0,
    ledgerEntries,
  });
});

