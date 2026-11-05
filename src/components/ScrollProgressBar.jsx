import React, { useState, useEffect } from 'react';

/**
 * ScrollProgressBar Component
 * Displays a subtle, thin scroll indicator fixed at the top of the viewport.
 * Complies with Hayroo design system:
 * - Brand primary emerald green (#047857 in light, #10B981 in dark)
 * - Lightweight, non-intrusive (3px height)
 * - Zero cursor or crazy scroll animations
 */
export default function ScrollProgressBar() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) {
        setScrollProgress(0);
        return;
      }
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (scrollProgress <= 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[3px] z-50 pointer-events-none bg-black/5 dark:bg-white/5"
    >
      <div
        className="h-full bg-[var(--color-primary)] transition-[width] duration-75 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
}
