import React, { useEffect, useCallback } from 'react';
import { AlertCircle, X } from 'lucide-react';

/**
 * ConfirmationModal Component
 * Reusable modal for confirming destructive or critical actions:
 * - Remove item from cart
 * - Clear entire cart
 * - Confirm order placement
 * Complies with Hayroo design system:
 * - 8px rounded corners (4-8px rule, no pill shapes)
 * - Accessible keyboard navigation (Escape to cancel)
 * - Brand color tokens and clear focus states
 */
export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDanger = false,
  onConfirm,
  onCancel,
}) {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onCancel();
    },
    [onCancel]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        onClick={onCancel}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md card p-6 bg-[var(--color-card)] border-[var(--color-border)] shadow-xl z-10 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-md ${
                isDanger
                  ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400'
                  : 'bg-[var(--color-bg-subtle)] text-[var(--color-primary)]'
              }`}
            >
              <AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
            </div>
            <h3 id="confirm-modal-title" className="text-base font-bold text-[var(--color-text)]">
              {title}
            </h3>
          </div>

          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancel and close"
            className="p-1 rounded-md text-[var(--color-text-subtle)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[var(--color-text-muted)] leading-relaxed pl-10">
          {message}
        </p>

        {/* Buttons Row */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--color-border)]">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary btn-sm"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className={isDanger ? 'btn-danger btn-sm' : 'btn-primary btn-sm'}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
