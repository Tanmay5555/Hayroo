import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

/**
 * BackToTop Component
 * - Appears when user scrolls down beyond 300px
 * - Smoothly scrolls window back to top
 * - Strictly 6px rounded corners (4-8px rule, no pill shapes)
 * - Accessible keyboard focus and ARIA labels
 */
export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    toggleVisibility();

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      title="Back to top"
      className="fixed bottom-6 right-20 z-40 p-2.5 rounded-md bg-[var(--color-card)] text-[var(--color-text)] border border-[var(--color-border)] shadow-md hover:bg-[var(--color-bg-subtle)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] active:translate-y-0.5 focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] focus-visible:outline-offset-2 transition-all duration-150"
    >
      <ArrowUp className="w-5 h-5" aria-hidden="true" />
      <span className="sr-only">Back to top</span>
    </button>
  );
}
