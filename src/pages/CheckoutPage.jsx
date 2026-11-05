import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Truck,
  CreditCard,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  Printer,
  ShoppingBag,
  Clock,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import ConfirmationModal from '../components/ConfirmationModal';
import apiClient from '../api/axios';
import { useSeo } from '../hooks/useSeo';
import { getUtmParameters, clearUtmParameters } from '../utils/utmTracker';
import { trackBeginCheckout, trackPurchase } from '../utils/analytics';

const addressSchema = z.object({
  fullName: z.string().min(2, 'Full name is required (minimum 2 letters)'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Enter a valid 10-digit mobile number'),
  street: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^[0-9]{6}$/, 'Enter a valid 6-digit postal pincode'),
});

export default function CheckoutPage() {
  const navigate = useNavigate();

  useSeo({
    title: 'Secure Checkout',
    description: 'Complete your Hayroo order with fast delivery, secure payment, and 1-year product warranty.',
    canonicalPath: '/checkout',
  });

  const { user, setAuthModal } = useAuthStore();
  const {
    cartItems,
    getSubtotal,
    getDiscountAmount,
    getShippingFee,
    getGrandTotal,
    clearCart,
  } = useCartStore();

  const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD' | 'Razorpay'
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [isConfirmOrderModalOpen, setIsConfirmOrderModalOpen] = useState(false);

  const subtotal = getSubtotal();
  const discount = getDiscountAmount();
  const shipping = getShippingFee();
  const grandTotal = getGrandTotal();

  // Track begin checkout event
  React.useEffect(() => {
    if (cartItems.length > 0) {
      trackBeginCheckout(cartItems, subtotal);
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: user?.name || '',
      phone: user?.phone || '9876543210',
      street: user?.addresses?.[0]?.street || '123 High Street, MG Road',
      city: user?.addresses?.[0]?.city || 'Bengaluru',
      state: user?.addresses?.[0]?.state || 'Karnataka',
      pincode: user?.addresses?.[0]?.pincode || '560001',
    },
  });

  // Triggered when form passes Zod validation
  const onFormSubmitValid = () => {
    if (!user) {
      setAuthModal(true, 'login');
      toast.error('Please sign in or create an account to place your order');
      return;
    }
    // Open Confirmation Modal before placing order
    setIsConfirmOrderModalOpen(true);
  };

  // Execution after user confirms in the modal
  const executeOrderPlacement = async () => {
    setIsConfirmOrderModalOpen(false);
    setIsProcessing(true);
    const shippingAddress = getValues();

    try {
      if (paymentMethod === 'Razorpay') {
        // Step 1: Create Razorpay Order
        const paymentRes = await apiClient.post('/payments/razorpay/create-order', {
          amount: grandTotal,
          receipt: `rcpt_${Date.now()}`,
        });

        const rzpData = paymentRes.data.data;

        // Step 2: Verify Razorpay Payment (Simulated verification)
        const verifyRes = await apiClient.post('/payments/razorpay/verify', {
          razorpayOrderId: rzpData.orderId,
          razorpayPaymentId: `pay_rzp_mock_${Date.now()}`,
          razorpaySignature: 'mock_valid_signature_2026',
        });

        if (verifyRes.data.data?.verified) {
          // Step 3: Record Order with UTM Attribution
          const utmData = getUtmParameters();
          const orderRes = await apiClient.post('/orders', {
            items: cartItems,
            shippingAddress,
            paymentMethod: 'Razorpay',
            discountAmount: discount,
            utmData,
          });

          setConfirmedOrder(orderRes.data.data);
          trackPurchase(orderRes.data.data);
          clearUtmParameters();
          clearCart();
          toast.success('Order booked and payment recorded successfully!');
        }
      } else {
        // Cash on Delivery
        const utmData = getUtmParameters();
        const orderRes = await apiClient.post('/orders', {
          items: cartItems,
          shippingAddress,
          paymentMethod: 'COD',
          discountAmount: discount,
          utmData,
        });

        setConfirmedOrder(orderRes.data.data);
        trackPurchase(orderRes.data.data);
        clearUtmParameters();
        clearCart();
        toast.success(`Order #${orderRes.data.data.orderId} booked successfully!`);
      }
    } catch {
      toast.error('Unable to place order. Please review your details and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Empty cart fallback
  if (cartItems.length === 0 && !confirmedOrder) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold font-heading text-[var(--color-text)]">
          No items in cart for checkout
        </h2>
        <p className="text-xs text-[var(--color-text-muted)]">
          Please add items to your shopping cart before proceeding to the checkout portal.
        </p>
        <Link to="/products" className="btn-primary btn-sm inline-block">
          Return to Catalog
        </Link>
      </div>
    );
  }

  // Order Confirmation State & Print Invoice View
  if (confirmedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 print:p-0 print:m-0">
        
        {/* Printable Order Confirmation Card */}
        <div className="card p-6 sm:p-8 bg-[var(--color-card)] border-[var(--color-border)] space-y-6 print:border-none print:shadow-none">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-md bg-[#047857] text-[#FFFBEB] flex items-center justify-center font-bold text-xl shrink-0 print:border">
                H
              </div>
              <div>
                <h1 className="text-xl font-bold font-heading text-[var(--color-text)]">
                  Hayroo Order Invoice
                </h1>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Order ID: <span className="font-mono font-bold text-[var(--color-text)]">#{confirmedOrder.orderId}</span>
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="btn-secondary btn-sm inline-flex items-center gap-1.5"
                title="Print Invoice / Summary"
              >
                <Printer className="w-4 h-4" /> Print Invoice
              </button>
            </div>
          </div>

          {/* Success Banner */}
          <div className="p-4 rounded-md bg-[#047857]/10 border border-[#047857]/30 flex items-center gap-3 print:bg-white print:border-gray-300">
            <CheckCircle2 className="w-6 h-6 text-[#047857] shrink-0" aria-hidden="true" />
            <div className="text-xs">
              <h2 className="font-bold text-[var(--color-text)] text-sm">
                Thank you! Your order is confirmed.
              </h2>
              <p className="text-[var(--color-text-muted)]">
                We have received your order. A dispatch confirmation will be sent via SMS and Email.
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid sm:grid-cols-2 gap-4 text-xs text-[var(--color-text-muted)]">
            <div className="card p-4 bg-[var(--color-bg-subtle)] space-y-1.5">
              <span className="font-bold uppercase tracking-wider text-[var(--color-text)] block">
                Shipping Address
              </span>
              <p className="font-semibold text-[var(--color-text)]">{confirmedOrder.shippingAddress?.fullName}</p>
              <p>{confirmedOrder.shippingAddress?.street}</p>
              <p>{confirmedOrder.shippingAddress?.city}, {confirmedOrder.shippingAddress?.state} - {confirmedOrder.shippingAddress?.pincode}</p>
              <p>Phone: {confirmedOrder.shippingAddress?.phone}</p>
            </div>

            <div className="card p-4 bg-[var(--color-bg-subtle)] space-y-1.5">
              <span className="font-bold uppercase tracking-wider text-[var(--color-text)] block">
                Payment & Fulfillment
              </span>
              <p>Payment Method: <strong className="text-[var(--color-text)]">{confirmedOrder.paymentMethod}</strong></p>
              <p>Payment Status: <strong className="text-[var(--color-primary)]">{confirmedOrder.paymentStatus}</strong></p>
              <p>Estimated Delivery: <strong className="text-[var(--color-text)]">{confirmedOrder.deliveryDate || 'Within 3 to 5 business days'}</strong></p>
              <p>Date: {new Date().toLocaleDateString('en-IN')}</p>
            </div>
          </div>

          {/* Items Summary Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)]">
              Items Ordered ({confirmedOrder.items?.length || 0})
            </h3>
            <div className="border border-[var(--color-border)] rounded-md divide-y divide-[var(--color-border)]">
              {(confirmedOrder.items || []).map((item, idx) => {
                const prod = item.product || item;
                return (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-[var(--color-text)]">{prod.title}</p>
                      <p className="text-[11px] text-[var(--color-text-subtle)]">Qty: {item.quantity || 1}</p>
                    </div>
                    <span className="font-semibold text-[var(--color-text)]">
                      ₹{((prod.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Multi-Vendor Sub-Orders Breakdown */}
          {confirmedOrder.subOrders && confirmedOrder.subOrders.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
                Multi-Vendor Sub-Orders ({confirmedOrder.subOrders.length})
              </h3>
              <div className="space-y-2">
                {confirmedOrder.subOrders.map((so, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[var(--color-bg-subtle)] rounded-lg border border-[var(--color-border)] text-xs flex justify-between items-center"
                  >
                    <div>
                      <p className="font-bold text-[var(--color-text)]">Sub-Order: #{so.subOrderNumber}</p>
                      <p className="text-[11px] text-slate-400">Seller: {so.sellerBusinessName}</p>
                      <span className="inline-block mt-0.5 text-[10px] font-semibold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">
                        Escrow: {so.escrowStatus || 'HELD'} (T+7 release)
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-500">₹{so.subtotal?.toLocaleString('en-IN')}</span>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        AWB: {so.shipment?.trackingNumber || 'Pending Label'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Totals Summary */}
          <div className="pt-2 border-t border-[var(--color-border)] space-y-1.5 text-xs text-[var(--color-text-muted)] text-right">
            <div>Subtotal: ₹{subtotal.toLocaleString('en-IN')}</div>
            {discount > 0 && <div className="text-[var(--color-primary)] font-semibold">Discount: -₹{discount.toLocaleString('en-IN')}</div>}
            <div>Shipping: {shipping === 0 ? 'FREE' : `₹${shipping}`}</div>
            <div className="text-base font-bold text-[var(--color-text)] pt-1">
              Grand Total: <span className="text-[var(--color-primary)]">₹{confirmedOrder.grandTotal ? confirmedOrder.grandTotal.toLocaleString('en-IN') : grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

        </div>

        {/* Action Controls (Hidden on Print) */}
        <div className="flex flex-wrap items-center justify-center gap-4 print:hidden">
          <Link to="/account" className="btn-primary btn-sm">
            Track My Order Status
          </Link>
          <Link to="/products" className="btn-secondary btn-sm">
            Continue Shopping
          </Link>
        </div>

      </div>
    );
  }

  // Active Checkout Form View
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title */}
      <div className="border-b border-[var(--color-border)] pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[var(--color-text)]">
          Secure Checkout
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-1 flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-[var(--color-primary)]" aria-hidden="true" />
          <span>256-bit SSL encrypted order processing</span>
        </p>
      </div>

      <form onSubmit={handleSubmit(onFormSubmitValid)} className="grid lg:grid-cols-12 gap-8 items-start" noValidate>
        
        {/* Left Column: Delivery Address & Payment Method */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Shipping Address Details */}
          <div className="card p-6 bg-[var(--color-card)] border-[var(--color-border)] space-y-4">
            <h2 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[var(--color-primary)]" aria-hidden="true" />
              1. Delivery Address
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="form-group sm:col-span-1">
                <label className="form-label form-label-required text-xs">Recipient Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  {...register('fullName')}
                  aria-invalid={errors.fullName ? 'true' : 'false'}
                  className="form-input text-xs"
                />
                {errors.fullName && <p className="form-error">{errors.fullName.message}</p>}
              </div>

              <div className="form-group sm:col-span-1">
                <label className="form-label form-label-required text-xs">10-Digit Mobile Number</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  {...register('phone')}
                  aria-invalid={errors.phone ? 'true' : 'false'}
                  className="form-input text-xs"
                />
                {errors.phone && <p className="form-error">{errors.phone.message}</p>}
              </div>

              <div className="form-group sm:col-span-2">
                <label className="form-label form-label-required text-xs">Street Address / House No / Apartment</label>
                <input
                  type="text"
                  placeholder="Flat No, Building, Landmark, Street"
                  {...register('street')}
                  aria-invalid={errors.street ? 'true' : 'false'}
                  className="form-input text-xs"
                />
                {errors.street && <p className="form-error">{errors.street.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label form-label-required text-xs">City</label>
                <input
                  type="text"
                  placeholder="City"
                  {...register('city')}
                  aria-invalid={errors.city ? 'true' : 'false'}
                  className="form-input text-xs"
                />
                {errors.city && <p className="form-error">{errors.city.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label form-label-required text-xs">State</label>
                <input
                  type="text"
                  placeholder="State"
                  {...register('state')}
                  aria-invalid={errors.state ? 'true' : 'false'}
                  className="form-input text-xs"
                />
                {errors.state && <p className="form-error">{errors.state.message}</p>}
              </div>

              <div className="form-group sm:col-span-2">
                <label className="form-label form-label-required text-xs">6-Digit Postal Pincode</label>
                <input
                  type="text"
                  placeholder="e.g. 560001"
                  {...register('pincode')}
                  aria-invalid={errors.pincode ? 'true' : 'false'}
                  className="form-input text-xs"
                />
                {errors.pincode && <p className="form-error">{errors.pincode.message}</p>}
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="card p-6 bg-[var(--color-card)] border-[var(--color-border)] space-y-4">
            <h2 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[var(--color-primary)]" aria-hidden="true" />
              2. Payment Method
            </h2>

            <div className="space-y-3">
              {/* Cash on Delivery */}
              <label
                className={`card p-4 flex items-center justify-between cursor-pointer border transition-colors ${
                  paymentMethod === 'COD'
                    ? 'border-[var(--color-primary)] bg-[var(--color-bg-subtle)]'
                    : 'border-[var(--color-border)] bg-[var(--color-card)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentOption"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="accent-[var(--color-primary)] w-4 h-4"
                  />
                  <div>
                    <span className="text-xs font-bold text-[var(--color-text)] block">
                      Cash on Delivery (COD)
                    </span>
                    <span className="text-[11px] text-[var(--color-text-muted)]">
                      Pay cash or UPI upon delivery at your doorstep
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[var(--color-primary)] text-white">
                  Available
                </span>
              </label>

              {/* Online Payment (Razorpay / UPI / Cards) */}
              <label
                className={`card p-4 flex items-center justify-between cursor-pointer border transition-colors ${
                  paymentMethod === 'Razorpay'
                    ? 'border-[var(--color-primary)] bg-[var(--color-bg-subtle)]'
                    : 'border-[var(--color-border)] bg-[var(--color-card)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentOption"
                    value="Razorpay"
                    checked={paymentMethod === 'Razorpay'}
                    onChange={() => setPaymentMethod('Razorpay')}
                    className="accent-[var(--color-primary)] w-4 h-4"
                  />
                  <div>
                    <span className="text-xs font-bold text-[var(--color-text)] block">
                      Razorpay Online Payment (UPI, Credit/Debit Cards, Net Banking)
                    </span>
                    <span className="text-[11px] text-[var(--color-text-muted)]">
                      Instant verification via secure Razorpay checkout gateway
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-[var(--color-primary)]">
                  <Lock className="w-3 h-3" /> Secure
                </div>
              </label>
            </div>
          </div>

        </div>

        {/* Right Column: Order Items Breakdown & Confirmation Trigger */}
        <div className="lg:col-span-4 card p-6 bg-[var(--color-bg-subtle)] border-[var(--color-border)] space-y-4">
          <h2 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wider pb-2 border-b border-[var(--color-border)]">
            Order Review ({cartItems.length} items)
          </h2>

          <div className="max-h-60 overflow-y-auto divide-y divide-[var(--color-border)] pr-1">
            {cartItems.map((item) => {
              const product = item.product || item;
              return (
                <div key={item._id} className="py-2.5 first:pt-0 flex items-center justify-between text-xs">
                  <div className="pr-2 min-w-0">
                    <p className="font-semibold text-[var(--color-text)] truncate">{product.title}</p>
                    <p className="text-[11px] text-[var(--color-text-subtle)]">Qty: {item.quantity || 1}</p>
                  </div>
                  <span className="font-bold text-[var(--color-text)] shrink-0">
                    ₹{((product.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[var(--color-border)] space-y-1.5 text-xs text-[var(--color-text-muted)]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-[var(--color-text)]">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-[var(--color-primary)] font-semibold">
                <span>Coupon Savings</span>
                <span>-₹{discount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery</span>
              <span>{shipping === 0 ? <strong className="text-[var(--color-primary)]">FREE</strong> : `₹${shipping}`}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-[var(--color-text)] pt-2 border-t border-[var(--color-border)]">
              <span>Total Payable</span>
              <span className="text-[var(--color-primary)]">₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="btn-primary w-full py-3 text-xs flex items-center justify-center gap-2"
          >
            {isProcessing ? 'Processing Order...' : 'Review & Place Order'}
          </button>
        </div>

      </form>

      {/* Place Order Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmOrderModalOpen}
        title="Confirm your order booking?"
        message={`You are about to place an order for ${cartItems.length} item(s) totaling ₹${grandTotal.toLocaleString('en-IN')} via ${paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}. Confirm to complete booking.`}
        confirmLabel={paymentMethod === 'COD' ? 'Confirm & Book Order' : 'Proceed to Payment'}
        cancelLabel="Review Address"
        isDanger={false}
        onConfirm={executeOrderPlacement}
        onCancel={() => setIsConfirmOrderModalOpen(false)}
      />
    </div>
  );
}
