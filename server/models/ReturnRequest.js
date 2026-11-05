import mongoose from 'mongoose';

const returnRequestSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true }, // Master order number
    subOrderNumber: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'SellerProfile' },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productTitle: { type: String, required: true },
    refundAmount: { type: Number, required: true },
    reason: { type: String, required: true },
    customerNotes: { type: String, default: '' },
    proofImageUrls: [{ type: String }],
    reverseAwb: { type: String, default: '' },
    status: {
      type: String,
      enum: ['REQUESTED', 'APPROVED', 'PICKUP_SCHEDULED', 'RECEIVED', 'VERIFIED_REFUNDED', 'REJECTED'],
      default: 'REQUESTED',
    },
    sellerNotes: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.ReturnRequest || mongoose.model('ReturnRequest', returnRequestSchema);

