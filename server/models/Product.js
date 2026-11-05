import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
  sku: { type: String, required: true },
  title: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  mrp: { type: Number, required: true, min: 0 },
  costPrice: { type: Number, default: 0 },
  stock: { type: Number, required: true, default: 0 },
  attributes: { type: mongoose.Schema.Types.Mixed, default: () => ({}) }, // e.g. { color: "Black", storage: "256GB" }
  images: [{ type: String }],
  isActive: { type: Boolean, default: true },
});

const productSchema = new mongoose.Schema(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'SellerProfile' },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    category: { type: String, required: true, index: true }, // Legacy/convenience category slug/name
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    brand: { type: String, required: true, default: 'Generic' },
    hsnCode: { type: String, default: '85183000' }, // Indian GST HSN code
    description: { type: String, required: true },
    highlights: [{ type: String }],
    images: [{ type: String }],
    imageLight: { type: String, required: true },
    rating: { type: Number, default: 4.8, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 0 },
    // Base pricing & inventory
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    discountTag: { type: String, default: '' },
    stock: { type: Number, required: true, default: 50 },
    // Dynamic specifications
    dynamicAttributes: { type: mongoose.Schema.Types.Mixed, default: () => ({}) },
    specifications: [{ name: String, value: String }],
    // Variant matrix
    variants: [variantSchema],
    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isFlashSale: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

// Search text index
productSchema.index({
  title: 'text',
  description: 'text',
  brand: 'text',
  category: 'text',
  tags: 'text',
});

export default mongoose.models.Product || mongoose.model('Product', productSchema);
