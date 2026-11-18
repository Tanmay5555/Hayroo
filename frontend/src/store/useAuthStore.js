import { create } from 'zustand';
import apiClient from '../api/axios';
import toast from 'react-hot-toast';

const normalizeUser = (u) => {
  if (!u) return null;
  const fullName = u.fullName || u.name || 'Shopper';
  const phoneNumber = u.phoneNumber || u.phone || '';
  return {
    ...u,
    fullName,
    name: fullName,
    phoneNumber,
    phone: phoneNumber,
  };
};

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('apexbazaar_token') || localStorage.getItem('hayroo_token') || null,
  isLoading: true,
  isAuthModalOpen: false,
  authModalTab: 'otp', // 'otp' | 'login' | 'register'

  setAuthModal: (isOpen, tab = 'otp') => set({ isAuthModalOpen: isOpen, authModalTab: tab }),

  fetchUser: async () => {
    set({ isLoading: true });
    try {
      const res = await apiClient.get('/auth/me');
      const rawUser = res.data.data.user || res.data.data;
      set({ user: normalizeUser(rawUser), isLoading: false });
    } catch {
      set({ user: null, token: null, isLoading: false });
      localStorage.removeItem('apexbazaar_token');
      localStorage.removeItem('hayroo_token');
    }
  },

  requestPhoneOtp: async (phoneNumber) => {
    try {
      const res = await apiClient.post('/auth/phone/otp-request', { phoneNumber });
      toast.success(res.data.data.message || 'Verification code sent via SMS.');
      return res.data.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request OTP');
      return null;
    }
  },

  verifyPhoneOtp: async (phoneNumber, otp) => {
    set({ isLoading: true });
    try {
      const res = await apiClient.post('/auth/phone/otp-verify', { phoneNumber, otp });
      const { user, accessToken } = res.data.data;
      localStorage.setItem('apexbazaar_token', accessToken);
      set({ user: normalizeUser(user), token: accessToken, isLoading: false, isAuthModalOpen: false });
      toast.success(`Welcome to Hayroo, ${user.fullName || 'Shopper'}.`);
      return true;
    } catch (err) {
      set({ isLoading: false });
      toast.error(err.response?.data?.message || 'Invalid or expired OTP');
      return false;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      const { user, accessToken, token } = res.data.data;
      const finalToken = accessToken || token;
      localStorage.setItem('apexbazaar_token', finalToken);
      set({ user: normalizeUser(user), token: finalToken, isLoading: false, isAuthModalOpen: false });
      toast.success(`Welcome back, ${user.fullName || user.name || 'Shopper'}.`);
      return true;
    } catch (err) {
      set({ isLoading: false });
      toast.error(err.response?.data?.message || 'Invalid email or password');
      return false;
    }
  },

  register: async (name, email, password, phone, role = 'CUSTOMER') => {
    set({ isLoading: true });
    try {
      const res = await apiClient.post('/auth/register', {
        fullName: name,
        email,
        password,
        phoneNumber: phone,
        role,
      });
      const { user, accessToken, token } = res.data.data;
      const finalToken = accessToken || token;
      localStorage.setItem('apexbazaar_token', finalToken);
      set({ user: normalizeUser(user), token: finalToken, isLoading: false, isAuthModalOpen: false });
      toast.success('Account created successfully. Welcome to Hayroo.');
      return true;
    } catch (err) {
      set({ isLoading: false });
      toast.error(err.response?.data?.message || 'Registration failed');
      return false;
    }
  },

  firebaseLogin: async (idToken, targetRole = 'CUSTOMER', profileDetails = {}) => {
    set({ isLoading: true });
    try {
      const res = await apiClient.post('/auth/firebase-login', {
        idToken,
        targetRole,
        ...profileDetails,
      });
      const { user, accessToken } = res.data.data;
      localStorage.setItem('apexbazaar_token', accessToken);
      set({ user: normalizeUser(user), token: accessToken, isLoading: false, isAuthModalOpen: false });
      toast.success(`Welcome to Hayroo, ${user.fullName || 'Shopper'}.`);
      return true;
    } catch (err) {
      set({ isLoading: false });
      toast.error(err.response?.data?.message || 'Firebase authentication failed');
      return false;
    }
  },

  updateProfile: async (profileData) => {
    try {
      const res = await apiClient.put('/users/profile', {
        fullName: profileData.fullName || profileData.name,
        phoneNumber: profileData.phoneNumber !== undefined ? profileData.phoneNumber : profileData.phone,
      });
      const updated = res.data?.data;
      set((state) => ({
        user: normalizeUser({
          ...(state.user || {}),
          ...updated,
        }),
      }));
      return true;
    } catch {
      return false;
    }
  },

  addAddress: async (addressData) => {
    try {
      const res = await apiClient.post('/users/addresses', {
        addressLine1: addressData.addressLine1 || addressData.street,
        city: addressData.city,
        state: addressData.state,
        postalCode: addressData.postalCode || addressData.pincode,
        country: addressData.country || 'India',
        isDefault: addressData.isDefault,
      });
      const addresses = res.data?.data || [];
      set((state) => ({
        user: state.user ? { ...state.user, addresses } : state.user,
      }));
      return true;
    } catch {
      return false;
    }
  },

  deleteAddress: async (addressId) => {
    try {
      const res = await apiClient.delete(`/users/addresses/${addressId}`);
      const addresses = res.data?.data || [];
      set((state) => ({
        user: state.user ? { ...state.user, addresses } : state.user,
      }));
      toast.success('Address removed');
      return true;
    } catch {
      toast.error('Failed to remove address');
      return false;
    }
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // ignore
    }
    localStorage.removeItem('apexbazaar_token');
    localStorage.removeItem('hayroo_token');
    set({ user: null, token: null });
    toast.success('Signed out successfully');
  },
}));
