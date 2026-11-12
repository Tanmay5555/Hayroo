import { create } from 'zustand';
import apiClient from '../api/axios';
import toast from 'react-hot-toast';

export const useWishlistStore = create((set, get) => ({
  wishlistItems: [],
  isWishlistDrawerOpen: false,

  setWishlistDrawerOpen: (isOpen) => set({ isWishlistDrawerOpen: isOpen }),

  fetchWishlist: async () => {
    const token = localStorage.getItem('apexbazaar_token') || localStorage.getItem('hayroo_token');
    if (!token) {
      set({ wishlistItems: [] });
      return;
    }
    try {
      const res = await apiClient.get('/wishlist', { silentError: true });
      set({ wishlistItems: res.data.data || [] });
    } catch {
      // ignore unauthenticated
    }
  },

  toggleWishlist: async (product) => {
    const productId = product._id || product.id;
    const current = get().wishlistItems;
    const exists = current.some((p) => (p._id || p.id) === productId);

    const updated = exists
      ? current.filter((p) => (p._id || p.id) !== productId)
      : [...current, product];

    set({ wishlistItems: updated });
    toast.success(
      exists
        ? `Removed "${product.title}" from wishlist.`
        : `Saved "${product.title}" to wishlist.`
    );

    const token = localStorage.getItem('apexbazaar_token') || localStorage.getItem('hayroo_token');
    if (!token) return;

    try {
      await apiClient.post('/wishlist/toggle', { productId });
    } catch {
      // keep optimistic
    }
  },

  isInWishlist: (productId) => {
    return get().wishlistItems.some((p) => (p._id || p.id) === productId);
  },
}));
