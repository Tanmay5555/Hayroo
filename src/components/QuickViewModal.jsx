import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Star, ShoppingBag, Heart, Check, ArrowRight, ImageOff } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';

/**
 * QuickViewModal Component
 * Accessible quick preview modal.
 * - Closes on Escape key or backdrop click
 * - 8px rounded corners (4-8px rule, no pills)
 * - Brand tokens: emerald green (#047857), warm cream, soft sage borders
 * - Real review check (no fake metrics)
 */
export default function QuickViewModal({ product, onClose }) {
  const navigate = useNavigate();
  const { addToCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!product) return null;

  const productId = product._id || product.id;
  const isLiked = isInWishlist(productId);
  const hasValidReviews = typeof product.reviewsCount === 'number' && product.reviewsCount > 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Quick view: ${product.title}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-3xl bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg shadow-xl text-[var(--color-text)] p-6 md:p-8 overflow-hidden z-10">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-md hover:bg-[var(--color-bg-subtle)] transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          
          {/* Product Image */}
          <div className="aspect-square bg-[var(--color-bg-subtle)] p-6 rounded-md border border-[var(--color-border)] flex items-center justify-center relative">
            {product.imageLight ? (
              <img
                src={product.imageLight}
                alt={product.title}
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-xs text-[var(--color-text-subtle)]">
                <ImageOff className="w-8 h-8 mb-2" />
                <span>[Product photo placeholder]</span>
              </div>
            )}
            {product.discountTag && (
              <span className="absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-md bg-[var(--color-primary)] text-white shadow">
                {product.discountTag}
              </span>
            )}
          </div>

          {/* Product Specifications */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold text-[var(--color-primary)] uppercase tracking-wider">
              {product.category} • {product.brand}
            </span>
            <h3 className="text-xl font-bold text-[var(--color-text)] font-heading leading-snug">
              {product.title}
            </h3>

            {/* Ratings or placeholder */}
            <div className="flex items-center gap-2 text-xs">
              {hasValidReviews ? (
                <div className="flex items-center gap-1 text-amber-500 font-semibold">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{Number(product.rating).toFixed(1)}</span>
                  <span className="text-[var(--color-text-subtle)] font-normal">({product.reviewsCount} reviews)</span>
                </div>
              ) : (
                <span className="text-[11px] text-[var(--color-text-subtle)] italic">[Reviews: add real data]</span>
              )}
              <span className="text-xs text-[var(--color-primary)] ml-auto font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Official Warranty
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-2xl font-bold text-[var(--color-text)]">
                ₹{(product.price || 0).toLocaleString('en-IN')}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-[var(--color-text-subtle)] line-through">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            <p className="text-xs text-[var(--color-text-muted)] line-clamp-3 leading-relaxed">
              {product.description || 'Authentic quality product tested for everyday dependability.'}
            </p>

            {/* Stock status */}
            <div className="text-xs text-[var(--color-text-muted)]">
              Status: <span className="font-semibold text-[var(--color-primary)]">{product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of Stock'}</span>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-[var(--color-border)] flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  addToCart(product, 1);
                  onClose();
                }}
                disabled={product.stock <= 0}
                className="flex-1 btn-primary py-2.5 text-xs flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" /> Add to Cart
              </button>

              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className={`p-2.5 rounded-md border transition-colors ${
                  isLiked
                    ? 'bg-[#DC2626] text-white border-[#DC2626]'
                    : 'bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:text-[#DC2626]'
                }`}
                aria-label={isLiked ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                navigate(`/product/${product.slug || productId}`);
              }}
              className="w-full text-center text-xs font-semibold text-[var(--color-primary)] hover:underline flex items-center justify-center gap-1 pt-1"
            >
              View Full Product Specifications <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
