import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Send,
  Lock,
  Phone,
  MapPin,
  Clock,
  ExternalLink,
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
    toast.success('Subscribed to Hayroo catalog updates.');
    setNewsletterEmail('');
  };

  return (
    <footer className="mt-20 border-t border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text)] transition-colors duration-150">
      
      {/* Main Footer Directory */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        
        {/* Brand Information & Newsletter */}
        <div className="lg:col-span-2 space-y-4">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[6px] bg-[var(--color-primary)] flex items-center justify-center text-[var(--color-primary-text)] font-bold text-sm">
              H
            </div>
            <span className="text-[17px] font-semibold tracking-tight text-[var(--color-text)]">
              Hayroo
            </span>
          </Link>
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed max-w-sm">
            A multi-vendor marketplace connecting independent brands, verified electronics distributors, and daily essentials under unified split checkout and T+7 escrow buyer protection.
          </p>

          {/* Newsletter Signup Form */}
          <div className="pt-2">
            <label htmlFor="footer-newsletter" className="block font-medium text-xs text-[var(--color-text)] mb-2">
              Product releases & restock alerts
            </label>
            <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
              <div className="relative flex-1">
                <input
                  id="footer-newsletter"
                  type="email"
                  placeholder="you@domain.com"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="form-input text-xs py-2 pl-8"
                />
                <Mail className="w-3.5 h-3.5 text-[var(--color-text-subtle)] absolute left-2.5 top-2.5" aria-hidden="true" />
              </div>
              <button
                type="submit"
                className="btn-primary btn-sm shrink-0"
              >
                Subscribe <Send className="w-3 h-3" aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>

        {/* Categories Directory */}
        <div>
          <h3 className="font-semibold text-xs uppercase tracking-wider text-[var(--color-text-subtle)] mb-3.5">
            Catalog
          </h3>
          <ul className="space-y-2.5 text-xs">
            <li>
              <Link to="/products?category=Computers" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                Computers & Desktops
              </Link>
            </li>
            <li>
              <Link to="/products?category=Phone%20%26%20Tablets" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                Phones & Tablets
              </Link>
            </li>
            <li>
              <Link to="/products?category=Electronics" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                Headphones & Audio
              </Link>
            </li>
            <li>
              <Link to="/products?category=Fashion%20%26%20Apparel" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                Fashion & Apparel
              </Link>
            </li>
            <li>
              <Link to="/products?category=Grocery%20%26%20Gourmet%20Foods" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                Grocery & Pantry
              </Link>
            </li>
            <li>
              <Link to="/products?category=Books" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                Books & Literature
              </Link>
            </li>
          </ul>
        </div>

        {/* Portals & Account */}
        <div>
          <h3 className="font-semibold text-xs uppercase tracking-wider text-[var(--color-text-subtle)] mb-3.5">
            Portals & Care
          </h3>
          <ul className="space-y-2.5 text-xs">
            <li>
              <Link to="/seller" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                Seller Portal
              </Link>
            </li>
            <li>
              <Link to="/delivery" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                Delivery Partner Hub
              </Link>
            </li>
            <li>
              <Link to="/admin" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                Admin Governance
              </Link>
            </li>
            <li>
              <Link to="/account" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                Orders & Returns
              </Link>
            </li>
            <li>
              <Link to="/faq" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                Escrow & Delivery FAQ
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                Support Desk
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Information & Legal Links */}
        <div>
          <h3 className="font-semibold text-xs uppercase tracking-wider text-[var(--color-text-subtle)] mb-3.5">
            Company
          </h3>
          <address className="not-italic space-y-2.5 text-xs text-[var(--color-text-muted)]">
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-[var(--color-text-subtle)] shrink-0 mt-0.5" aria-hidden="true" />
              <span>Brigade Gateway, Malleshwaram, Bengaluru 560055</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[var(--color-text-subtle)] shrink-0" aria-hidden="true" />
              <a
                href="https://wa.me/919876543210?text=Hi%20Hayroo%20Support,%20I%20have%20an%20inquiry"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--color-text)] inline-flex items-center gap-1 transition-colors"
              >
                +91 98765 43210 <ExternalLink className="w-3 h-3" aria-hidden="true" />
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[var(--color-text-subtle)] shrink-0" aria-hidden="true" />
              <span>support@hayroo.store</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[var(--color-text-subtle)] shrink-0" aria-hidden="true" />
              <span>Mon–Sat · 9:00 AM–7:00 PM IST</span>
            </div>
          </address>

          <div className="mt-5 pt-3 border-t border-[var(--color-border)] flex flex-wrap gap-x-4 gap-y-1.5 text-[11px]">
            <Link to="/privacy" className="text-[var(--color-text-subtle)] hover:text-[var(--color-text)] transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-[var(--color-text-subtle)] hover:text-[var(--color-text)] transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Legal & Payment Bar */}
      <div className="border-t border-[var(--color-border)] bg-[var(--color-bg-subtle)] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          
          <p className="text-[var(--color-text-subtle)] text-[11px]">
            © 2026 Hayroo Retail Private Limited. All rights reserved.
          </p>

          <div className="flex items-center flex-wrap justify-center gap-2">
            <span className="text-[11px] text-[var(--color-text-subtle)] mr-1 flex items-center gap-1">
              <Lock className="w-3 h-3" aria-hidden="true" />
              Payments:
            </span>
            {['UPI', 'VISA', 'Mastercard', 'RuPay', 'NetBanking', 'COD'].map((method) => (
              <span
                key={method}
                className="px-2 py-0.5 rounded bg-[var(--color-card)] border border-[var(--color-border)] text-[10px] font-mono font-medium text-[var(--color-text-muted)]"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
