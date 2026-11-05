import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, X } from 'lucide-react';
import { initAnalyticsIfConsented } from '../utils/analytics';

const COOKIE_STORAGE_KEY = 'hayroo_cookie_consent';

/**
 * CookieBanner Component
 * Complies with Chunk 5 requirements and Hayroo design system:
 * - Simple choice: Accept or Decline
 * - Persists choice in localStorage ('accepted' or 'declined')
 * - Blocks any analytics tracking prior to explicit user acceptance
 * - 6px rounded corners (4-8px rule, no pill shapes)
 * - Brand tokens: emerald green (#047857), cards, soft sage borders
 * - Zero emoji icons, zero em dashes
 */
export default function CookieBanner() {
  const [consentState, setConsentState] = useState('checking');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(COOKIE_STORAGE_KEY);
      if (stored === 'accepted' || stored === 'declined') {
        setConsentState(stored);
      } else {
        setConsentState('pending');
      }
    } catch {
      setConsentState('pending');
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(COOKIE_STORAGE_KEY, 'accepted');
    } catch {
      // ignore
    }
    setConsentState('accepted');
    initAnalyticsIfConsented();
    window.dispatchEvent(new Event('cookie_consent_updated'));
  };

  const handleDecline = () => {
    try {
      localStorage.setItem(COOKIE_STORAGE_KEY, 'declined');
    } catch {
      // ignore
    }
    setConsentState('declined');
    window.dispatchEvent(new Event('cookie_consent_updated'));
  };

  if (consentState !== 'pending') return null;

  return (
    <aside
      role="region"
      aria-label="Cookie and Privacy Preferences"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 card p-4 sm:p-5 bg-[var(--color-card)] border-[var(--color-border)] shadow-xl text-[var(--color-text)] space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-md bg-[var(--color-bg-subtle)] text-[var(--color-primary)] shrink-0">
          <ShieldCheck className="w-5 h-5" aria-hidden="true" />
        </div>

        <div className="space-y-1 text-xs">
          <h2 className="font-bold text-[var(--color-text)] text-sm">
            Your Privacy and Cookie Choices
          </h2>
          <p className="text-[var(--color-text-muted)] leading-relaxed">
            We use essential cookies to maintain your shopping cart and account session. Optional analytical cookies are only loaded if you choose to accept them. Learn more in our{' '}
            <Link to="/privacy" className="text-[var(--color-primary)] font-semibold underline">
              Privacy Policy
            </Link>.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[var(--color-border)]">
        <button
          type="button"
          onClick={handleDecline}
          className="btn-secondary btn-sm"
        >
          Decline Optional
        </button>

        <button
          type="button"
          onClick={handleAccept}
          className="btn-primary btn-sm"
        >
          Accept All
        </button>
      </div>
    </aside>
  );
}
