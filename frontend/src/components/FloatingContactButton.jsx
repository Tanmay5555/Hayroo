import React from 'react';

/**
 * FloatingContactButton Component
 * Floating WhatsApp contact button providing direct customer support access.
 * Complies with Hayroo design system:
 * - Emerald green brand primary (#047857)
 * - 6px rounded corners (4-8px rule, no pill shapes)
 * - Clean SVG WhatsApp icon (no emoji)
 * - Accessible external link with clear screen reader text
 */
export default function FloatingContactButton() {
  const whatsappUrl = 'https://wa.me/919876543210?text=Hi%20Hayroo%20Support,%20I%20have%20an%20inquiry';

  return (
    <aside aria-label="Quick contact" className="fixed bottom-6 left-6 z-40">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact Hayroo customer care on WhatsApp"
        title="Chat with Hayroo Support on WhatsApp"
        className="group inline-flex items-center gap-2.5 px-3.5 py-2.5 rounded-md bg-[#047857] text-[#FFFFFF] font-semibold text-xs border border-[#065F46] shadow-md hover:bg-[#065F46] active:translate-y-0.5 focus-visible:outline-2 focus-visible:outline-[#047857] focus-visible:outline-offset-2 transition-all duration-150"
      >
        {/* WhatsApp Brand SVG Icon */}
        <svg
          className="w-4 h-4 fill-current shrink-0"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M17.472 14.382c-.301-.15-1.78-.879-2.056-.98-.276-.101-.476-.15-.677.15-.2.301-.777.98-.953 1.18-.175.201-.351.226-.652.076-.301-.151-1.27-.468-2.42-1.493-.894-.799-1.498-1.785-1.674-2.086-.175-.301-.019-.464.132-.614.136-.135.301-.351.451-.527.151-.175.201-.301.301-.502.1-.201.05-.376-.025-.527-.075-.15-677-1.631-.928-2.233-.244-.585-.493-.506-.677-.515-.175-.009-.376-.009-.576-.009s-.527.075-.803.376c-.276.301-1.053 1.028-1.053 2.508 0 1.48 1.078 2.909 1.229 3.11.15.2 2.122 3.24 5.141 4.544.718.31 1.279.496 1.716.634.721.23 1.378.197 1.9.119.58-.088 1.78-.727 2.03-1.43.25-.703.25-1.305.175-1.43-.075-.125-.276-.201-.577-.351zM12.04 2C6.51 2 2.02 6.49 2.02 12.02c0 1.98.58 3.86 1.68 5.46L2 22l4.67-1.65c1.54 1.02 3.36 1.57 5.37 1.57 5.53 0 10.02-4.49 10.02-10.02C22.06 6.49 17.57 2 12.04 2zm0 18.23c-1.74 0-3.37-.5-4.77-1.42l-.34-.22-2.77.98.99-2.7-.24-.37c-1.01-1.55-1.57-3.37-1.57-5.26 0-4.66 3.79-8.45 8.45-8.45 4.66 0 8.45 3.79 8.45 8.45 0 4.66-3.79 8.45-8.45 8.45z" />
        </svg>
        <span className="hidden sm:inline">WhatsApp Support</span>
        <span className="sm:hidden">Support</span>
      </a>
    </aside>
  );
}
