import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, Menu } from 'lucide-react';
import { Button } from '../ui/Button';
import { MenuOverlay } from './MenuOverlay';

// Inline GitHub SVG icon
const GitHubIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

interface LandingNavProps {
  theme?: 'sage' | 'cream';
  onNavigateSection?: (id: string) => void;
}

export const LandingNav: React.FC<LandingNavProps> = ({
  theme = 'sage',
  onNavigateSection,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSectionClick = (sectionId: string) => {
    if (onNavigateSection) {
      onNavigateSection(sectionId);
    } else {
      const el = document.querySelector(sectionId);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isCream = theme === 'cream';

  return (
    <>
      <nav
        aria-label="Main"
        className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-300 ${
          isCream
            ? 'bg-cream/90 text-ink border-b border-line-ink shadow-sm backdrop-blur-md'
            : 'bg-sage/90 text-cream border-b border-line backdrop-blur-md'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
          {/* ================= ZONE 1: LEFT ================= */}
          <div className="flex items-center gap-3 md:gap-5 shrink-0">
            {/* Mobile balance spacer */}
            <div className="sm:hidden w-8" aria-hidden="true" />
            <Link
              to="/"
              onClick={scrollToTop}
              className={`hidden sm:inline-block text-xs md:text-sm font-bold tracking-tight transition-colors hover:text-orange ${
                isCream ? 'text-ink' : 'text-cream'
              }`}
            >
              Home
            </Link>

            {/* Social & Utility Row */}
            <div className="hidden sm:flex items-center gap-2">
              {/* GitHub Link */}
              <a
                href="https://github.com/Jole-19/MDstash"
                target="_blank"
                rel="noopener noreferrer"
                title="GitHub repository"
                aria-label="GitHub repository"
                className={`w-7 h-7 rounded-full border flex items-center justify-center transition-colors cursor-pointer hover:border-orange hover:text-orange ${
                  isCream ? 'border-line-ink text-ink bg-cream-dim/30' : 'border-line text-cream bg-forest/30'
                }`}
              >
                <GitHubIcon className="w-3.5 h-3.5" />
              </a>

              {/* Back to top arrow */}
              <button
                type="button"
                onClick={scrollToTop}
                title="Back to top"
                aria-label="Scroll back to top"
                className={`w-7 h-7 rounded-full border flex items-center justify-center transition-colors cursor-pointer hover:border-orange hover:text-orange ${
                  isCream ? 'border-line-ink text-ink bg-cream-dim/30' : 'border-line text-cream bg-forest/30'
                }`}
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Thin Horizontal Rule: Left to Center */}
          <div
            className={`hidden md:block flex-1 h-[1px] mx-4 transition-colors ${
              isCream ? 'bg-ink/20' : 'bg-cream/25'
            }`}
          />

          {/* ================= ZONE 2: CENTER (Framed Stamp Badge) ================= */}
          <Link
            to="/"
            onClick={scrollToTop}
            className={`group shrink-0 px-3.5 py-1.5 md:px-5 md:py-2 border rounded-sm flex items-center gap-2.5 transition-all shadow-stamp hover:scale-[1.02] ${
              isCream
                ? 'border-ink/40 bg-cream-dim/50 text-ink'
                : 'border-line bg-forest-dark/40 text-cream'
            }`}
            title="MDstash Home"
          >
            {/* Real Logo Mark */}
            <img
              src="/logo.svg"
              alt="MDstash Logo"
              className="w-5 h-5 md:w-6 md:h-6 object-contain shrink-0 group-hover:rotate-[-6deg] transition-transform"
            />

            <div className="flex flex-col items-start leading-none">
              <span className="font-display text-lg md:text-xl tracking-tight text-current">
                MD<span className="text-orange">stash</span>
              </span>
              <span
                className={`text-[8px] md:text-[9px] font-mono tracking-wider ${
                  isCream ? 'text-ink/70' : 'text-cream-dim/75'
                }`}
              >
                Local · Est. 2026
              </span>
            </div>
          </Link>

          {/* Thin Horizontal Rule: Center to Right */}
          <div
            className={`hidden md:block flex-1 h-[1px] mx-4 transition-colors ${
              isCream ? 'bg-ink/20' : 'bg-cream/25'
            }`}
          />

          {/* ================= ZONE 3: RIGHT ================= */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Handwritten-style Annotation: "click the stash" with curved arrow pointing toward hero logo */}
            <div className="hidden xl:flex items-center gap-1.5 relative select-none pr-1">
              <span className="font-mono italic text-[11px] text-orange tracking-tight font-semibold">
                click the stash
              </span>
              <svg
                width="28"
                height="22"
                viewBox="0 0 28 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-orange shrink-0 animate-pulse"
                aria-hidden="true"
              >
                <path
                  d="M2 3C8 2 18 4 18 14M18 14L13 10M18 14L22 9"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Orange "Open MDstash" Pill */}
            <Link to="/app" className="hidden sm:inline-block">
              <Button size="sm" variant="primary" pill>
                Open MDstash
              </Button>
            </Link>

            {/* Circular GitHub icon button */}
            <a
              href="https://github.com/Jole-19/MDstash"
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub repository"
              aria-label="GitHub repository"
              className={`hidden sm:flex w-8 h-8 rounded-full border items-center justify-center transition-colors cursor-pointer hover:border-orange hover:text-orange ${
                isCream ? 'border-line-ink text-ink bg-cream-dim/30' : 'border-line text-cream bg-forest/30'
              }`}
            >
              <GitHubIcon className="w-4 h-4" />
            </a>

            {/* Menu Label + Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={isMenuOpen}
              aria-label="Open menu"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer hover:border-orange hover:text-orange ${
                isCream
                  ? 'border-line-ink text-ink hover:bg-cream-dim/60'
                  : 'border-line text-cream hover:bg-forest/50'
              }`}
            >
              <span className="hidden xs:inline">Menu</span>
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Full-screen Overlay Menu */}
      <MenuOverlay
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigateSection={handleSectionClick}
      />
    </>
  );
};
