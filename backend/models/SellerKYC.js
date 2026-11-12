import mongoose from 'mongoose';

const sellerKycSchema = new mongoose.Schema(
  {
    sellerProfileId: { type: mongoose.Schema.Types.ObjectId, ref: 'SellerProfile', required: true, unique: true },
    gstinNumber: { type: String, trim: true, default: '' },
    panNumber: { type: String, required: true, trim: true },
    bankAccountNumber: { type: String, required: true, trim: true },
    bankIfscCode: { type: String, required: true, trim: true },
    bankAccountName: { type: String, required: true, trim: true },
    businessAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, default: 'India' },
    },
    documentProofUrls: [{ type: String }],
    status: {
      type: String,
      enum: ['NOT_SUBMITTED', 'PENDING_VERIFICATION', 'APPROVED', 'REJECTED'],
      default: 'NOT_SUBMITTED',
    },
    rejectionReason: { type: String, default: '' },
    verifiedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.SellerKYC || mongoose.model('SellerKYC', sellerKycSchema);

