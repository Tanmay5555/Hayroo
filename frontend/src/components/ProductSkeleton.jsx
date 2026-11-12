import React from 'react';

/**
 * ProductSkeleton Component
 * Simple, quick skeleton loader that reflects the ProductCard dimensions.
 * Complies with Hayroo design system:
 * - 6px rounded corners (4-8px rule, no pill shapes)
 * - Subtle neutral shimmer animation
 * - Accessible aria-busy attributes
 */
export default function ProductSkeleton({ count = 1, viewMode = 'grid' }) {
  const items = Array.from({ length: count }, (_, idx) => idx);

  if (viewMode === 'list') {
    return (
      <div className="space-y-4 w-full" aria-busy="true" aria-label="Loading products">
        {items.map((key) => (
          <div
            key={key}
            className="card p-4 flex flex-col sm:flex-row items-center gap-4 animate-pulse"
          >
            <div className="w-full sm:w-40 aspect-square bg-[var(--color-bg-subtle)] rounded-md shrink-0" />
            <div className="flex-1 w-full space-y-3">
              <div className="h-4 bg-[var(--color-bg-subtle)] rounded w-1/4" />
              <div className="h-5 bg-[var(--color-bg-subtle)] rounded w-3/4" />
              <div className="h-3 bg-[var(--color-bg-subtle)] rounded w-1/2" />
              <div className="h-6 bg-[var(--color-bg-subtle)] rounded w-1/3 pt-2" />
            </div>
            <div className="w-full sm:w-28 h-10 bg-[var(--color-bg-subtle)] rounded-md shrink-0" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full"
      aria-busy="true"
      aria-label="Loading products"
    >
      {items.map((key) => (
        <div
          key={key}
          className="card p-4 flex flex-col justify-between space-y-4 animate-pulse"
        >
          {/* Header Tag Skeleton */}
          <div className="flex justify-between items-center">
            <div className="h-4 bg-[var(--color-bg-subtle)] rounded w-16" />
            <div className="w-7 h-7 bg-[var(--color-bg-subtle)] rounded-md" />
          </div>

          {/* Image Placeholder Skeleton */}
          <div className="aspect-square w-full bg-[var(--color-bg-subtle)] rounded-md flex items-center justify-center" />

          {/* Details Skeleton */}
          <div className="space-y-2">
            <div className="h-3 bg-[var(--color-bg-subtle)] rounded w-1/3" />
            <div className="h-4 bg-[var(--color-bg-subtle)] rounded w-full" />
            <div className="h-4 bg-[var(--color-bg-subtle)] rounded w-2/3" />
          </div>

          {/* Price & Action Skeleton */}
          <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between">
            <div className="h-5 bg-[var(--color-bg-subtle)] rounded w-20" />
            <div className="h-8 bg-[var(--color-bg-subtle)] rounded-md w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
