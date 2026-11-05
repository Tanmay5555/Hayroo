import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Star,
  ShoppingBag,
  Heart,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  MessageSquare,
  Share2,
  ArrowLeft,
  Copy,
  Tag,
  CheckCircle2,
  ImageOff,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useAuthStore } from '../store/useAuthStore';
import apiClient from '../api/axios';
import { useSeo } from '../hooks/useSeo';
import { generateProductSchema } from '../utils/schemaGenerator';
import { trackViewItem, trackAddToCart } from '../utils/analytics';

const reviewSchema = z.object({
  rating: z.number().min(1, 'Rating must be at least 1 star').max(5),
  title: z.string().min(3, 'Review title must be at least 3 characters').max(100),
  comment: z.string().min(10, 'Review comment must be at least 10 characters'),
});

export default function ProductDetailPage() {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();
  const { user, setAuthModal } = useAuthStore();
  const { addToCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const [product, setProduct] = useState(null);

  useSeo({
    title: product ? product.title : 'Product Details',
    description: product ? product.description : 'Explore quality electronics and home essentials at Hayroo.',
    canonicalPath: `/product/${idOrSlug}`,
    ogType: 'product',
    image: product ? (product.imageLight || product.images?.[0]) : undefined,
    jsonLd: product ? generateProductSchema(product) : null,
  });
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [ratingInput, setRatingInput] = useState(5);
  const [couponCopied, setCouponCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const productId = product ? product._id || product.id : null;
  const isLiked = productId ? isInWishlist(productId) : false;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 5, title: '', comment: '' },
  });

  useEffect(() => {
    let isMounted = true;
    const fetchProductDetails = async () => {
      setIsLoading(true);
      try {
        const res = await apiClient.get(`/products/${idOrSlug}`);
        const prod = res.data.data;
        if (!isMounted) return;

        setProduct(prod);
        setSelectedImage(prod.imageLight);
        trackViewItem(prod);

        // Pre-select first variant if present
        if (Array.isArray(prod.colors) && prod.colors.length > 0) {
          setSelectedColor(prod.colors[0]);
        }
        if (Array.isArray(prod.sizes) && prod.sizes.length > 0) {
          setSelectedSize(prod.sizes[0]);
        }

        // Fetch genuine reviews and category relations
        const [reviewsRes, relatedRes] = await Promise.all([
          apiClient.get(`/products/${prod._id}/reviews`).catch(() => ({ data: { data: [] } })),
          apiClient.get(`/products?category=${encodeURIComponent(prod.category)}&limit=4`).catch(() => ({ data: { data: [] } })),
        ]);

        if (isMounted) {
          setReviews(reviewsRes.data.data || []);
          setRelatedProducts(
            (relatedRes.data.data || []).filter((p) => (p._id || p.id) !== prod._id)
          );
        }
      } catch {
        // error handling
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchProductDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      isMounted = false;
    };
  }, [idOrSlug]);

  const handleReviewSubmit = async (data) => {
    if (!user) {
      setAuthModal(true, 'login');
      toast.error('Please sign in to submit a verified review');
      return;
    }

    try {
      const res = await apiClient.post(`/products/${product._id}/reviews`, data);
      toast.success('Thank you! Your review has been recorded.');
      setReviews([res.data.data, ...reviews]);
      reset();
    } catch {
      // error handled by interceptor
    }
  };

  const handleAddToCart = () => {
    if (!product || product.stock <= 0) return;
    addToCart(product, quantity, selectedColor, selectedSize);
    trackAddToCart(product, quantity);
    toast.success(`Added ${quantity} unit(s) of ${product.title} to your cart`);
  };

  const handleBuyNow = () => {
    if (!product || product.stock <= 0) return;
    addToCart(product, quantity, selectedColor, selectedSize);
    trackAddToCart(product, quantity);
    navigate('/checkout');
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    toast.success('Product link copied to clipboard!');
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleCopyCouponCode = (code = 'HAYROO10') => {
    navigator.clipboard.writeText(code);
    setCouponCopied(true);
    toast.success(`Coupon code ${code} copied! Paste it at checkout.`);
    setTimeout(() => setCouponCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8" aria-busy="true">
        <div className="h-6 w-24 bg-[var(--color-bg-subtle)] rounded animate-pulse" />
        <div className="grid lg:grid-cols-2 gap-10">
          <div className="aspect-square bg-[var(--color-bg-subtle)] rounded-md animate-pulse" />
          <div className="space-y-4">
            <div className="h-4 bg-[var(--color-bg-subtle)] rounded w-1/4" />
            <div className="h-8 bg-[var(--color-bg-subtle)] rounded w-3/4" />
            <div className="h-6 bg-[var(--color-bg-subtle)] rounded w-1/3" />
            <div className="h-20 bg-[var(--color-bg-subtle)] rounded w-full" />
            <div className="h-10 bg-[var(--color-bg-subtle)] rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-[var(--color-text)]">Product not found</h2>
        <p className="text-xs text-[var(--color-text-muted)]">
          The item you are searching for is unavailable or has been archived from our catalog.
        </p>
        <Link to="/products" className="btn-primary btn-sm inline-block">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const hasValidReviews = typeof product.reviewsCount === 'number' && product.reviewsCount > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Breadcrumb Back Button */}
      <nav aria-label="Breadcrumb">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to products</span>
        </button>
      </nav>

      {/* Main Grid: Gallery + Purchasing Details */}
      <div className="grid lg:grid-cols-2 gap-10 items-start">
        
        {/* Left Column: Image Gallery with Thumbnails */}
        <div className="space-y-4">
          <div className="aspect-square bg-[var(--color-card)] p-8 rounded-md border border-[var(--color-border)] flex items-center justify-center relative overflow-hidden group">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={product.title}
                className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-xs text-[var(--color-text-subtle)]">
                <ImageOff className="w-12 h-12 mb-2 text-[var(--color-text-subtle)]" aria-hidden="true" />
                <span>[Product photo placeholder]</span>
              </div>
            )}

            {product.discountTag && (
              <span className="absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded-md bg-[var(--color-primary)] text-white shadow-sm">
                {product.discountTag}
              </span>
            )}
          </div>

          {/* Thumbnail Strip */}
          {Array.isArray(product.images) && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto py-1" aria-label="Product thumbnails">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`w-18 h-18 rounded-md bg-[var(--color-card)] p-2 border transition-all shrink-0 ${
                    selectedImage === img
                      ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-ring)]'
                      : 'border-[var(--color-border)] hover:opacity-100 opacity-70'
                  }`}
                  aria-label={`View thumbnail ${i + 1}`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}

          {/* Coupon Code Copy Strip */}
          <div className="card p-3.5 bg-[var(--color-bg-subtle)] border-[var(--color-border)] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-[var(--color-primary)]" aria-hidden="true" />
              <div className="text-xs">
                <span className="font-bold text-[var(--color-text)]">Special Promo: </span>
                <span className="text-[var(--color-text-muted)]">Save 10% with code </span>
                <code className="font-bold text-[var(--color-primary)] bg-[var(--color-card)] px-1.5 py-0.5 rounded border border-[var(--color-border)]">
                  HAYROO10
                </code>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleCopyCouponCode('HAYROO10')}
              className="btn-secondary btn-sm flex items-center gap-1 shrink-0"
              aria-label="Copy coupon code HAYROO10"
            >
              {couponCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[var(--color-primary)]" aria-hidden="true" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Spec, Price & Add to Cart */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
                {product.category} • {product.brand}
              </span>

              {/* Share Link Copy Button */}
              <button
                type="button"
                onClick={handleCopyShareLink}
                className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-primary)] flex items-center gap-1 rounded-sm focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]"
                aria-label="Share product link"
              >
                {linkCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[var(--color-primary)]" aria-hidden="true" />
                    <span>Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Share</span>
                  </>
                )}
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[var(--color-text)] leading-tight">
              {product.title}
            </h1>

            {/* Ratings Summary (No fake ratings!) */}
            <div className="flex items-center gap-3 pt-1 text-xs">
              {hasValidReviews ? (
                <div className="flex items-center gap-1 text-amber-500 font-semibold">
                  <Star className="w-4 h-4 fill-current" aria-hidden="true" />
                  <span>{Number(product.rating).toFixed(1)}</span>
                  <span className="text-[var(--color-text-subtle)] font-normal">({product.reviewsCount} customer reviews)</span>
                </div>
              ) : (
                <span className="text-[11px] text-[var(--color-text-subtle)] italic">[Reviews: add real data]</span>
              )}

              {/* Stock Status Badge (6px radius) */}
              <span
                className={`ml-auto text-xs font-semibold px-2.5 py-0.5 rounded-md ${
                  product.stock > 0
                    ? 'bg-[#047857]/10 text-[#047857] border border-[#047857]/20 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-950/60 dark:text-red-300'
                }`}
              >
                {product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of Stock'}
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-md card bg-[var(--color-bg-subtle)] border-[var(--color-border)] flex items-baseline gap-4">
            <span className="text-3xl font-bold font-heading text-[var(--color-text)]">
              ₹{(product.price || 0).toLocaleString('en-IN')}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span className="text-base text-[var(--color-text-subtle)] line-through">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-bold text-[var(--color-primary)] bg-[var(--color-card)] px-2 py-0.5 rounded-md border border-[var(--color-border)]">
                  Save ₹{(product.originalPrice - product.price).toLocaleString('en-IN')}
                </span>
              </>
            )}
          </div>

          <p className="text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed">
            {product.description}
          </p>

          {/* Variant Selector: Color */}
          {Array.isArray(product.colors) && product.colors.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider">
                Select Color: <span className="text-[var(--color-primary)] font-semibold">{selectedColor}</span>
              </span>
              <div className="flex gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all ${
                      selectedColor === color
                        ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                        : 'bg-[var(--color-card)] text-[var(--color-text)] border-[var(--color-border)] hover:bg-[var(--color-bg-subtle)]'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Variant Selector: Size / Configuration */}
          {Array.isArray(product.sizes) && product.sizes.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider">
                Configuration / Size: <span className="text-[var(--color-primary)] font-semibold">{selectedSize}</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all ${
                      selectedSize === size
                        ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                        : 'bg-[var(--color-card)] text-[var(--color-text)] border-[var(--color-border)] hover:bg-[var(--color-bg-subtle)]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center gap-4 pt-3 border-t border-[var(--color-border)]">
            <span className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider">Quantity:</span>
            <div className="flex items-center bg-[var(--color-card)] border border-[var(--color-border)] rounded-md">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                aria-label="Decrease quantity"
                className="w-8 h-8 font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text)] flex items-center justify-center"
              >
                -
              </button>
              <span className="w-8 text-center text-xs font-bold text-[var(--color-text)]">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                aria-label="Increase quantity"
                className="w-8 h-8 font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text)] flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons (Strictly 6px rounded, NO pill shapes) */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="btn-primary w-full sm:flex-1 py-3 text-xs flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" aria-hidden="true" /> Add to Cart
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
              className="btn-secondary w-full sm:flex-1 py-3 text-xs flex items-center justify-center gap-2"
            >
              Buy Now
            </button>

            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              className={`p-3 rounded-md border transition-all shrink-0 ${
                isLiked
                  ? 'bg-[#DC2626] text-white border-[#DC2626]'
                  : 'bg-[var(--color-card)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:text-[#DC2626]'
              }`}
              title={isLiked ? 'Remove from wishlist' : 'Save to wishlist'}
              aria-label={isLiked ? 'Remove from wishlist' : 'Save to wishlist'}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} aria-hidden="true" />
            </button>
          </div>

          {/* Trust Value Props */}
          <div className="grid grid-cols-3 gap-2 pt-4 text-center text-xs text-[var(--color-text-muted)] border-t border-[var(--color-border)]">
            <div className="p-2.5 rounded-md card bg-[var(--color-bg-subtle)]">
              <Truck className="w-4 h-4 mx-auto text-[var(--color-primary)] mb-1" aria-hidden="true" />
              <span className="font-semibold block">Free Shipping</span>
              <span className="text-[10px] text-[var(--color-text-subtle)]">Over ₹1,500</span>
            </div>
            <div className="p-2.5 rounded-md card bg-[var(--color-bg-subtle)]">
              <RotateCcw className="w-4 h-4 mx-auto text-[var(--color-primary)] mb-1" aria-hidden="true" />
              <span className="font-semibold block">30-Day Returns</span>
              <span className="text-[10px] text-[var(--color-text-subtle)]">Easy exchanges</span>
            </div>
            <div className="p-2.5 rounded-md card bg-[var(--color-bg-subtle)]">
              <ShieldCheck className="w-4 h-4 mx-auto text-[var(--color-primary)] mb-1" aria-hidden="true" />
              <span className="font-semibold block">1-Year Warranty</span>
              <span className="text-[10px] text-[var(--color-text-subtle)]">Official coverage</span>
            </div>
          </div>
        </div>
      </div>

      {/* Verified Reviews Section */}
      <section aria-labelledby="reviews-heading" className="pt-8 border-t border-[var(--color-border)] space-y-8">
        <div className="flex items-center justify-between">
          <h2 id="reviews-heading" className="text-xl font-bold font-heading text-[var(--color-text)]">
            Verified Customer Reviews
          </h2>
          <span className="text-xs text-[var(--color-text-muted)]">
            {reviews.length} total reviews
          </span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Write Review Form */}
          <div className="card p-6 bg-[var(--color-card)] border-[var(--color-border)] space-y-4">
            <h3 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[var(--color-primary)]" aria-hidden="true" />
              Write a Product Review
            </h3>

            <form onSubmit={handleSubmit(handleReviewSubmit)} className="space-y-4" noValidate>
              <div>
                <label className="form-label text-xs">Rating</label>
                <div className="flex gap-1.5 text-amber-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => {
                        setRatingInput(star);
                        setValue('rating', star);
                      }}
                      className="p-1 rounded hover:scale-110 transition-transform"
                      aria-label={`Set rating to ${star} stars`}
                    >
                      <Star
                        className={`w-5 h-5 ${star <= ratingInput ? 'fill-current' : 'text-slate-300 dark:text-slate-600'}`}
                        aria-hidden="true"
                      />
                    </button>
                  ))}
                </div>
                {errors.rating && <p className="form-error">{errors.rating.message}</p>}
              </div>

              <div>
                <label className="form-label text-xs">Headline</label>
                <input
                  type="text"
                  placeholder="Summarize your experience"
                  {...register('title')}
                  className="form-input text-xs"
                />
                {errors.title && <p className="form-error">{errors.title.message}</p>}
              </div>

              <div>
                <label className="form-label text-xs">Review Details</label>
                <textarea
                  rows={4}
                  placeholder="Share details about build quality, performance, and everyday use"
                  {...register('comment')}
                  className="form-textarea text-xs"
                />
                {errors.comment && <p className="form-error">{errors.comment.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full py-2.5 text-xs text-center"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2 space-y-4">
            {reviews.length === 0 ? (
              <div className="card p-8 text-center text-xs text-[var(--color-text-muted)] space-y-1">
                <p className="font-semibold text-[var(--color-text)]">No reviews yet for this product</p>
                <p>Be the first customer to share feedback after testing this item.</p>
              </div>
            ) : (
              reviews.map((rev) => (
                <div key={rev._id || rev.id} className="card p-4 space-y-2 border-[var(--color-border)]">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="flex text-amber-500">
                        {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                        ))}
                      </div>
                      <span className="font-bold text-[var(--color-text)]">{rev.title}</span>
                    </div>
                    <span className="text-[11px] text-[var(--color-text-subtle)]">
                      {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('en-IN') : 'Verified Buyer'}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">{rev.comment}</p>
                  <p className="text-[11px] font-semibold text-[var(--color-primary)]">
                    {rev.userName || 'Verified Customer'}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section aria-labelledby="related-products-heading" className="pt-8 border-t border-[var(--color-border)] space-y-6">
          <h2 id="related-products-heading" className="text-xl font-bold font-heading text-[var(--color-text)]">
            Related in {product.category}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.slice(0, 4).map((rel) => (
              <ProductCard key={rel._id || rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
