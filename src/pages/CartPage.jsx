import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowRight, Tag, ShieldCheck, Check } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import ConfirmationModal from '../components/ConfirmationModal';
import toast from 'react-hot-toast';
import { useSeo } from '../hooks/useSeo';
import { trackRemoveFromCart } from '../utils/analytics';

export default function CartPage() {
  const navigate = useNavigate();

  useSeo({
    title: 'Your Shopping Cart',
    description: 'Review your selected everyday electronics and home essentials at Hayroo.',
    canonicalPath: '/cart',
  });

  const {
    cartItems,
    updateQuantity,
    removeItem,
    clearCart,
    applyCoupon,
    appliedCoupon,
    removeCoupon,
    getSubtotal,
    getDiscountAmount,
    getShippingFee,
    getGrandTotal,
  } = useCartStore();

  const [couponInput, setCouponInput] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  // Modals state
  const [itemToRemove, setItemToRemove] = useState(null);
  const [isClearCartOpen, setIsClearCartOpen] = useState(false);

  const subtotal = getSubtotal();
  const discount = getDiscountAmount();
  const shipping = getShippingFee();
  const grandTotal = getGrandTotal();

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplying(true);
    const success = await applyCoupon(couponInput.trim().toUpperCase());
    setIsApplying(false);
    if (success) setCouponInput('');
  };

  const confirmRemoveItem = () => {
    if (itemToRemove) {
      trackRemoveFromCart(itemToRemove);
      removeItem(itemToRemove._id || itemToRemove.id);
      setItemToRemove(null);
      toast.success('Item removed from cart');
    }
  };

  const confirmClearCart = () => {
    clearCart();
    setIsClearCartOpen(false);
    toast.success('Shopping cart cleared');
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-md bg-[var(--color-bg-subtle)] mx-auto flex items-center justify-center text-[var(--color-text-subtle)] border border-[var(--color-border)]">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold font-heading text-[var(--color-text)]">
          Your Shopping Cart is Empty
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] max-w-sm mx-auto">
          Explore dependable electronics, gadgets, and home essentials tailored for every age.
        </p>
        <Link
          to="/products"
          className="btn-primary btn-sm inline-block"
        >
          Browse Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[var(--color-text)]">
            Shopping Cart
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Review your selected products before proceeding to checkout
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsClearCartOpen(true)}
          className="btn-secondary btn-sm text-red-600 hover:text-red-700"
        >
          Clear Cart
        </button>
      </div>

      {/* Grid: Cart Items Table + Order Summary */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Items List */}
        <div className="lg:col-span-8 card divide-y divide-[var(--color-border)] overflow-hidden">
          {cartItems.map((item) => {
            const product = item.product || item;
            const itemId = item._id || item.id || product._id || product.id;
            return (
              <div key={itemId} className="p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4">
                <img
                  src={product.imageLight || '/favicon.svg'}
                  alt=""
                  className="w-20 h-20 object-contain rounded-md bg-[var(--color-bg-subtle)] p-2 shrink-0 border border-[var(--color-border)]"
                />

                <div className="flex-1 w-full space-y-1 text-left">
                  <span className="text-[11px] font-bold text-[var(--color-primary)] uppercase">
                    {product.category} • {product.brand}
                  </span>
                  <Link
                    to={`/product/${product.slug || product._id || product.id}`}
                    className="text-sm font-bold text-[var(--color-text)] hover:text-[var(--color-primary)] block line-clamp-1"
                  >
                    {product.title}
                  </Link>

                  {(item.color || item.size) && (
                    <p className="text-xs text-[var(--color-text-subtle)]">
                      {item.color && `Color: ${item.color}`} {item.size && `• Variant: ${item.size}`}
                    </p>
                  )}

                  <div className="text-sm font-bold text-[var(--color-text)] sm:hidden pt-1">
                    ₹{(product.price || 0).toLocaleString('en-IN')}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-[var(--color-border)] rounded-md bg-[var(--color-card)]">
                    <button
                      type="button"
                      onClick={() => updateQuantity(itemId, Math.max(1, (item.quantity || 1) - 1))}
                      aria-label="Decrease quantity"
                      className="w-7 h-7 text-xs font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text)] flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-[var(--color-text)]">
                      {item.quantity || 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(itemId, (item.quantity || 1) + 1)}
                      aria-label="Increase quantity"
                      className="w-7 h-7 text-xs font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text)] flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>

                  <div className="hidden sm:block text-right min-w-[90px]">
                    <div className="text-sm font-bold text-[var(--color-text)]">
                      ₹{((product.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setItemToRemove(item)}
                    className="p-1.5 text-[var(--color-text-subtle)] hover:text-red-600 transition-colors"
                    aria-label={`Remove ${product.title} from cart`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-4 card p-6 bg-[var(--color-bg-subtle)] space-y-4">
          <h2 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wider pb-2 border-b border-[var(--color-border)]">
            Order Summary
          </h2>

          {/* Coupon Field */}
          {appliedCoupon ? (
            <div className="p-2.5 rounded-md bg-[var(--color-card)] border border-[var(--color-primary)] flex items-center justify-between text-xs">
              <span className="font-bold text-[var(--color-primary)]">
                Code {appliedCoupon.code} applied (-₹{discount.toLocaleString('en-IN')})
              </span>
              <button
                type="button"
                onClick={removeCoupon}
                className="text-xs text-red-600 hover:underline font-semibold"
              >
                Remove
              </button>
            </div>
          ) : (
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="Coupon code (try HAYROO10)"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                className="form-input text-xs py-1.5 flex-1"
              />
              <button
                type="submit"
                disabled={isApplying || !couponInput.trim()}
                className="btn-secondary btn-sm shrink-0"
              >
                Apply
              </button>
            </form>
          )}

          {/* Breakdown */}
          <div className="space-y-2 text-xs text-[var(--color-text-muted)] pt-2 border-t border-[var(--color-border)]">
            <div className="flex justify-between">
              <span>Subtotal ({cartItems.length} items)</span>
              <span className="font-semibold text-[var(--color-text)]">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-[var(--color-primary)] font-semibold">
                <span>Promotional Discount</span>
                <span>-₹{discount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Estimated Delivery</span>
              <span>{shipping === 0 ? <strong className="text-[var(--color-primary)]">FREE</strong> : `₹${shipping}`}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-[var(--color-text)] pt-3 border-t border-[var(--color-border)]">
              <span>Grand Total</span>
              <span className="text-[var(--color-primary)]">₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/checkout')}
            className="btn-primary w-full py-3 text-xs flex items-center justify-center gap-2"
          >
            Proceed to Checkout <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

      </div>

      {/* Remove Item Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(itemToRemove)}
        title="Remove item from cart?"
        message={`Are you sure you want to remove "${itemToRemove?.product?.title || itemToRemove?.title || 'this item'}" from your shopping cart?`}
        confirmLabel="Remove"
        cancelLabel="Keep item"
        isDanger={true}
        onConfirm={confirmRemoveItem}
        onCancel={() => setItemToRemove(null)}
      />

      {/* Clear Cart Confirmation Modal */}
      <ConfirmationModal
        isOpen={isClearCartOpen}
        title="Clear entire cart?"
        message="Are you sure you want to remove all items from your shopping cart? This action cannot be undone."
        confirmLabel="Clear Cart"
        cancelLabel="Cancel"
        isDanger={true}
        onConfirm={confirmClearCart}
        onCancel={() => setIsClearCartOpen(false)}
      />
    </div>
  );
}
