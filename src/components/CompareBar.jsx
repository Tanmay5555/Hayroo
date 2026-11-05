import React from 'react';
import { Scale, X, ArrowRight } from 'lucide-react';
import { useCompareStore } from '../store/useCompareStore';

export default function CompareBar() {
  const { compareItems, setCompareModalOpen, removeCompare, clearCompare } = useCompareStore();

  if (compareItems.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[var(--color-card)] border border-[var(--color-border)] shadow-xl rounded-md px-4 py-2.5 flex items-center gap-3 animate-in slide-in-from-bottom duration-200 max-w-2xl w-[90vw] text-[var(--color-text)]">
      <div className="flex items-center gap-1.5 text-[var(--color-primary)] font-bold text-xs whitespace-nowrap">
        <Scale className="w-4 h-4" aria-hidden="true" />
        <span>Compare ({compareItems.length}/4)</span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto flex-1 py-1">
        {compareItems.map((prod) => (
          <div
            key={prod._id || prod.id}
            className="flex items-center gap-2 bg-[var(--color-bg-subtle)] border border-[var(--color-border)] rounded-md p-1 pr-2 min-w-[120px] max-w-[150px]"
          >
            <img
              src={prod.imageLight || prod.images?.[0]}
              alt={prod.title}
              className="w-5 h-5 object-contain"
              loading="lazy"
            />
            <span className="text-[11px] text-[var(--color-text)] truncate flex-1">{prod.title}</span>
            <button
              type="button"
              onClick={() => removeCompare(prod._id || prod.id)}
              className="text-[var(--color-text-subtle)] hover:text-[#DC2626]"
              title="Remove from compare"
              aria-label={`Remove ${prod.title} from compare`}
            >
              <X className="w-3 h-3" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => setCompareModalOpen(true)}
          className="btn-primary btn-sm flex items-center gap-1 text-xs"
        >
          <span>Compare</span>
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={clearCompare}
          className="p-1 text-[var(--color-text-subtle)] hover:text-[var(--color-text)] rounded-md transition-colors"
          title="Clear all compared items"
          aria-label="Clear all compared items"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
