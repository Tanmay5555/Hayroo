import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const addressSchema = new mongoose.Schema({
  fullName: { type: String, default: '' },
  phoneNumber: { type: String, default: '' },
  addressLine1: { type: String, required: true },
  addressLine2: { type: String, default: '' },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, default: 'India' },
  landmark: { type: String, default: '' },
  isDefault: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true, default: '' },
    phoneNumber: { type: String, required: true, unique: true, trim: true },
    firebaseUid: { type: String, sparse: true, index: true },
    passwordHash: { type: String },
    role: {
      type: String,
      enum: ['CUSTOMER', 'SELLER', 'ADMIN', 'SUPPORT_STAFF', 'DELIVERY_PARTNER'],
      default: 'CUSTOMER',
      index: true,
    },
    isPhoneVerified: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    avatarUrl: { type: String, default: '' },
    sellerProfileId: { type: mongoose.Schema.Types.ObjectId, ref: 'SellerProfile' },
    addresses: [addressSchema],
    isActive: { type: Boolean, default: true },
    // Temporary OTP store for phone verification
    otpCode: { type: String },
    otpExpiresAt: { type: Date },
  },
  { timestamps: true }
);

// Compare password helper
userSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.passwordHash) return false;
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Set password helper
userSchema.methods.setPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(password, salt);
};

export default mongoose.models.User || mongoose.model('User', userSchema);
