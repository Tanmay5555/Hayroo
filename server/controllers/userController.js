import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse, sendError } from '../utils/apiResponse.js';

// @desc    Update user profile details
// @route   PUT /api/v1/users/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) return sendError(res, 404, 'User not found');

  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (avatar) user.avatar = avatar;

  await user.save();
  return sendResponse(res, 200, 'Profile updated successfully', {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    avatar: user.avatar,
    role: user.role,
  });
});

// @desc    Add shipping address
// @route   POST /api/v1/users/addresses
export const addAddress = asyncHandler(async (req, res) => {
  const { street, city, state, pincode, country, isDefault } = req.body;

  if (!street || !city || !state || !pincode) {
    return sendError(res, 400, 'Street, city, state, and pincode are required');
  }

  const user = await User.findById(req.user.id);

  if (isDefault) {
    user.addresses.forEach(addr => (addr.isDefault = false));
  }

  user.addresses.push({
    street,
    city,
    state,
    pincode,
    country: country || 'India',
    isDefault: isDefault || user.addresses.length === 0,
  });

  await user.save();
  return sendResponse(res, 201, 'Address added successfully', user.addresses);
});

// @desc    Delete shipping address
// @route   DELETE /api/v1/users/addresses/:addressId
export const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.addressId);
  await user.save();
  return sendResponse(res, 200, 'Address deleted successfully', user.addresses);
});
