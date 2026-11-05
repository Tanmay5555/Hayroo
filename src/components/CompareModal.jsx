import React from 'react';
import { X, Scale, ShoppingBag, Check, Minus } from 'lucide-react';
import { useCompareStore } from '../store/useCompareStore';
import { useCartStore } from '../store/useCartStore';
import toast from 'react-hot-toast';

export default function CompareModal() {
  const { compareItems, isCompareModalOpen, setCompareModalOpen, removeCompare } = useCompareStore();
  const { addToCart } = useCartStore();

  if (!isCompareModalOpen || compareItems.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={() => setCompareModalOpen(false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Side by Side Product Comparison"
        className="relative w-full max-w-5xl bg-[var(--color-card)] border border-[var(--color-border)] rounded-md shadow-2xl text-[var(--color-text)] flex flex-col max-h-[90vh] overflow-hidden z-10 animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-primary)]">
              <Scale className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-heading text-[var(--color-text)]">
                Product Comparison
              </h2>
              <p className="text-xs text-[var(--color-text-muted)]">
                Compare specifications, features, and pricing
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCompareModalOpen(false)}
            className="p-1.5 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-border)] transition-colors"
            aria-label="Close comparison modal"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Modal Body Table */}
        <div className="flex-1 overflow-x-auto overflow-y-auto p-4 sm:p-6">
          <table className="w-full text-left border-collapse min-w-[600px] text-xs">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="p-3 text-xs font-bold text-[var(--color-text-muted)] uppercase w-40">
                  Feature
                </th>
                {compareItems.map((prod) => {
                  const numPrice = typeof prod.price === 'number'
                    ? prod.price
                    : (parseFloat(String(prod.price).replace(/,/g, '')) || 0);

                  return (
                    <th key={prod._id || prod.id} className="p-3 text-center min-w-[180px]">
                      <div className="flex flex-col items-center gap-2">
                        <button
                          type="button"
                          onClick={() => removeCompare(prod._id || prod.id)}
                          className="self-end text-[var(--color-text-subtle)] hover:text-[#DC2626]"
                          title="Remove from comparison"
                          aria-label={`Remove ${prod.title}`}
                        >
                          <X className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <div className="w-20 h-20 rounded-md bg-[var(--color-bg-subtle)] p-2 flex items-center justify-center border border-[var(--color-border)]">
                          <img
                            src={prod.imageLight || prod.images?.[0]}
                            alt={prod.title}
                            className="max-h-full max-w-full object-contain"
                            loading="lazy"
                          />
                        </div>
                        <h4 className="font-bold text-[var(--color-text)] text-center line-clamp-2">
                          {prod.title}
                        </h4>
                        <span className="text-sm font-bold text-[var(--color-primary)]">
                          ₹{numPrice.toLocaleString('en-IN')}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            addToCart(prod, 1);
                            toast.success(`Added ${prod.title} to cart`);
                          }}
                          className="btn-primary btn-sm flex items-center gap-1 w-full justify-center"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Add to Cart</span>
                        </button>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              <tr>
                <td className="p-3 font-bold text-[var(--color-text)]">Category</td>
                {compareItems.map((p) => (
                  <td key={p._id || p.id} className="p-3 text-center text-[var(--color-text-muted)]">
                    {p.category}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-3 font-bold text-[var(--color-text)]">Brand</td>
                {compareItems.map((p) => (
                  <td key={p._id || p.id} className="p-3 text-center text-[var(--color-text-muted)]">
                    {p.brand || 'Hayroo'}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-3 font-bold text-[var(--color-text)]">Stock Availability</td>
                {compareItems.map((p) => (
                  <td key={p._id || p.id} className="p-3 text-center">
                    {(p.stock === undefined || p.stock > 0) ? (
                      <span className="inline-flex items-center gap-1 text-[var(--color-primary)] font-bold">
                        <Check className="w-3.5 h-3.5" aria-hidden="true" /> In Stock
                      </span>
                    ) : (
                      <span className="text-[#DC2626] font-bold">Out of Stock</span>
                    )}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-3 font-bold text-[var(--color-text)]">Key Highlights</td>
                {compareItems.map((p) => (
                  <td key={p._id || p.id} className="p-3 text-left">
                    {Array.isArray(p.features) && p.features.length > 0 ? (
                      <ul className="space-y-1">
                        {p.features.slice(0, 3).map((f, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 text-[var(--color-text-muted)]">
                            <Check className="w-3 h-3 text-[var(--color-primary)] mt-0.5 shrink-0" aria-hidden="true" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-[var(--color-text-subtle)] text-center block">Standard specifications</span>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
