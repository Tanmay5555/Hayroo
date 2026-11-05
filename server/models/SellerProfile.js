import mongoose from 'mongoose';

const sellerProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    businessName: { type: String, required: true, trim: true },
    businessEmail: { type: String, required: true, lowercase: true, trim: true },
    businessPhone: { type: String, required: true, trim: true },
    storeSlug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    storeDescription: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    bannerUrl: { type: String, default: '' },
    commissionPercent: { type: Number, default: 10.0 }, // default 10%
    ratingAverage: { type: Number, default: 4.8 },
    ratingCount: { type: Number, default: 0 },
    isApproved: { type: Boolean, default: false },
    isVacationMode: { type: Boolean, default: false },
    currentBalance: { type: Number, default: 0 },
    unsettledEscrowBalance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.SellerProfile || mongoose.model('SellerProfile', sellerProfileSchema);

