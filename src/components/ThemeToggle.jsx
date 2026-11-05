import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../store/useThemeStore';

/**
 * ThemeToggle Component
 * Complies with Hayroo design system:
 * - 6px rounded corners (4-8px rule, no pill shapes)
 * - Pure SVG icons from Lucide (no emojis)
 * - Complete keyboard accessibility, focus rings, hover and active states
 */
export default function ThemeToggle({ className = '', showLabel = false }) {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`btn-ghost inline-flex items-center gap-2 p-2 rounded-md transition-colors duration-150 text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)] focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] focus-visible:outline-offset-2 ${className}`}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-amber-400 transition-transform duration-200" aria-hidden="true" />
      ) : (
        <Moon className="w-5 h-5 text-[var(--color-primary)] transition-transform duration-200" aria-hidden="true" />
      )}
      {showLabel && (
        <span className="text-sm font-medium">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
}
