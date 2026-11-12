import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    icon: { type: String, default: 'Package' },
    imageUrl: { type: String, default: '' },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    commissionPercent: { type: Number, default: 10.0 }, // Category take rate
    returnWindowDays: { type: Number, default: 7 },
    attributeSchema: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({
        attributes: [],
      }),
    },
    featured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Category || mongoose.model('Category', categorySchema);
