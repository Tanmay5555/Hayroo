import { create } from 'zustand';
import toast from 'react-hot-toast';

export const useCompareStore = create((set, get) => ({
  compareItems: [], // max 4 products
  isCompareModalOpen: false,

  setCompareModalOpen: (isOpen) => set({ isCompareModalOpen: isOpen }),

  toggleCompare: (product) => {
    const productId = product._id || product.id;
    const current = get().compareItems;
    const exists = current.some((p) => (p._id || p.id) === productId);

    if (exists) {
      set({ compareItems: current.filter((p) => (p._id || p.id) !== productId) });
      toast.success(`Removed "${product.title}" from compare bar`);
    } else {
      if (current.length >= 4) {
        toast.error('You can compare up to 4 products at a time!');
        return;
      }
      set({ compareItems: [...current, product] });
      toast.success(`⚖️ Added "${product.title}" to compare!`);
    }
  },

  removeCompare: (productId) => {
    set((state) => ({
      compareItems: state.compareItems.filter((p) => (p._id || p.id) !== productId),
    }));
  },

  clearCompare: () => set({ compareItems: [] }),

  isInCompare: (productId) => {
    return get().compareItems.some((p) => (p._id || p.id) === productId);
  },
}));
