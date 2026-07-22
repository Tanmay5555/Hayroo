import { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, ShieldCheck } from 'lucide-react';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems = [],
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
}) {
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  if (!isOpen) return null;

  // Calculate Subtotal safely
  const subtotal = cartItems.reduce((sum, item) => {
    const numericPrice = typeof item.price === 'number' 
      ? item.price 
      : (parseFloat(String(item.price).replace(/,/g, '')) || 0);
    return sum + numericPrice * (item.quantity || 1);
  }, 0);

  const freeShippingThreshold = 2000;
  const freeShippingNeeded = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 149;
  const discountAmount = (subtotal * discountPercent) / 100;
  const tax = Math.round((subtotal - discountAmount) * 0.18);
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee + tax);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');
    if (promoCode.trim().toUpperCase() === 'HAYROO10') {
      setDiscountPercent(10);
      setPromoSuccess('Promo code HAYROO10 applied! (10% OFF)');
    } else {
      setDiscountPercent(0);
      setPromoError('Invalid code. Try "HAYROO10"');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 text-white flex flex-col shadow-2xl">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white leading-none">Your Cart</h2>
                <p className="text-xs text-gray-400 mt-1">{cartItems.length} unique items</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          {subtotal > 0 && (
            <div className="bg-slate-800/80 px-6 py-3 border-b border-slate-800">
              <div className="flex justify-between items-center text-xs font-semibold mb-1">
                {freeShippingNeeded === 0 ? (
                  <span className="text-emerald-400 font-bold">🎉 You qualify for FREE Delivery!</span>
                ) : (
                  <span className="text-gray-300">
                    Add <strong className="text-orange-400">₹{freeShippingNeeded.toLocaleString('en-IN')}</strong> more for Free Shipping
                  </span>
                )}
                <span className="text-gray-400">{Math.round(progressPercent)}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-linear-to-r from-orange-500 to-emerald-400 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartItems.length > 0 ? (
              cartItems.map((item) => {
                const itemPrice = typeof item.price === 'number' 
                  ? item.price 
                  : (parseFloat(String(item.price).replace(/,/g, '')) || 0);

                return (
                  <div key={item.id} className="flex gap-4 p-3 bg-slate-800/50 border border-slate-800 rounded-xl items-center">
                    <img
                      src={item.imageLight || item.images?.[0] || item.imageDark}
                      alt={item.title}
                      className="w-16 h-16 object-contain bg-slate-900 p-2 rounded-lg shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                      <p className="text-xs text-orange-400 font-extrabold mt-1">₹{itemPrice.toLocaleString('en-IN')}</p>
                      
                      {/* Quantity Adjuster */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => onUpdateQuantity(item.id, (item.quantity || 1) - 1)}
                          className="p-1 bg-slate-700 hover:bg-slate-600 rounded text-gray-200 transition-colors cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold w-5 text-center">{item.quantity || 1}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, (item.quantity || 1) + 1)}
                          className="p-1 bg-slate-700 hover:bg-slate-600 rounded text-gray-200 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="text-gray-400 hover:text-red-400 p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-12">
                <ShoppingBag className="w-16 h-16 text-slate-700" />
                <h3 className="text-base font-bold text-gray-300">Your cart is empty</h3>
                <p className="text-xs text-gray-500 max-w-xs">Explore products and add items to your cart to see them here.</p>
              </div>
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-slate-800 bg-slate-900/90 space-y-4">
              {/* Promo Input */}
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Promo code (e.g. HAYROO10)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white uppercase focus:ring-1 focus:ring-orange-400 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-slate-800 hover:bg-slate-700 text-orange-400 font-bold px-3 py-2 rounded-lg text-xs border border-slate-700 transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </form>

              {promoSuccess && <p className="text-[11px] text-emerald-400 font-semibold">{promoSuccess}</p>}
              {promoError && <p className="text-[11px] text-red-400 font-semibold">{promoError}</p>}

              {/* Price Calculations */}
              <div className="space-y-1.5 text-xs text-gray-300 border-t border-slate-800 pt-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-white">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount ({discountPercent}%)</span>
                    <span className="font-semibold">-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Delivery</span>
                  <span className="font-semibold text-white">
                    {shippingFee === 0 ? <strong className="text-emerald-400">FREE</strong> : `₹${shippingFee}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18%)</span>
                  <span className="font-semibold text-white">₹{tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-white border-t border-slate-800 pt-2 mt-2">
                  <span>Grand Total</span>
                  <span className="text-orange-400 text-lg">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={onClearCart}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-white font-semibold py-3 rounded-xl text-xs transition-colors cursor-pointer border border-slate-700"
                >
                  Clear Cart
                </button>
                <button
                  onClick={onCheckout}
                  className="flex-2 bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold py-3 rounded-xl text-xs transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] text-gray-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Encrypted 256-bit Secure Checkout</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
