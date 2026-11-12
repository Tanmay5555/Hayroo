import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  selectedColor: { type: String, default: '' },
  selectedSize: { type: String, default: '' },
  price: { type: Number, required: true },
});

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, sparse: true },
    guestSessionId: { type: String, index: true },
    items: [cartItemSchema],
    coupon: {
      code: String,
      discountPercent: Number,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Cart', cartSchema);
