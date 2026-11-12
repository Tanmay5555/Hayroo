import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, Eye, ShoppingBag, Check, ImageOff } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';

export default function ProductCard({ product, onQuickView, viewMode = 'grid' }) {
  const { addToCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const [imageError, setImageError] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const productId = product._id || product.id;
  const isLiked = isInWishlist(productId);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const hasValidReviews = typeof product.reviewsCount === 'number' && product.reviewsCount > 0;
  const ratingValue = product.rating ? Number(product.rating).toFixed(1) : null;

  if (viewMode === 'list') {
    return (
      <article className="card p-4 flex flex-col sm:flex-row items-center gap-5 group hover:border-[var(--color-text-subtle)] transition-colors duration-150">
        <Link
          to={`/product/${product.slug || productId}`}
          className="relative w-full sm:w-40 aspect-square bg-[var(--color-bg-subtle)] border border-[var(--color-border-subtle)] rounded-md flex items-center justify-center p-3 shrink-0 overflow-hidden"
        >
          {!imageError && product.imageLight ? (
            <img
              src={product.imageLight}
              alt={product.title}
              onError={() => setImageError(true)}
              className="max-h-full max-w-full object-contain"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <ImageOff className="w-6 h-6 text-[var(--color-text-subtle)]" aria-hidden="true" />
          )}

          {product.discountTag && (
            <span className="absolute top-2 left-2 text-[10px] font-medium px-1.5 py-0.5 rounded bg-[var(--color-primary)] text-[var(--color-primary-text)]">
              {product.discountTag}
            </span>
          )}
        </Link>

        <div className="flex-1 w-full space-y-1.5">
          <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-subtle)]">
            <span className="font-medium text-[var(--color-text-muted)]">
              {product.category || 'General'}
            </span>
            <span aria-hidden="true">·</span>
            <span>{product.brand || 'Hayroo'}</span>
          </div>

          <Link
            to={`/product/${product.slug || productId}`}
            className="text-[15px] font-semibold text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors line-clamp-1 block"
          >
            {product.title}
          </Link>

          <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 leading-relaxed">
            {product.description || 'Verified authentic product with official manufacturer warranty.'}
          </p>

          {hasValidReviews && (
            <div className="flex items-center gap-1 text-xs pt-0.5">
              <Star className="w-3.5 h-3.5 text-[var(--color-warning)] fill-current" aria-hidden="true" />
              <span className="font-medium text-[var(--color-text)] tabular-nums">{ratingValue}</span>
              <span className="text-[var(--color-text-subtle)]">({product.reviewsCount})</span>
            </div>
          )}
        </div>

        <div className="w-full sm:w-44 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-[var(--color-border)] shrink-0">
          <div className="text-left sm:text-right tabular-nums">
            <div className="text-lg font-semibold text-[var(--color-text)]">
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
            className="btn-primary btn-sm w-full"
            aria-label={`Add ${product.title} to cart`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" aria-hidden="true" /> Added
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" /> Add to Cart
              </>
            )}
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="card p-3.5 flex flex-col justify-between group hover:border-[var(--color-text-subtle)] transition-colors duration-150 relative">
      
      {/* Product Image Thumbnail */}
      <div className="relative aspect-[4/3] bg-[var(--color-bg-subtle)] border border-[var(--color-border-subtle)] rounded-md flex items-center justify-center p-4 overflow-hidden mb-3">
        <Link
          to={`/product/${product.slug || productId}`}
          className="w-full h-full flex items-center justify-center focus-visible:outline-2 focus-visible:outline-[var(--color-border-focus)]"
          aria-label={`View details for ${product.title}`}
        >
          {!imageError && product.imageLight ? (
            <img
              src={product.imageLight}
              alt={product.title}
              onError={() => setImageError(true)}
              className="max-h-full max-w-full object-contain"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <ImageOff className="w-7 h-7 text-[var(--color-text-subtle)]" aria-hidden="true" />
          )}
        </Link>

        {product.discountTag && (
          <span className="absolute top-2.5 left-2.5 text-[10px] font-medium px-1.5 py-0.5 rounded bg-[var(--color-primary)] text-[var(--color-primary-text)]">
            {product.discountTag}
          </span>
        )}

        {/* Action Overlay Buttons */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
          {onQuickView && (
            <button
              type="button"
              onClick={() => onQuickView(product)}
              className="p-1.5 rounded bg-[var(--color-card)]/95 border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
              title="Quick preview"
              aria-label={`Quick preview for ${product.title}`}
            >
              <Eye className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}

          <button
            type="button"
            onClick={() => toggleWishlist(product)}
            className={`p-1.5 rounded border transition-colors ${
              isLiked
                ? 'bg-[var(--color-error-bg)] text-[var(--color-error)] border-[var(--color-error)]/40'
                : 'bg-[var(--color-card)]/95 text-[var(--color-text-muted)] border-[var(--color-border)] hover:text-[var(--color-error)]'
            }`}
            title={isLiked ? 'Remove from wishlist' : 'Save to wishlist'}
            aria-label={isLiked ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Content Details */}
      <div className="space-y-1.5 flex-1 flex flex-col">
        <div className="flex items-center justify-between text-[11px] text-[var(--color-text-subtle)]">
          <span className="font-medium truncate">{product.brand || product.category || 'Official'}</span>
          {hasValidReviews && (
            <div className="flex items-center gap-1 shrink-0">
              <Star className="w-3 h-3 text-[var(--color-warning)] fill-current" aria-hidden="true" />
              <span className="font-medium text-[var(--color-text-muted)] tabular-nums">{ratingValue}</span>
            </div>
          )}
        </div>

        <Link
          to={`/product/${product.slug || productId}`}
          className="text-[13px] font-semibold text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors line-clamp-2 leading-snug min-h-[36px]"
        >
          {product.title}
        </Link>

        {/* Stock indicator */}
        <div className="text-[11px] text-[var(--color-text-subtle)] pt-0.5">
          {product.stock > 0 ? (
            <span>{product.stock <= 5 ? `Only ${product.stock} left` : 'In stock'}</span>
          ) : (
            <span className="text-[var(--color-error)]">Out of stock</span>
          )}
        </div>

        {/* Pricing & Add to Cart Footer */}
        <div className="pt-3 mt-auto border-t border-[var(--color-border-subtle)] flex items-center justify-between gap-2">
          <div className="tabular-nums">
            <div className="text-[15px] font-semibold text-[var(--color-text)]">
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
            className="btn-secondary btn-sm hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            aria-label={`Add ${product.title} to cart`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5 text-[var(--color-primary)]" aria-hidden="true" /> Added
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
