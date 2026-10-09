import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { X, ExternalLink, ArrowRight } from 'lucide-react';

interface MenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateSection: (sectionId: string) => void;
}

export const MenuOverlay: React.FC<MenuOverlayProps> = ({
  isOpen,
  onClose,
  onNavigateSection,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap & Escape listener
  useEffect(() => {
    if (!isOpen) return;

    // Save previous active element
    const previouslyFocused = document.activeElement as HTMLElement | null;

    // Focus close button on mount
    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && overlayRef.current) {
        const focusableElements = overlayRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      clearTimeout(timer);
      previouslyFocused?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation Menu"
      className="fixed inset-0 z-50 bg-forest/98 backdrop-blur-xl text-cream flex flex-col justify-between p-6 sm:p-12 md:p-16 animate-fadeIn selection:bg-orange selection:text-forest"
    >
      {/* Top Header of Overlay */}
      <div className="flex items-center justify-between border-b border-line pb-6">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="MDstash" className="w-8 h-8 object-contain" />
          <span className="font-display text-2xl text-cream">
            MD<span className="text-orange">stash</span>
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-forest-dark border border-line text-cream-dim">
            Menu
          </span>
        </div>

        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close navigation menu"
          className="p-2.5 rounded-full bg-forest-dark border border-line text-cream hover:text-orange hover:border-orange transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Navigation Links */}
      <nav className="my-auto py-8 flex flex-col gap-4 sm:gap-6 max-w-2xl">
        <button
          type="button"
          onClick={() => {
            onNavigateSection('#how-it-works');
            onClose();
          }}
          className="group flex items-center justify-between text-left font-display text-4xl sm:text-6xl text-cream hover:text-orange transition-colors py-2 border-b border-line/40 cursor-pointer"
        >
          <span>How it works</span>
          <ArrowRight className="w-6 h-6 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-orange" />
        </button>

        <button
          type="button"
          onClick={() => {
            onNavigateSection('#features');
            onClose();
          }}
          className="group flex items-center justify-between text-left font-display text-4xl sm:text-6xl text-cream hover:text-orange transition-colors py-2 border-b border-line/40 cursor-pointer"
        >
          <span>Features</span>
          <ArrowRight className="w-6 h-6 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-orange" />
        </button>

        <Link
          to="/privacy"
          onClick={onClose}
          className="group flex items-center justify-between text-left font-display text-4xl sm:text-6xl text-cream hover:text-orange transition-colors py-2 border-b border-line/40"
        >
          <span>Privacy</span>
          <ArrowRight className="w-6 h-6 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-orange" />
        </Link>

        <Link
          to="/app"
          onClick={onClose}
          className="group flex items-center justify-between text-left font-display text-4xl sm:text-6xl text-orange hover:text-orange-deep transition-colors py-2 border-b border-line/40"
        >
          <span>Open MDstash</span>
          <ArrowRight className="w-6 h-6 -translate-x-2 group-hover:translate-x-0 transition-all text-orange" />
        </Link>

        <a
          href="https://github.com/Jole-19/MDstash"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-between text-left font-display text-3xl sm:text-4xl text-cream-dim hover:text-cream transition-colors py-2"
        >
          <span className="flex items-center gap-3">
            GitHub Repository
            <ExternalLink className="w-4 h-4 text-cream-dim group-hover:text-orange" />
          </span>
        </a>
      </nav>

      {/* Bottom Footer Info */}
      <div className="pt-6 border-t border-line flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-display text-cream-dim">
        <div className="flex items-center gap-2">
          <span className="text-orange">●</span>
          <span>Zero cloud · 100% local-first markdown organizer</span>
        </div>
        <div>
          <span>Press <kbd className="px-1.5 py-0.5 rounded bg-forest-dark border border-line text-cream font-mono">Esc</kbd> to close</span>
        </div>
      </div>
    </div>
  );
};
