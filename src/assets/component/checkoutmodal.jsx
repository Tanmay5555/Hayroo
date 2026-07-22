import { useState } from 'react';
import { X, CheckCircle2, MapPin, CreditCard, ShieldCheck, Truck, ArrowRight, ArrowLeft, PackageCheck } from 'lucide-react';

export default function CheckoutModal({ isOpen, onClose, cartItems = [], onOrderComplete }) {
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState({
    name: 'Varun Sharma',
    phone: '9876543210',
    street: '123 Tech Park Road, Sector 62',
    city: 'Ghaziabad',
    pincode: '201001',
  });
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [orderId, setOrderId] = useState('');

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => {
    const numPrice = typeof item.price === 'number' 
      ? item.price 
      : (parseFloat(String(item.price).replace(/,/g, '')) || 0);
    return sum + numPrice * (item.quantity || 1);
  }, 0);

  const grandTotal = Math.round(subtotal * 1.18);

  const handleNextStep = (e) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      const generatedId = `HYR-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderId(generatedId);
      setStep(3);
      if (onOrderComplete) onOrderComplete(generatedId);
    }
  };

  const deliveryDate = new Date(Date.now() + 3 * 86400000).toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-white">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Stepper Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-xs mx-auto text-xs font-bold text-gray-400">
            <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-orange-400' : ''}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${step >= 1 ? 'border-orange-400 bg-orange-500/10' : 'border-gray-600'}`}>1</div>
              <span>Address</span>
            </div>
            <div className="h-0.5 w-8 bg-slate-700" />
            <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-orange-400' : ''}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${step >= 2 ? 'border-orange-400 bg-orange-500/10' : 'border-gray-600'}`}>2</div>
              <span>Payment</span>
            </div>
            <div className="h-0.5 w-8 bg-slate-700" />
            <div className={`flex items-center gap-1.5 ${step === 3 ? 'text-emerald-400' : ''}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${step === 3 ? 'border-emerald-400 bg-emerald-500/10' : 'border-gray-600'}`}>3</div>
              <span>Complete</span>
            </div>
          </div>
        </div>

        {/* Step 1: Shipping Address */}
        {step === 1 && (
          <form onSubmit={handleNextStep} className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-orange-400" />
              <h3 className="text-lg font-bold text-white">Shipping Address</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={address.name}
                  onChange={(e) => setAddress({ ...address, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white outline-none focus:ring-1 focus:ring-orange-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  required
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white outline-none focus:ring-1 focus:ring-orange-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Street Address</label>
              <input
                type="text"
                required
                value={address.street}
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white outline-none focus:ring-1 focus:ring-orange-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">City / Location</label>
                <input
                  type="text"
                  required
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white outline-none focus:ring-1 focus:ring-orange-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Pincode</label>
                <input
                  type="text"
                  required
                  value={address.pincode}
                  onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white outline-none focus:ring-1 focus:ring-orange-400"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs transition-all shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <span>Continue to Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Payment Selection */}
        {step === 2 && (
          <form onSubmit={handleNextStep} className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-orange-400" />
                <h3 className="text-lg font-bold text-white">Select Payment Method</h3>
              </div>
              <span className="text-xs font-extrabold text-orange-400">Total: ₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>

            <div className="space-y-2.5">
              {[
                { id: 'upi', title: 'UPI / Google Pay / PhonePe', desc: 'Instant 0% transaction fee' },
                { id: 'card', title: 'Credit or Debit Card', desc: 'Visa, Mastercard, RuPay' },
                { id: 'netbanking', title: 'Net Banking', desc: 'All major Indian banks supported' },
                { id: 'cod', title: 'Cash on Delivery (COD)', desc: 'Pay when delivered to your doorstep' },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center justify-between p-3.5 border rounded-xl cursor-pointer transition-all ${
                    paymentMethod === opt.id
                      ? 'border-orange-400 bg-orange-500/10 text-white'
                      : 'border-slate-800 bg-slate-800/40 text-gray-300 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === opt.id}
                      onChange={() => setPaymentMethod(opt.id)}
                      className="accent-orange-400"
                    />
                    <div>
                      <p className="text-xs font-bold text-white">{opt.title}</p>
                      <p className="text-[11px] text-gray-400">{opt.desc}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-gray-400 hover:text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs transition-all shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Pay ₹{grandTotal.toLocaleString('en-IN')} & Confirm</span>
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Order Receipt */}
        {step === 3 && (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <PackageCheck className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-white">Order Confirmed!</h3>
              <p className="text-xs text-gray-400 mt-1">Thank you for your purchase from Hayroo.</p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-xl text-left space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-700 pb-2">
                <span className="text-gray-400">Order ID:</span>
                <span className="font-extrabold text-orange-400">#{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Estimated Delivery:</span>
                <span className="font-bold text-emerald-400">🚚 {deliveryDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Delivery Address:</span>
                <span className="font-medium text-gray-200">{address.city}, {address.pincode}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold py-3 rounded-xl text-xs transition-all shadow-lg cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
