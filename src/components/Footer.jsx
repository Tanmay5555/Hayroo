import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Truck,
  RotateCcw,
  ShieldCheck,
  Headphones,
  Mail,
  Send,
  Lock,
  Phone,
  MapPin,
  Clock,
  CreditCard,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    toast.success('Thank you for subscribing to Hayroo updates!');
    setNewsletterEmail('');
  };

  return (
    <footer className="mt-20 border-t border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text)] transition-colors duration-150">
      
      {/* Top Value Propositions */}
      <section aria-label="Customer Guarantees" className="border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-md bg-[var(--color-primary)] text-white shrink-0">
              <Truck className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[var(--color-text)]">Free Express Delivery</h4>
              <p className="text-xs text-[var(--color-text-muted)]">On all domestic orders over ₹1,500</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-md bg-[var(--color-primary)] text-white shrink-0">
              <RotateCcw className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[var(--color-text)]">30-Day Easy Returns</h4>
              <p className="text-xs text-[var(--color-text-muted)]">Hassle-free replacements and refunds</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-md bg-[var(--color-primary)] text-white shrink-0">
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[var(--color-text)]">Authentic Products</h4>
              <p className="text-xs text-[var(--color-text-muted)]">100% genuine brand warranty</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-md bg-[var(--color-primary)] text-white shrink-0">
              <Headphones className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[var(--color-text)]">Direct Support</h4>
              <p className="text-xs text-[var(--color-text-muted)]">Monday to Saturday: 9:00 AM to 7:00 PM</p>
            </div>
          </div>

        </div>
      </section>

      {/* Main Footer Directory */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        
        {/* Brand Information & Newsletter */}
        <div className="lg:col-span-2 space-y-4">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold text-base">
              A
            </div>
            <span className="text-xl font-extrabold tracking-tight text-[var(--color-text)] font-heading">
              ApexBazaar
            </span>
          </Link>
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed max-w-sm">
            India's enterprise multi-vendor marketplace with 100k+ products across all retail categories. Featuring atomic split-vendor fulfillment and escrow-guaranteed customer protection.
          </p>

          {/* Newsletter Signup Form */}
          <div className="pt-2">
            <p className="font-bold text-xs text-[var(--color-text)] mb-2">
              Subscribe to Hayroo Product Updates
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
              <div className="relative flex-1">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] text-xs rounded-md pl-8 pr-3 py-2 text-[var(--color-text)] placeholder-[var(--color-text-subtle)] focus:outline-none focus:border-[var(--color-primary)]"
                />
                <Mail className="w-3.5 h-3.5 text-[var(--color-text-subtle)] absolute left-2.5 top-2.5" aria-hidden="true" />
              </div>
              <button
                type="submit"
                className="btn-primary btn-sm flex items-center gap-1 shrink-0"
              >
                Join <Send className="w-3 h-3" aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>

        {/* Categories Directory */}
        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--color-text)] mb-3">
            Shop Catalog
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link to="/products?category=Computers" className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">
                Laptops and Desktops
              </Link>
            </li>
            <li>
              <Link to="/products?category=Phone%2FTablets" className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">
                Smartphones and Tablets
              </Link>
            </li>
            <li>
              <Link to="/products?category=Audio" className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">
                Headphones and Speakers
              </Link>
            </li>
            <li>
              <Link to="/products?category=Wearables" className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">
                Smartwatches and Bands
              </Link>
            </li>
            <li>
              <Link to="/products?category=Smart%20Home" className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">
                Smart Home and Living
              </Link>
            </li>
          </ul>
        </div>

        {/* Customer Care & Policies */}
        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--color-text)] mb-3">
            Ecosystem Portals
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link to="/seller" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
                🏪 Seller & Vendor Portal
              </Link>
            </li>
            <li>
              <Link to="/delivery" className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">
                🚚 Delivery Agent PWA
              </Link>
            </li>
            <li>
              <Link to="/admin" className="text-purple-400 font-semibold hover:text-purple-300 transition-colors">
                🛡️ Platform Governance Hub
              </Link>
            </li>
            <li>
              <Link to="/account" className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">
                My Orders & Returns
              </Link>
            </li>
            <li>
              <Link to="/faq" className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">
                Escrow & Delivery FAQ
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">
                24/7 Dispute Helpdesk
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Information & Legal Links */}
        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--color-text)] mb-3">
            Store and Contact
          </h4>
          <address className="not-italic space-y-2 text-xs text-[var(--color-text-muted)]">
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-[var(--color-primary)] shrink-0 mt-0.5" aria-hidden="true" />
              <span>Hayroo Retail, Brigade Gateway, Malleshwaram, Bengaluru, Karnataka 560055</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[var(--color-primary)] shrink-0" aria-hidden="true" />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[var(--color-primary)] shrink-0" aria-hidden="true" />
              <span>support@hayroo.store</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[var(--color-primary)] shrink-0" aria-hidden="true" />
              <span>Mon to Sat: 9:00 AM to 7:00 PM</span>
            </div>
          </address>

          {/* Legal & Help Links */}
          <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
            <Link to="/privacy" className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">
              Terms of Service
            </Link>
            <Link to="/faq" className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">
              FAQ
            </Link>
            <Link to="/contact" className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      {/* Payment Methods & Security Bottom Bar */}
      <div className="border-t border-[var(--color-border)] bg-[var(--color-bg-subtle)] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          
          {/* Copyright notice (zero builder or AI slop badges, zero em dashes) */}
          <div className="text-[var(--color-text-muted)] text-center md:text-left">
            <p>© 2026 Hayroo Retail Private Limited. All rights reserved.</p>
          </div>

          {/* Secure Payment Badges (Clean SVG Icons, 4-8px radius badges) */}
          <div className="flex items-center flex-wrap justify-center gap-2">
            <span className="text-[11px] font-semibold text-[var(--color-text-muted)] mr-1 flex items-center gap-1">
              <Lock className="w-3 h-3 text-[var(--color-primary)]" aria-hidden="true" />
              Secure Payments:
            </span>

            {/* Visa */}
            <div className="px-2 py-1 rounded bg-[var(--color-card)] border border-[var(--color-border)] text-[10px] font-bold text-[#1A1F71] tracking-wider" title="Visa">
              VISA
            </div>

            {/* Mastercard */}
            <div className="px-2 py-1 rounded bg-[var(--color-card)] border border-[var(--color-border)] text-[10px] font-bold text-[#EB001B] tracking-wider" title="Mastercard">
              MASTERCARD
            </div>

            {/* RuPay */}
            <div className="px-2 py-1 rounded bg-[var(--color-card)] border border-[var(--color-border)] text-[10px] font-bold text-[#097939] tracking-wider" title="RuPay">
              RuPay
            </div>

            {/* UPI */}
            <div className="px-2 py-1 rounded bg-[var(--color-card)] border border-[var(--color-border)] text-[10px] font-bold text-[#4B7330] tracking-wider" title="UPI">
              UPI
            </div>

            {/* Net Banking */}
            <div className="px-2 py-1 rounded bg-[var(--color-card)] border border-[var(--color-border)] text-[10px] font-bold text-[var(--color-text)] tracking-wider" title="Net Banking">
              NET BANKING
            </div>

            {/* Cash on Delivery */}
            <div className="px-2 py-1 rounded bg-[var(--color-card)] border border-[var(--color-border)] text-[10px] font-bold text-[var(--color-primary)] tracking-wider" title="Cash on Delivery Available">
              COD
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
