import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, ShieldCheck, Check, AlertCircle } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import ConfirmationModal from './ConfirmationModal';
import toast from 'react-hot-toast';
import { trackRemoveFromCart } from '../utils/analytics';

export default function CartDrawer() {
  const navigate = useNavigate();
  const {
    cartItems,
    isCartDrawerOpen,
    setCartDrawerOpen,
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

  // Confirmation Modal States
  const [itemToRemove, setItemToRemove] = useState(null);
  const [isClearCartOpen, setIsClearCartOpen] = useState(false);

  if (!isCartDrawerOpen) return null;

  const subtotal = getSubtotal();
  const discount = getDiscountAmount();
  const shipping = getShippingFee();
  const grandTotal = getGrandTotal();
  const freeShippingThreshold = 1500;
  const progressToFreeShipping = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const amountNeeded = Math.max(0, freeShippingThreshold - subtotal);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplying(true);
    const success = await applyCoupon(couponInput.trim().toUpperCase());
    setIsApplying(false);
    if (success) {
      setCouponInput('');
    }
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
    toast.success('Your cart has been cleared');
  };

  const handleCheckoutClick = () => {
    setCartDrawerOpen(false);
    navigate('/checkout');
  };

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-heading"
        className="fixed inset-0 z-50 flex justify-end"
      >
        {/* Backdrop overlay */}
        <div
          onClick={() => setCartDrawerOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          aria-hidden="true"
        />

        {/* Drawer Container */}
        <div className="relative w-full max-w-md bg-[var(--color-card)] border-l border-[var(--color-border)] text-[var(--color-text)] flex flex-col h-full shadow-2xl z-10">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[var(--color-primary)]" aria-hidden="true" />
              <h2 id="cart-drawer-heading" className="text-base font-bold font-heading text-[var(--color-text)]">
                Your Shopping Cart
              </h2>
              <span className="text-xs bg-[var(--color-primary)] text-white px-2 py-0.5 rounded-md font-bold">
                {cartItems.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {cartItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsClearCartOpen(true)}
                  className="text-xs text-[var(--color-text-subtle)] hover:text-red-600 transition-colors"
                  title="Clear all cart items"
                >
                  Clear Cart
                </button>
              )}
              <button
                type="button"
                onClick={() => setCartDrawerOpen(false)}
                aria-label="Close cart drawer"
                className="p-1.5 text-[var(--color-text-subtle)] hover:text-[var(--color-text)] rounded-md hover:bg-[var(--color-card)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Free Shipping Progress Indicator */}
          {cartItems.length > 0 && (
            <div className="p-3 bg-[var(--color-card)] border-b border-[var(--color-border)] text-xs space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span>
                  {amountNeeded === 0
                    ? 'You have qualified for Free Express Delivery!'
                    : `Add ₹${amountNeeded.toLocaleString('en-IN')} more to unlock Free Delivery`}
                </span>
                <span className="text-[var(--color-primary)] font-bold">{progressToFreeShipping}%</span>
              </div>
              <div className="w-full h-1.5 bg-[var(--color-bg-subtle)] rounded-md overflow-hidden">
                <div
                  className="h-full bg-[var(--color-primary)] transition-all duration-300"
                  style={{ width: `${progressToFreeShipping}%` }}
                />
              </div>
            </div>
          )}

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 divide-y divide-[var(--color-border)]">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 text-[var(--color-text-muted)] space-y-3">
                <div className="w-14 h-14 rounded-md bg-[var(--color-bg-subtle)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-subtle)]">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--color-text)]">Your cart is empty</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-xs">
                    Browse our catalog of everyday electronics and home essentials.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCartDrawerOpen(false);
                    navigate('/products');
                  }}
                  className="btn-primary btn-sm"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              cartItems.map((item) => {
                const product = item.product || item;
                const itemId = item._id || item.id || product._id || product.id;
                return (
                  <div key={itemId} className="pt-3.5 first:pt-0 flex gap-3.5 items-start">
                    <img
                      src={product.imageLight || '/favicon.svg'}
                      alt=""
                      className="w-16 h-16 object-contain rounded-md bg-[var(--color-bg-subtle)] p-1.5 shrink-0 border border-[var(--color-border)]"
                    />

                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-xs font-bold text-[var(--color-text)] truncate">{product.title}</p>
                      
                      {(item.color || item.size) && (
                        <p className="text-[11px] text-[var(--color-text-subtle)]">
                          {item.color && `Color: ${item.color}`} {item.size && `• Size: ${item.size}`}
                        </p>
                      )}

                      <div className="text-xs font-bold text-[var(--color-primary)]">
                        ₹{(product.price || 0).toLocaleString('en-IN')}
                      </div>

                      {/* Quantity Controller */}
                      <div className="flex items-center gap-2 pt-1">
                        <div className="flex items-center border border-[var(--color-border)] rounded-md bg-[var(--color-card)]">
                          <button
                            type="button"
                            onClick={() => updateQuantity(itemId, Math.max(1, (item.quantity || 1) - 1))}
                            className="w-6 h-6 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] flex items-center justify-center"
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="w-6 text-center text-xs font-bold">{item.quantity || 1}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(itemId, (item.quantity || 1) + 1)}
                            className="w-6 h-6 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] flex items-center justify-center"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => setItemToRemove(item)}
                          className="p-1 text-[var(--color-text-subtle)] hover:text-red-600 transition-colors rounded"
                          title="Remove item"
                          aria-label={`Remove ${product.title} from cart`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer with Totals and Coupon */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-[var(--color-border)] bg-[var(--color-bg-subtle)] space-y-3">
              {/* Coupon Form */}
              {appliedCoupon ? (
                <div className="p-2.5 rounded-md bg-[var(--color-card)] border border-[var(--color-primary)]/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-[var(--color-primary)] font-bold">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Coupon {appliedCoupon.code} applied (-₹{discount.toLocaleString('en-IN')})</span>
                  </div>
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

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-[var(--color-text-muted)]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[var(--color-text)]">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[var(--color-primary)] font-semibold">
                    <span>Discount</span>
                    <span>-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>{shipping === 0 ? <strong className="text-[var(--color-primary)]">FREE</strong> : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[var(--color-text)] pt-2 border-t border-[var(--color-border)]">
                  <span>Estimated Total</span>
                  <span className="text-[var(--color-primary)]">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCheckoutClick}
                className="btn-primary w-full py-2.5 text-xs flex items-center justify-center gap-2"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Remove Item Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(itemToRemove)}
        title="Remove item from cart?"
        message={`Are you sure you want to remove "${itemToRemove?.product?.title || itemToRemove?.title || 'this item'}" from your cart?`}
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
    </>
  );
}
