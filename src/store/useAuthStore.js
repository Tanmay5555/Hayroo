import { create } from 'zustand';
import apiClient from '../api/axios';
import toast from 'react-hot-toast';

export const useAuthStore = create((set, get) => ({
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
      set({ user: res.data.data.user || res.data.data, isLoading: false });
    } catch {
      set({ user: null, token: null, isLoading: false });
      localStorage.removeItem('apexbazaar_token');
      localStorage.removeItem('hayroo_token');
    }
  },

  requestPhoneOtp: async (phoneNumber) => {
    try {
      const res = await apiClient.post('/auth/phone/otp-request', { phoneNumber });
      toast.success(res.data.data.message || 'OTP sent via SMS!');
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
      set({ user, token: accessToken, isLoading: false, isAuthModalOpen: false });
      toast.success(`Welcome to ApexBazaar, ${user.fullName || 'Shopper'}!`);
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
      set({ user, token: finalToken, isLoading: false, isAuthModalOpen: false });
      toast.success(`Welcome back, ${user.fullName || user.name || 'Shopper'}!`);
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
      set({ user, token: finalToken, isLoading: false, isAuthModalOpen: false });
      toast.success(`Account created successfully! Welcome to ApexBazaar.`);
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
      set({ user, token: accessToken, isLoading: false, isAuthModalOpen: false });
      toast.success(`Welcome to ApexBazaar, ${user.fullName || 'Shopper'}!`);
      return true;
    } catch (err) {
      set({ isLoading: false });
      toast.error(err.response?.data?.message || 'Firebase authentication failed');
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
    toast.success('Logged out successfully');
  },
}));
