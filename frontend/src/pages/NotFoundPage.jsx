import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Home, ShoppingBag } from 'lucide-react';
import { useSeo } from '../hooks/useSeo';

export default function NotFoundPage() {
  const navigate = useNavigate();

  useSeo({
    title: 'Page Not Found',
    description: 'The requested page or product link could not be found on Hayroo.',
    canonicalPath: '/404',
  });

  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6 text-[var(--color-text)]">
      <div className="w-20 h-20 rounded-md bg-[var(--color-bg-subtle)] border border-[var(--color-border)] flex items-center justify-center mx-auto text-[var(--color-primary)]">
        <AlertCircle className="w-10 h-10" aria-hidden="true" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
          Error 404
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold font-heading text-[var(--color-text)]">
          Page Not Found
        </h1>
        <p className="text-xs sm:text-sm text-[var(--color-text-muted)] max-w-sm mx-auto leading-relaxed">
          The product or page you are looking for has moved, expired, or does not exist.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="btn-primary btn-md flex items-center gap-2"
        >
          <Home className="w-4 h-4" aria-hidden="true" />
          <span>Return Home</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/products')}
          className="btn-secondary btn-md flex items-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" aria-hidden="true" />
          <span>Browse Catalog</span>
        </button>
      </div>
    </div>
  );
}
