import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse, sendError } from '../utils/apiResponse.js';

// @desc    Update user profile details
// @route   PUT /api/v1/users/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, fullName, phone, phoneNumber, avatar, avatarUrl } = req.body;

  const user = await User.findById(req.user._id || req.user.id);
  if (!user) return sendError(res, 404, 'User not found');

  const resolvedName = fullName || name;
  const resolvedPhone = phoneNumber !== undefined ? phoneNumber : phone;
  const resolvedAvatar = avatarUrl || avatar;

  if (resolvedName && String(resolvedName).trim()) {
    user.fullName = String(resolvedName).trim();
  }
  if (resolvedPhone !== undefined && String(resolvedPhone).trim()) {
    user.phoneNumber = String(resolvedPhone).trim();
  }
  if (resolvedAvatar) {
    user.avatarUrl = String(resolvedAvatar).trim();
  }

  await user.save();
  return sendResponse(res, 200, 'Profile updated successfully', {
    id: user._id,
    fullName: user.fullName,
    name: user.fullName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    phone: user.phoneNumber,
    avatarUrl: user.avatarUrl,
    role: user.role,
    addresses: user.addresses,
  });
});

// @desc    Add shipping address
// @route   POST /api/v1/users/addresses
export const addAddress = asyncHandler(async (req, res) => {
  const {
    fullName,
    phoneNumber,
    street,
    addressLine1,
    addressLine2,
    city,
    state,
    pincode,
    postalCode,
    country,
    isDefault,
  } = req.body;

  const resolvedLine1 = addressLine1 || street;
  const resolvedPostal = postalCode || pincode;

  if (!resolvedLine1 || !city || !state || !resolvedPostal) {
    return sendError(res, 400, 'Street address, city, state, and pincode are required');
  }

  const user = await User.findById(req.user._id || req.user.id);
  if (!user) return sendError(res, 404, 'User not found');

  if (isDefault) {
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
  }

  user.addresses.push({
    fullName: fullName || user.fullName || '',
    phoneNumber: phoneNumber || user.phoneNumber || '',
    addressLine1: String(resolvedLine1).trim(),
    addressLine2: addressLine2 ? String(addressLine2).trim() : '',
    city: String(city).trim(),
    state: String(state).trim(),
    postalCode: String(resolvedPostal).trim(),
    country: country || 'India',
    isDefault: isDefault || user.addresses.length === 0,
  });

  await user.save();
  return sendResponse(res, 201, 'Address added successfully', user.addresses);
});

// @desc    Delete shipping address
// @route   DELETE /api/v1/users/addresses/:addressId
export const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id || req.user.id);
  if (!user) return sendError(res, 404, 'User not found');

  user.addresses = user.addresses.filter((addr) => addr._id.toString() !== req.params.addressId);
  await user.save();
  return sendResponse(res, 200, 'Address deleted successfully', user.addresses);
});
