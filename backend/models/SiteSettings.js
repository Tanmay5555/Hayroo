import mongoose from 'mongoose';

const siteSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'global_theme_settings',
      unique: true,
      index: true,
    },
    activeTheme: {
      type: String,
      enum: ['default', 'diwali', 'holi', 'eid', 'christmas', 'independence', 'monsoon'],
      default: 'default',
    },
    isFestivalMode: {
      type: Boolean,
      default: false,
    },
    festivalBannerText: {
      type: String,
      default: '',
      trim: true,
      maxLength: 250,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

export default mongoose.models.SiteSettings || mongoose.model('SiteSettings', siteSettingsSchema);
