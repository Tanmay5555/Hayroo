import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variantSku: { type: String, default: '' },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  attributes: { type: mongoose.Schema.Types.Mixed, default: () => ({}) },
  imageLight: { type: String },
});

const subOrderSchema = new mongoose.Schema({
  subOrderNumber: { type: String, required: true }, // e.g. "APX-202611-98124-S1"
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'SellerProfile' },
  sellerBusinessName: { type: String, required: true },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  shippingFee: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 }, // GST amount
  taxType: { type: String, enum: ['CGST_SGST', 'IGST'], default: 'IGST' },
  commissionPercent: { type: Number, default: 10.0 },
  commissionAmount: { type: Number, default: 0 },
  sellerNetPayout: { type: Number, default: 0 },
  status: {
    type: String,
    enum: [
      'PENDING_CONFIRMATION',
      'CONFIRMED',
      'PACKED',
      'READY_FOR_PICKUP',
      'IN_TRANSIT',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED',
      'RETURNED',
    ],
    default: 'CONFIRMED',
  },
  escrowStatus: {
    type: String,
    enum: ['HELD', 'RELEASE_ELIGIBLE', 'RELEASED', 'DEBITED_REFUND', 'DISPUTED'],
    default: 'HELD',
  },
  escrowReleaseDate: { type: Date },
  deliveredAt: { type: Date },
  // Shipment & logistics details
  shipment: {
    carrierName: { type: String, default: 'Delhivery Express' },
    trackingNumber: { type: String, default: '' }, // AWB
    shippingLabelUrl: { type: String, default: '' },
    deliveryOtp: { type: String, default: '4912' },
    assignedAgentName: { type: String, default: 'Amit Kumar' },
    assignedAgentPhone: { type: String, default: '+919876543210' },
  },
});

const shippingAddressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  country: { type: String, default: 'India' },
});

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true }, // Master order e.g. "APX-894201"
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    shippingAddress: shippingAddressSchema,
    subOrders: [subOrderSchema], // Multi-vendor partitioned sub-orders
    items: [orderItemSchema], // Combined flattened items for legacy queries
    paymentMethod: {
      type: String,
      enum: ['Razorpay', 'COD', 'Card', 'UPI', 'Stripe'],
      default: 'Razorpay',
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded', 'Partially Refunded'],
      default: 'Paid',
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    subtotal: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    orderStatus: {
      type: String,
      enum: ['Order Placed', 'Processing', 'In Transit', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Order Placed',
    },
    trackingHistory: [
      {
        status: String,
        location: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model('Order', orderSchema);
