import { useState, useEffect } from 'react';
import { Zap, X, ArrowRight } from 'lucide-react';

export default function FlashBanner({ onApplyCode }) {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 28, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 4, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isVisible) return null;

  const pad = (num) => String(num).padStart(2, '0');

  return (
    <div className="bg-linear-to-r from-orange-600 via-amber-500 to-orange-600 text-slate-950 font-bold px-4 py-2 text-xs flex items-center justify-between shadow-md relative z-50">
      <div className="mx-auto flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-center">
        <div className="flex items-center gap-1.5 bg-slate-950/15 px-2.5 py-1 rounded-full text-white">
          <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300 animate-pulse" />
          <span className="uppercase tracking-wider font-extrabold text-[11px]">Flash Sale Live</span>
        </div>

        <span className="hidden sm:inline">Use code <strong className="bg-slate-950 text-white px-2 py-0.5 rounded text-[11px]">HAYROO10</strong> for 10% OFF</span>

        <div className="flex items-center gap-1 font-mono text-xs bg-slate-950/80 text-white px-3 py-0.5 rounded-lg border border-amber-300/30">
          <span>{pad(timeLeft.hours)}h</span>:
          <span>{pad(timeLeft.minutes)}m</span>:
          <span className="text-amber-300">{pad(timeLeft.seconds)}s</span>
        </div>
      </div>

      <button
        onClick={() => setIsVisible(false)}
        className="p-1 hover:bg-black/10 rounded-md transition-colors cursor-pointer text-slate-900"
        title="Dismiss banner"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
