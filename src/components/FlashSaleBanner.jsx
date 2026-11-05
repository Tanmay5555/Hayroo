import React, { useState, useEffect } from 'react';
import { Tag, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * FlashSaleBanner Component
 * Complies with Hayroo design system:
 * - Emerald green brand primary (#047857) with accent (#A7F3D0)
 * - 6px rounded corner badges (no pill shapes)
 * - Pure SVG icons from Lucide (no emojis)
 * - Zero purple gradients
 */
export default function FlashSaleBanner() {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({ hours: 7, minutes: 42, seconds: 19 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <aside aria-label="Special Offer" className="bg-[#047857] text-[#FFFFFF] text-xs py-2 px-4 border-b border-[#065F46]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        <div className="flex items-center gap-2 font-medium">
          <span className="inline-flex items-center gap-1 bg-[#064E3B] text-[#A7F3D0] px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase">
            <Tag className="w-3 h-3 text-[#A7F3D0]" aria-hidden="true" />
            Limited Offer
          </span>
          <span className="hidden sm:inline">
            Seasonal essentials discount: Save up to 25% on selected categories today.
          </span>
          <span className="sm:hidden">
            Save up to 25% on selected essentials.
          </span>
        </div>

        {/* Live Timer */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 font-mono font-bold text-[11px] bg-[#064E3B] text-[#FFFBEB] px-2.5 py-0.5 rounded-md">
            <Clock className="w-3 h-3 text-[#A7F3D0] mr-1" aria-hidden="true" />
            <span>{String(timeLeft.hours).padStart(2, '0')}h</span> :
            <span>{String(timeLeft.minutes).padStart(2, '0')}m</span> :
            <span>{String(timeLeft.seconds).padStart(2, '0')}s</span>
          </div>

          <button
            type="button"
            onClick={() => navigate('/products')}
            className="hidden md:inline-flex items-center gap-1 font-semibold text-[#A7F3D0] hover:text-[#FFFFFF] underline transition-colors"
          >
            Browse Deals <ArrowRight className="w-3 h-3" aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  );
}
