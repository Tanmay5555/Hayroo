import { create } from 'zustand';

const THEME_STORAGE_KEY = 'hayroo_theme';

const getSystemPreference = () => {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return 'light';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const getStoredPreference = () => {
  if (typeof window === 'undefined') return null;
  try {
    const item = localStorage.getItem(THEME_STORAGE_KEY);
    return item === 'dark' || item === 'light' ? item : null;
  } catch {
    return null;
  }
};

const applyThemeToDOM = (theme) => {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const isDark = theme === 'dark';

  if (isDark) {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
  } else {
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
  }

  // Update theme-color meta tag for mobile browsers and PWA
  const metaThemeColor = document.getElementById('meta-theme-color');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', isDark ? '#0A130F' : '#047857');
  }
};

export const useThemeStore = create((set, get) => ({
  theme: getStoredPreference() || getSystemPreference(),
  hasExplicitChoice: Boolean(getStoredPreference()),

  // Toggle between light and dark modes
  toggleTheme: () => {
    const currentTheme = get().theme;
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';

    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // Ignore local storage exceptions
    }

    applyThemeToDOM(nextTheme);
    set({ theme: nextTheme, hasExplicitChoice: true });
  },

  // Explicitly set a specific theme
  setTheme: (theme) => {
    if (theme !== 'light' && theme !== 'dark') return;

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore local storage exceptions
    }

    applyThemeToDOM(theme);
    set({ theme, hasExplicitChoice: true });
  },

  // Reset to system preference
  resetToSystemTheme: () => {
    try {
      localStorage.removeItem(THEME_STORAGE_KEY);
    } catch {
      // Ignore local storage exceptions
    }

    const systemTheme = getSystemPreference();
    applyThemeToDOM(systemTheme);
    set({ theme: systemTheme, hasExplicitChoice: false });
  },

  // Initialize theme on app mount and bind system preference listener
  initTheme: () => {
    const stored = getStoredPreference();
    const systemTheme = getSystemPreference();
    const activeTheme = stored || systemTheme;

    applyThemeToDOM(activeTheme);
    set({ theme: activeTheme, hasExplicitChoice: Boolean(stored) });

    // Listen for OS/browser theme preference changes
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleSystemChange = (e) => {
        // Only react to system changes if the user hasn't explicitly set a preference
        if (!getStoredPreference()) {
          const newSystemTheme = e.matches ? 'dark' : 'light';
          applyThemeToDOM(newSystemTheme);
          set({ theme: newSystemTheme, hasExplicitChoice: false });
        }
      };

      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleSystemChange);
      } else if (mediaQuery.addListener) {
        mediaQuery.addListener(handleSystemChange);
      }
    }
  },
}));
