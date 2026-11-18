import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import { useThemeStore } from '../store/useThemeStore';

const DEFAULT_GREETINGS = {
  diwali: '✨ Shubh Deepawali: Celebrate with exclusive festive discounts & lightning deals across Hayroo!',
  holi: '🎨 Rang Barse: Celebrate the festival of colors with vibrant seasonal collections & free delivery!',
  eid: '🌙 Eid Mubarak: Blessed greetings and celebratory festive offers for you and your family!',
  christmas: '🎄 Festive Joy: Merry Christmas and Happy New Year special deals on premium essentials!',
  independence: '🇮🇳 Pride of the Nation: Celebrate with special Indian-crafted collections & festive perks!',
  monsoon: '🌧️ Monsoon Delights: Refreshing rainy season deals & lightning delivery at your doorstep!',
};

export default function FestivalBanner() {
  const { isFestivalMode, festivalTheme, festivalBannerText } = useThemeStore();
  const [isDismissed, setIsDismissed] = useState(false);

  // Check session storage on mount
  useEffect(() => {
    try {
      const dismissed = sessionStorage.getItem(`hayroo_dismiss_festival_${festivalTheme}`);
      if (dismissed === 'true') {
        setIsDismissed(true);
      } else {
        setIsDismissed(false);
      }
    } catch {
      // Ignore sessionStorage exceptions
    }
  }, [festivalTheme]);

  if (!isFestivalMode || isDismissed) {
    return null;
  }

  const displayText =
    festivalBannerText && festivalBannerText.trim()
      ? festivalBannerText.trim()
      : DEFAULT_GREETINGS[festivalTheme] || '✨ Festive celebrations and special seasonal discounts are live on Hayroo!';

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem(`hayroo_dismiss_festival_${festivalTheme}`, 'true');
    } catch {
      // Ignore sessionStorage exceptions
    }
  };

  return (
    <div
      role="banner"
      aria-label="Festive Announcement"
      className="relative bg-[var(--color-primary)] text-[var(--color-primary-text)] text-xs py-2 px-4 border-b border-[var(--color-primary-hover)] overflow-hidden transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex-1 flex items-center justify-center gap-2 text-center truncate">
          <Sparkles className="w-3.5 h-3.5 shrink-0 animate-pulse text-[var(--color-accent)]" aria-hidden="true" />
          <span className="font-medium tracking-wide truncate">{displayText}</span>
          <Link
            to="/products"
            className="hidden sm:inline-flex items-center gap-1 font-bold underline underline-offset-2 ml-1 hover:opacity-90 shrink-0 text-[11px]"
          >
            <span>Shop Collection</span>
            <ArrowRight className="w-3 h-3 shrink-0" aria-hidden="true" />
          </Link>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="p-1 rounded hover:bg-black/10 text-[var(--color-primary-text)]/80 hover:text-[var(--color-primary-text)] transition-colors shrink-0"
          aria-label="Dismiss festive announcement"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
