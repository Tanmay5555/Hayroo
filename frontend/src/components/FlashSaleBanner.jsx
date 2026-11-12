import React from 'react';
import { Link } from 'react-router-dom';

/**
 * TopUtilityBar (exported as FlashSaleBanner to preserve component contract)
 * Provides quiet shipping/protection info alongside direct portal & support links.
 */
export default function FlashSaleBanner() {
  return (
    <div
      role="region"
      aria-label="Store policy and portal links"
      className="bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)] text-[11px] border-b border-[var(--color-border)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between gap-4">
        <p className="truncate font-medium">
          Free shipping on orders over ₹999
          <span className="mx-2 text-[var(--color-border)]" aria-hidden="true">|</span>
          <span className="hidden sm:inline">T+7 escrow buyer protection on all vendor orders</span>
          <span className="sm:hidden">Escrow buyer protection</span>
        </p>

        <nav aria-label="Workspace and support links" className="hidden md:flex items-center gap-4 shrink-0 font-medium">
          <Link to="/seller" className="hover:text-[var(--color-text)] transition-colors">
            Seller Portal
          </Link>
          <span className="text-[var(--color-border)]" aria-hidden="true">/</span>
          <Link to="/delivery" className="hover:text-[var(--color-text)] transition-colors">
            Delivery Hub
          </Link>
          <span className="text-[var(--color-border)]" aria-hidden="true">/</span>
          <Link to="/admin" className="hover:text-[var(--color-text)] transition-colors">
            Admin
          </Link>
          <span className="text-[var(--color-border)]" aria-hidden="true">/</span>
          <Link to="/faq" className="hover:text-[var(--color-text)] transition-colors">
            Help
          </Link>
        </nav>
      </div>
    </div>
  );
}
