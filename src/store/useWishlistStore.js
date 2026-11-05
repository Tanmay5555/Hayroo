import { create } from 'zustand';
import apiClient from '../api/axios';
import toast from 'react-hot-toast';

export const useWishlistStore = create((set, get) => ({
  wishlistItems: [], // array of products
  isWishlistDrawerOpen: false,

  setWishlistDrawerOpen: (isOpen) => set({ isWishlistDrawerOpen: isOpen }),

  fetchWishlist: async () => {
    try {
      const res = await apiClient.get('/wishlist');
      set({ wishlistItems: res.data.data || [] });
    } catch {
      // ignore unauthenticated
    }
  },

  toggleWishlist: async (product) => {
    const productId = product._id || product.id;
    const current = get().wishlistItems;
    const exists = current.some((p) => (p._id || p.id) === productId);

    let updated;
    if (exists) {
      updated = current.filter((p) => (p._id || p.id) !== productId);
      toast.success(`Removed "${product.title}" from wishlist`);
    } else {
      updated = [...current, product];
      toast.success(`❤️ Saved "${product.title}" to wishlist!`);
    }

    set({ wishlistItems: updated });

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
