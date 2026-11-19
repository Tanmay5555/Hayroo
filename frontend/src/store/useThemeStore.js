import { create } from 'zustand';
import apiClient from '../api/axios';

const THEME_STORAGE_KEY = 'hayroo_theme';
const FESTIVAL_STORAGE_KEY = 'hayroo_festival_theme';
const FESTIVAL_MODE_KEY = 'hayroo_festival_mode';
const FESTIVAL_BANNER_KEY = 'hayroo_festival_banner';

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

const getStoredFestival = () => {
  if (typeof window === 'undefined') return 'default';
  try {
    return localStorage.getItem(FESTIVAL_STORAGE_KEY) || 'default';
  } catch {
    return 'default';
  }
};

const getStoredFestivalMode = () => {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(FESTIVAL_MODE_KEY) === 'true';
  } catch {
    return false;
  }
};

const getStoredFestivalBanner = () => {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem(FESTIVAL_BANNER_KEY) || '';
  } catch {
    return '';
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
    metaThemeColor.setAttribute('content', isDark ? '#0D0F0E' : '#FAF9F6');
  }
};

const applyFestivalThemeToDOM = (festivalTheme) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  if (festivalTheme && festivalTheme !== 'default') {
    root.setAttribute('data-festival', festivalTheme);
  } else {
    root.removeAttribute('data-festival');
  }
};

export const useThemeStore = create((set, get) => ({
  // Personal User Mode (Light / Dark)
  theme: getStoredPreference() || getSystemPreference(),
  hasExplicitChoice: Boolean(getStoredPreference()),

  // Site-wide Festival Theme (Admin Managed)
  festivalTheme: getStoredFestival(),
  isFestivalMode: getStoredFestivalMode(),
  festivalBannerText: getStoredFestivalBanner(),
  isSyncingFestival: false,

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

  // Explicitly set light or dark theme
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

  // Fetch site-wide festival theme from backend (Public)
  fetchFestivalTheme: async () => {
    try {
      const res = await apiClient.get('/theme');
      const data = res.data?.data || res.data;
      if (data) {
        const theme = data.activeTheme || 'default';
        const isFestival = Boolean(data.isFestivalMode);
        const bannerText = data.festivalBannerText || '';

        applyFestivalThemeToDOM(theme);
        try {
          localStorage.setItem(FESTIVAL_STORAGE_KEY, theme);
          localStorage.setItem(FESTIVAL_MODE_KEY, String(isFestival));
          localStorage.setItem(FESTIVAL_BANNER_KEY, bannerText);
        } catch {
          // Ignore storage quota
        }

        set({
          festivalTheme: theme,
          isFestivalMode: isFestival,
          festivalBannerText: bannerText,
        });
      }
    } catch {
      // Offline fallback: keep cached festival settings
    }
  },

  // Update site-wide festival theme (Admin Only)
  setFestivalThemeAdmin: async ({ activeTheme, isFestivalMode, festivalBannerText }) => {
    // 1. Optimistically apply to DOM and local storage immediately
    const theme = activeTheme || 'default';
    const mode = typeof isFestivalMode === 'boolean' ? isFestivalMode : false;
    const banner = festivalBannerText !== undefined ? festivalBannerText : '';

    applyFestivalThemeToDOM(theme);
    try {
      localStorage.setItem(FESTIVAL_STORAGE_KEY, theme);
      localStorage.setItem(FESTIVAL_MODE_KEY, String(mode));
      localStorage.setItem(FESTIVAL_BANNER_KEY, banner);
    } catch {
      // Ignore storage quota
    }

    set({
      festivalTheme: theme,
      isFestivalMode: mode,
      festivalBannerText: banner,
      isSyncingFestival: true,
    });

    // 2. Persist to backend database asynchronously
    try {
      const res = await apiClient.patch('/admin/theme', {
        activeTheme: theme,
        isFestivalMode: mode,
        festivalBannerText: banner,
      });

      const updated = res.data?.data || res.data;
      set({ isSyncingFestival: false });
      return { success: true, data: updated };
    } catch (err) {
      set({ isSyncingFestival: false });
      console.warn('Backend theme sync notice:', err.response?.data?.message || err.message);
      // Theme remains active and persisted in browser storage!
      return { success: true, localOnly: true };
    }
  },

  // Initialize theme on app mount and bind listeners
  initTheme: () => {
    // 1. Light / Dark mode initialization
    const stored = getStoredPreference();
    const systemTheme = getSystemPreference();
    const activeTheme = stored || systemTheme;

    applyThemeToDOM(activeTheme);
    set({ theme: activeTheme, hasExplicitChoice: Boolean(stored) });

    // 2. Immediate local cache application for festival theme (no layout flash)
    const initialFestival = getStoredFestival();
    applyFestivalThemeToDOM(initialFestival);

    // 3. Asynchronously synchronize with backend for live site-wide theme
    get().fetchFestivalTheme();

    // 4. Listen for OS/browser theme preference changes
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleSystemChange = (e) => {
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
