import { create } from 'zustand';
import apiClient from '../api/axios';
import toast from 'react-hot-toast';

export const useCartStore = create((set, get) => ({
  cartItems: [], // array of { _id, product: {...}, quantity, selectedColor, selectedSize, price }
  appliedCoupon: null,
  isCartDrawerOpen: false,
  isLoading: false,

  setCartDrawerOpen: (isOpen) => set({ isCartDrawerOpen: isOpen }),

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const res = await apiClient.get('/cart');
      const cartData = res.data.data;
      if (cartData && Array.isArray(cartData.items)) {
        set({
          cartItems: cartData.items.filter(item => item.product != null),
          appliedCoupon: cartData.coupon || null,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  addToCart: async (product, quantity = 1, selectedColor = '', selectedSize = '') => {
    const productId = product._id || product.id;
    toast.success(`🛒 Added "${product.title}" to cart!`);

    // Optimistic local update
    const currentItems = get().cartItems;
    const existingIndex = currentItems.findIndex(
      (item) => (item.product?._id || item.product?.id || item.product) === productId
    );

    let updated = [...currentItems];
    if (existingIndex > -1) {
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + quantity,
      };
    } else {
      updated.push({
        _id: `temp-${Date.now()}`,
        product,
        quantity,
        selectedColor,
        selectedSize,
        price: product.price,
      });
    }

    set({ cartItems: updated, isCartDrawerOpen: true });

    // Sync with backend API
    try {
      const res = await apiClient.post('/cart/add', {
        productId,
        quantity,
        selectedColor,
        selectedSize,
      });
      if (res.data.data?.items) {
        set({ cartItems: res.data.data.items.filter(i => i.product != null) });
      }
    } catch {
      // Keep optimistic update or retry
    }
  },

  updateQuantity: async (itemId, newQty) => {
    if (newQty <= 0) {
      return get().removeItem(itemId);
    }

    set((state) => ({
      cartItems: state.cartItems.map((item) =>
        item._id === itemId ? { ...item, quantity: newQty } : item
      ),
    }));

    try {
      const res = await apiClient.put(`/cart/items/${itemId}`, { quantity: newQty });
      if (res.data.data?.items) {
        set({ cartItems: res.data.data.items.filter(i => i.product != null) });
      }
    } catch {
      // ignore error
    }
  },

  removeItem: async (itemId) => {
    set((state) => ({
      cartItems: state.cartItems.filter((item) => item._id !== itemId),
    }));
    toast.success('Item removed from cart');

    try {
      const res = await apiClient.delete(`/cart/items/${itemId}`);
      if (res.data.data?.items) {
        set({ cartItems: res.data.data.items.filter(i => i.product != null) });
      }
    } catch {
      // ignore error
    }
  },

  clearCart: async () => {
    set({ cartItems: [], appliedCoupon: null });
    try {
      await apiClient.delete('/cart/clear');
    } catch {
      // ignore
    }
  },

  applyCoupon: async (code) => {
    const subtotal = get().getSubtotal();
    try {
      const res = await apiClient.post('/coupons/apply', { code, cartSubtotal: subtotal });
      set({ appliedCoupon: res.data.data });
      toast.success(`Coupon ${code.toUpperCase()} applied! Saved ₹${res.data.data.discountAmount}`);
      return true;
    } catch {
      return false;
    }
  },

  getSubtotal: () => {
    return get().cartItems.reduce((sum, item) => {
      const p = item.product || item;
      return sum + (p.price || 0) * (item.quantity || 1);
    }, 0);
  },

  getDiscountAmount: () => {
    const coupon = get().appliedCoupon;
    if (!coupon) return 0;
    return coupon.discountAmount || Math.round((get().getSubtotal() * coupon.discountPercent) / 100);
  },

  getShippingFee: () => {
    const subtotal = get().getSubtotal();
    return subtotal > 1500 || subtotal === 0 ? 0 : 99;
  },

  getGrandTotal: () => {
    const subtotal = get().getSubtotal();
    const discount = get().getDiscountAmount();
    const shipping = get().getShippingFee();
    return Math.max(0, subtotal - discount + shipping);
  },
}));
