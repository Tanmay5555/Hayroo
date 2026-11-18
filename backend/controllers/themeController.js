import SiteSettings from '../models/SiteSettings.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse, sendError } from '../utils/apiResponse.js';

const ALLOWED_THEMES = [
  'default',
  'diwali',
  'holi',
  'eid',
  'christmas',
  'independence',
  'monsoon',
];

// @desc    Get active site theme & festival settings (Public)
// @route   GET /api/v1/theme
export const getSiteTheme = asyncHandler(async (req, res) => {
  let settings = await SiteSettings.findOne({ key: 'global_theme_settings' });

  if (!settings) {
    settings = {
      activeTheme: 'default',
      isFestivalMode: false,
      festivalBannerText: '',
      updatedAt: new Date(),
    };
  }

  return sendResponse(res, 200, 'Site theme settings retrieved', {
    activeTheme: settings.activeTheme || 'default',
    isFestivalMode: Boolean(settings.isFestivalMode),
    festivalBannerText: settings.festivalBannerText || '',
    updatedAt: settings.updatedAt,
    allowedThemes: ALLOWED_THEMES,
  });
});

// @desc    Update active site theme & festival settings (Admin Only)
// @route   PATCH /api/v1/admin/theme
export const updateSiteTheme = asyncHandler(async (req, res) => {
  const { activeTheme, isFestivalMode, festivalBannerText } = req.body;

  if (activeTheme !== undefined && !ALLOWED_THEMES.includes(activeTheme)) {
    return sendError(
      res,
      400,
      `Invalid theme '${activeTheme}'. Allowed themes: ${ALLOWED_THEMES.join(', ')}`
    );
  }

  const updateFields = {
    updatedBy: req.user?._id,
  };

  if (activeTheme !== undefined) {
    updateFields.activeTheme = activeTheme;
  }

  if (typeof isFestivalMode === 'boolean') {
    updateFields.isFestivalMode = isFestivalMode;
  }

  if (festivalBannerText !== undefined) {
    updateFields.festivalBannerText = String(festivalBannerText).trim();
  }

  const settings = await SiteSettings.findOneAndUpdate(
    { key: 'global_theme_settings' },
    { $set: updateFields },
    { upsert: true, new: true, runValidators: true }
  );

  return sendResponse(res, 200, `Marketplace theme updated to '${settings.activeTheme}'`, {
    activeTheme: settings.activeTheme,
    isFestivalMode: settings.isFestivalMode,
    festivalBannerText: settings.festivalBannerText,
    updatedAt: settings.updatedAt,
  });
});
