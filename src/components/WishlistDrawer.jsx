import React from 'react';
import { X, Heart, Trash2, ShoppingBag } from 'lucide-react';
import { useWishlistStore } from '../store/useWishlistStore';
import { useCartStore } from '../store/useCartStore';
import toast from 'react-hot-toast';

export default function WishlistDrawer() {
  const { wishlistItems, isWishlistDrawerOpen, setWishlistDrawerOpen, toggleWishlist } = useWishlistStore();
  const { addToCart } = useCartStore();

  if (!isWishlistDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        onClick={() => setWishlistDrawerOpen(false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-label="Saved Wishlist"
        className="relative w-full max-w-md bg-[var(--color-card)] border-l border-[var(--color-border)] text-[var(--color-text)] flex flex-col h-full shadow-2xl z-10 animate-in slide-in-from-right duration-200"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#DC2626] fill-current" aria-hidden="true" />
            <h2 className="text-base font-bold font-heading text-[var(--color-text)]">
              Saved Wishlist
            </h2>
            <span className="text-xs bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-primary)] px-2 py-0.5 rounded-md font-bold">
              {wishlistItems.length}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setWishlistDrawerOpen(false)}
            className="p-1.5 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-border)] transition-colors"
            aria-label="Close wishlist"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Wishlist Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {wishlistItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 text-[var(--color-text-muted)]">
              <div className="w-16 h-16 rounded-md bg-[var(--color-bg-subtle)] border border-[var(--color-border)] flex items-center justify-center mb-4 text-[var(--color-text-subtle)]">
                <Heart className="w-8 h-8" aria-hidden="true" />
              </div>
              <p className="text-base font-bold text-[var(--color-text)]">Your wishlist is empty</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-xs leading-relaxed">
                Click the heart icon on any product in our store to save items for later.
              </p>
            </div>
          ) : (
            wishlistItems.map((product) => {
              const productId = product._id || product.id;
              const numPrice = typeof product.price === 'number'
                ? product.price
                : (parseFloat(String(product.price).replace(/,/g, '')) || 0);

              return (
                <div
                  key={productId}
                  className="flex gap-3 items-center p-3 rounded-md bg-[var(--color-bg)] border border-[var(--color-border)]"
                >
                  <div className="w-16 h-16 rounded-md bg-[var(--color-bg-subtle)] p-2 flex items-center justify-center shrink-0">
                    <img
                      src={product.imageLight || product.images?.[0]}
                      alt={product.title}
                      className="max-h-full max-w-full object-contain"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-[var(--color-text)] truncate">
                      {product.title}
                    </h4>
                    <p className="text-xs font-bold text-[var(--color-primary)] mt-1">
                      ₹{numPrice.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        addToCart(product, 1);
                        toggleWishlist(product);
                        toast.success('Moved item to cart');
                      }}
                      className="btn-primary btn-sm flex items-center gap-1 text-[11px] px-2 py-1"
                      title="Move to cart"
                    >
                      <ShoppingBag className="w-3 h-3" aria-hidden="true" />
                      <span>Move</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleWishlist(product)}
                      className="p-1 text-[var(--color-text-subtle)] hover:text-[#DC2626] rounded-md transition-colors flex items-center justify-center"
                      title="Remove from wishlist"
                      aria-label={`Remove ${product.title} from wishlist`}
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
