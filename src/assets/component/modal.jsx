import { useState } from 'react';
import { X, Mail, Lock, User, Send, CheckCircle, Package, ShieldCheck, HelpCircle } from 'lucide-react';

export default function Modal({ isOpen, onClose, modalType, cartCount, onResetCart }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 1800);
  };

  const renderContent = () => {
    if (isSubmitted) {
      return (
        <div className="text-center py-8 space-y-4">
          <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
          <h3 className="text-xl font-bold text-white">Action Completed Successfully!</h3>
          <p className="text-sm text-gray-300">Thank you for engaging with Hayroo.</p>
        </div>
      );
    }

    switch (modalType) {
      case 'signin':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-extrabold text-white">Welcome to Hayroo</h3>
              <p className="text-xs text-gray-400 mt-1">Sign in to your account to manage orders</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-orange-400 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-orange-400 outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold py-2.5 rounded-lg text-sm transition-all shadow-lg cursor-pointer"
              >
                Sign In
              </button>
            </form>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-extrabold text-white">Contact Support</h3>
              <p className="text-xs text-gray-400 mt-1">We'd love to hear from you. Send us a message!</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Your Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-orange-400 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Message</label>
                <textarea
                  required
                  rows={3}
                  placeholder="How can we help you today?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-orange-400 outline-none resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Send Message</span>
              </button>
            </form>
          </div>
        );

      case 'returns':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-orange-400">
              <Package className="w-6 h-6" />
              <h3 className="text-xl font-bold text-white">Returns & Refunds Policy</h3>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              At Hayroo, we offer a <strong>30-day hassle-free return policy</strong> for all electronics, gadgets, and apparel items. Products must be in original condition with tags and packaging intact.
            </p>
            <ul className="text-xs text-gray-400 space-y-2 list-disc pl-4">
              <li>Instant refund processing within 24 hours of item pickup.</li>
              <li>Free return shipping on defective or damaged goods.</li>
              <li>Easy pickup scheduled right from your address.</li>
            </ul>
          </div>
        );

      case 'shipping':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-blue-400">
              <Package className="w-6 h-6" />
              <h3 className="text-xl font-bold text-white">Shipping & Delivery</h3>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              We ship across India with express delivery available in major metro cities.
            </p>
            <div className="bg-slate-800 p-3 rounded-lg text-xs space-y-2 text-gray-300">
              <p>🚚 <strong>Standard Delivery:</strong> 2-4 Business Days (Free on orders over ₹499)</p>
              <p>⚡ <strong>Express Shipping:</strong> Same-day or Next-day delivery</p>
              <p>📍 <strong>Hub Pickup:</strong> Collect anytime from Hayroo Hubs</p>
            </div>
          </div>
        );

      case 'faqs':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <HelpCircle className="w-6 h-6" />
              <h3 className="text-xl font-bold text-white">Frequently Asked Questions</h3>
            </div>
            <div className="space-y-3 text-xs text-gray-300">
              <div className="bg-slate-800 p-3 rounded-lg">
                <p className="font-bold text-white">Q: How do I track my order?</p>
                <p className="text-gray-400 mt-1">A: Once dispatched, you will receive an SMS and email with live tracking links.</p>
              </div>
              <div className="bg-slate-800 p-3 rounded-lg">
                <p className="font-bold text-white">Q: What payment methods are accepted?</p>
                <p className="text-gray-400 mt-1">A: We accept Credit/Debit cards, UPI, Net Banking, and Cash on Delivery.</p>
              </div>
            </div>
          </div>
        );

      case 'privacy':
      case 'terms':
      case 'cookie':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-purple-400">
              <ShieldCheck className="w-6 h-6" />
              <h3 className="text-xl font-bold text-white">
                {modalType === 'privacy' ? 'Privacy Policy' : modalType === 'terms' ? 'Terms of Service' : 'Cookie Preferences'}
              </h3>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Hayroo is committed to keeping your data secure and transparent. We use end-to-end encryption for transactions and respect your privacy settings at all times.
            </p>
          </div>
        );

      case 'cart':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-extrabold text-white">Shopping Cart</h3>
              <p className="text-xs text-gray-400 mt-1">You currently have <strong>{cartCount}</strong> items in your cart.</p>
            </div>
            {cartCount > 0 ? (
              <div className="space-y-4">
                <div className="bg-slate-800 p-4 rounded-xl flex items-center justify-between text-sm">
                  <div>
                    <p className="font-bold text-white">Items Total ({cartCount} items)</p>
                    <p className="text-xs text-emerald-400">Eligible for Free Shipping</p>
                  </div>
                  <span className="font-extrabold text-lg text-orange-400">₹{(cartCount * 1249).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      if (onResetCart) onResetCart();
                      onClose();
                    }}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-gray-300 font-semibold py-2.5 rounded-lg text-xs transition-all cursor-pointer border border-slate-700"
                  >
                    Clear Cart
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold py-2.5 rounded-lg text-xs transition-all shadow-lg cursor-pointer"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400 text-sm">
                Your cart is empty. Start shopping!
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
        {renderContent()}
      </div>
    </div>
  );
}
