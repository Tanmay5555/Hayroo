import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, Eye, Scale, ShoppingBag, Check, ImageOff } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useCompareStore } from '../store/useCompareStore';

/**
 * ProductCard Component
 * Complies with Hayroo design system:
 * - 6px rounded corners (4-8px rule, no pill shapes)
 * - Brand tokens: emerald green (#047857), cards (#FFFFFF / #162820), soft sage borders (#D1D5DB)
 * - No fake reviews: only renders real metrics or marked placeholder [add real data]
 * - Accessible keyboard focus and ARIA labels
 * - Supports grid and list views
 */
export default function ProductCard({ product, onQuickView, viewMode = 'grid' }) {
  const { addToCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { toggleCompare, isInCompare } = useCompareStore();

  const [imageError, setImageError] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const productId = product._id || product.id;
  const isLiked = isInWishlist(productId);
  const isCompared = isInCompare(productId);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  // Review & rating calculation: never display unbacked fake counts
  const hasValidReviews = typeof product.reviewsCount === 'number' && product.reviewsCount > 0;
  const ratingValue = product.rating ? Number(product.rating).toFixed(1) : null;

  // List View Rendering
  if (viewMode === 'list') {
    return (
      <article className="card p-4 flex flex-col sm:flex-row items-center gap-6 group hover:border-[var(--color-primary)] transition-all duration-200">
        {/* Product Thumbnail */}
        <div className="relative w-full sm:w-44 aspect-square bg-[var(--color-bg-subtle)] rounded-md flex items-center justify-center p-3 shrink-0 overflow-hidden">
          {!imageError && product.imageLight ? (
            <img
              src={product.imageLight}
              alt={product.title}
              onError={() => setImageError(true)}
              className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-xs text-[var(--color-text-subtle)] p-2 text-center">
              <ImageOff className="w-6 h-6 mb-1 text-[var(--color-text-subtle)]" aria-hidden="true" />
              <span>[Product photo placeholder]</span>
            </div>
          )}

          {product.discountTag && (
            <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-[var(--color-primary)] text-white shadow-sm">
              {product.discountTag}
            </span>
          )}
        </div>

        {/* Product Information */}
        <div className="flex-1 w-full space-y-2">
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
            <span className="font-semibold text-[var(--color-primary)] uppercase tracking-wider text-[11px]">
              {product.category || 'General'}
            </span>
            <span>•</span>
            <span>{product.brand || 'Hayroo Brand'}</span>
          </div>

          <Link
            to={`/product/${product.slug || productId}`}
            className="text-base font-bold text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors line-clamp-1"
          >
            {product.title}
          </Link>

          <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 leading-relaxed">
            {product.description || 'Verified authentic product with official manufacturer warranty and fast delivery.'}
          </p>

          {/* Ratings or placeholder */}
          <div className="flex items-center gap-2 text-xs">
            {hasValidReviews ? (
              <div className="flex items-center gap-1 text-amber-500 font-semibold">
                <Star className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                <span>{ratingValue}</span>
                <span className="text-[var(--color-text-subtle)] font-normal">({product.reviewsCount} reviews)</span>
              </div>
            ) : (
              <span className="text-[11px] text-[var(--color-text-subtle)] italic">
                [Reviews: add real data]
              </span>
            )}
          </div>
        </div>

        {/* Pricing and Action */}
        <div className="w-full sm:w-44 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-[var(--color-border)] shrink-0">
          <div className="text-left sm:text-right">
            <div className="text-xl font-bold text-[var(--color-text)]">
              ₹{(product.price || 0).toLocaleString('en-IN')}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-xs text-[var(--color-text-subtle)] line-through">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="btn-primary btn-sm w-full flex items-center justify-center gap-1.5"
            aria-label={`Add ${product.title} to cart`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4" aria-hidden="true" /> Added
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" aria-hidden="true" /> Add to Cart
              </>
            )}
          </button>
        </div>
      </article>
    );
  }

  // Default Grid View Rendering
  return (
    <article className="card p-4 flex flex-col justify-between group hover:border-[var(--color-primary)] transition-all duration-200 relative">
      
      {/* Top Meta Badges & Wishlist Action */}
      <div className="flex items-center justify-between z-10 mb-2">
        {product.discountTag ? (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[var(--color-primary)] text-white shadow-sm">
            {product.discountTag}
          </span>
        ) : (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
            {product.category || 'Essential'}
          </span>
        )}

        <div className="flex items-center gap-1">
          {/* Quick View Button */}
          {onQuickView && (
            <button
              type="button"
              onClick={() => onQuickView(product)}
              className="p-1.5 rounded-md bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-border)] transition-colors"
              title="Quick preview"
              aria-label={`Quick preview for ${product.title}`}
            >
              <Eye className="w-4 h-4" aria-hidden="true" />
            </button>
          )}

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={() => toggleWishlist(product)}
            className={`p-1.5 rounded-md border transition-colors ${
              isLiked
                ? 'bg-[#DC2626] text-white border-[#DC2626]'
                : 'bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:text-[#DC2626]'
            }`}
            title={isLiked ? 'Remove from wishlist' : 'Save to wishlist'}
            aria-label={isLiked ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Product Image Thumbnail */}
      <Link
        to={`/product/${product.slug || productId}`}
        className="relative my-3 aspect-square flex items-center justify-center overflow-hidden rounded-md bg-[var(--color-bg-subtle)] p-4 focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]"
        aria-label={`View details for ${product.title}`}
      >
        {!imageError && product.imageLight ? (
            <img
              src={product.imageLight}
              alt={product.title}
              onError={() => setImageError(true)}
              className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />
        ) : (
          <div className="flex flex-col items-center justify-center text-xs text-[var(--color-text-subtle)] p-2 text-center">
            <ImageOff className="w-8 h-8 mb-1 text-[var(--color-text-subtle)]" aria-hidden="true" />
            <span className="text-[11px]">[Product photo placeholder]</span>
          </div>
        )}
      </Link>

      {/* Content Details */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-[var(--color-text-subtle)]">
          <span className="font-medium">{product.brand || 'Official Brand'}</span>
          {hasValidReviews ? (
            <div className="flex items-center gap-1 text-amber-500 font-semibold">
              <Star className="w-3 h-3 fill-current" aria-hidden="true" />
              <span>{ratingValue}</span>
              <span className="text-[var(--color-text-subtle)] font-normal">({product.reviewsCount})</span>
            </div>
          ) : (
            <span className="text-[10px] text-[var(--color-text-subtle)]">[add real data]</span>
          )}
        </div>

        <Link
          to={`/product/${product.slug || productId}`}
          className="text-sm font-bold text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors line-clamp-2 min-h-[40px] block"
        >
          {product.title}
        </Link>

        {/* Stock Status Indicator */}
        <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted)]">
          <span
            className={`w-2 h-2 rounded-sm ${
              product.stock > 0 ? 'bg-[#047857]' : 'bg-[#DC2626]'
            }`}
            aria-hidden="true"
          />
          <span>{product.stock > 0 ? `In Stock (${product.stock} units)` : 'Temporarily Out of Stock'}</span>
        </div>

        {/* Pricing & Add to Cart Footer */}
        <div className="pt-3 mt-2 border-t border-[var(--color-border)] flex items-center justify-between gap-2">
          <div>
            <div className="text-base font-bold text-[var(--color-text)]">
              ₹{(product.price || 0).toLocaleString('en-IN')}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-[11px] text-[var(--color-text-subtle)] line-through">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="btn-primary btn-sm flex items-center gap-1"
            aria-label={`Add ${product.title} to cart`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" aria-hidden="true" /> Added
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" /> Add
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
