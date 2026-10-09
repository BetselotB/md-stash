import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, Shield } from 'lucide-react';
import { MenuOverlay } from './MenuOverlay';

// Inline GitHub SVG icon
const GitHubIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
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
            ? 'bg-cream/95 text-ink shadow-sm backdrop-blur-md'
            : 'bg-sage/95 text-cream backdrop-blur-md'
        }`}
      >
        {/* Full-width container with ~1.7vw side padding */}
        <div
          className="relative w-full flex items-center justify-between"
          style={{
            paddingLeft: 'clamp(16px, 1.7vw, 44px)',
            paddingRight: 'clamp(16px, 1.7vw, 44px)',
            height: 'clamp(72px, 5.5vw, 140px)',
          }}
        >
          {/* ================= ZONE 1: LEFT ================= */}
          <div className="flex items-center gap-[clamp(10px,0.8vw,20px)] shrink-0 z-10">
            <Link
              to="/"
              onClick={scrollToTop}
              className={`font-display text-[clamp(14px,1.1vw,28px)] transition-colors hover:text-orange ${
                isCream ? 'text-ink' : 'text-cream'
              }`}
            >
              Home
            </Link>

            {/* Social & Utility Row: Thin outlined circles ~2.7vw diameter */}
            <div className="flex items-center gap-[clamp(6px,0.6vw,16px)]">
              {/* GitHub Link */}
              <a
                href="https://github.com/Jole-19/MDstash"
                target="_blank"
                rel="noopener noreferrer"
                title="GitHub repository"
                aria-label="GitHub repository"
                className={`rounded-full border flex items-center justify-center transition-colors cursor-pointer hover:border-orange hover:text-orange ${
                  isCream
                    ? 'border-line-ink text-ink bg-cream/40'
                    : 'border-line text-cream bg-transparent'
                }`}
                style={{
                  width: 'clamp(38px, 2.7vw, 70px)',
                  height: 'clamp(38px, 2.7vw, 70px)',
                }}
              >
                <GitHubIcon className="w-[clamp(16px,1vw,26px)] h-[clamp(16px,1vw,26px)]" />
              </a>

              {/* Back to top arrow circle */}
              <button
                type="button"
                onClick={scrollToTop}
                title="Back to top"
                aria-label="Scroll back to top"
                className={`rounded-full border flex items-center justify-center transition-colors cursor-pointer hover:border-orange hover:text-orange ${
                  isCream
                    ? 'border-line-ink text-ink bg-cream/40'
                    : 'border-line text-cream bg-transparent'
                }`}
                style={{
                  width: 'clamp(38px, 2.7vw, 70px)',
                  height: 'clamp(38px, 2.7vw, 70px)',
                }}
              >
                <ArrowUp className="w-[clamp(16px,1vw,26px)] h-[clamp(16px,1vw,26px)]" />
              </button>
            </div>
          </div>

          {/* ================= TWO THIN RULES (Left and Right of Badge) ================= */}
          {/* Left rule: from left padding to badge's left edge */}
          <div
            className={`hidden md:block absolute h-[1px] transition-colors pointer-events-none ${
              isCream ? 'bg-ink/25' : 'bg-cream/30'
            }`}
            style={{
              top: 'clamp(36px, 2.75vw, 70px)',
              left: 'clamp(16px, 1.7vw, 44px)',
              width: 'calc(50% - clamp(16px, 1.7vw, 44px) - clamp(46px, 3.4vw, 88px))',
            }}
            aria-hidden="true"
          />

          {/* Right rule: from badge's right edge to right padding */}
          <div
            className={`hidden md:block absolute h-[1px] transition-colors pointer-events-none ${
              isCream ? 'bg-ink/25' : 'bg-cream/30'
            }`}
            style={{
              top: 'clamp(36px, 2.75vw, 70px)',
              right: 'clamp(16px, 1.7vw, 44px)',
              width: 'calc(50% - clamp(16px, 1.7vw, 44px) - clamp(46px, 3.4vw, 88px))',
            }}
            aria-hidden="true"
          />

          {/* ================= ZONE 2: CENTER (Hanging Framed Logo Badge) ================= */}
          <div className="absolute left-1/2 -translate-x-1/2 top-[clamp(8px,0.6vw,16px)] z-20">
            <Link
              to="/"
              onClick={scrollToTop}
              title="MDstash Home"
              aria-label="MDstash Home"
              className="group block relative select-none"
              style={{
                width: 'clamp(84px, 6vw, 155px)',
                height: 'clamp(94px, 6.8vw, 175px)',
              }}
            >
              {/* Double-line transparent frame (no dark filled box) */}
              <div
                className={`w-full h-full border rounded-sm p-[3px] transition-all group-hover:scale-105 ${
                  isCream ? 'border-ink/50 bg-transparent' : 'border-cream/50 bg-transparent'
                }`}
              >
                <div
                  className={`w-full h-full border rounded-[1px] flex flex-col items-center justify-center p-2 relative ${
                    isCream ? 'border-ink/35 text-ink' : 'border-cream/35 text-cream'
                  }`}
                >
                  {/* Crate Logo Mark */}
                  <img
                    src="/logo.svg"
                    alt="MDstash Crate Mark"
                    className="w-[clamp(26px,2vw,50px)] h-[clamp(26px,2vw,50px)] object-contain mb-1 transition-transform group-hover:-rotate-3"
                  />

                  {/* MDstash Wordmark */}
                  <span className="font-display text-[clamp(13px,1.05vw,26px)] leading-none tracking-tight">
                    MD<span className="text-orange">stash</span>
                  </span>

                  {/* Small notched ribbon tab at bottom edge reading "md" (hangs down below frame) */}
                  <div
                    data-testid="badge-tab"
                    className={`absolute -bottom-[clamp(10px,0.8vw,20px)] left-1/2 -translate-x-1/2 border px-2 py-0.5 rounded-b-[2px] transition-colors ${
                      isCream
                        ? 'border-ink/50 bg-cream text-ink'
                        : 'border-cream/50 bg-sage text-cream'
                    }`}
                  >
                    <span className="font-display text-[clamp(10px,0.7vw,16px)] tracking-wider block leading-none">
                      md
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* ================= ZONE 3: RIGHT ================= */}
          <div className="flex items-center gap-[clamp(10px,0.9vw,22px)] shrink-0 z-10 ml-auto">
            {/* "click the stash" note: two lines, tilted -8°, display font in cream (not orange, not mono) with hand-drawn underline */}
            <div className="hidden lg:flex flex-col items-center select-none relative -rotate-[8deg] pr-1">
              <span
                className={`font-display text-[clamp(13px,1.15vw,28px)] leading-[0.95] text-center tracking-tight transition-colors ${
                  isCream ? 'text-ink' : 'text-cream'
                }`}
              >
                click<br />the stash
              </span>
              {/* Hand-drawn small underline SVG */}
              <svg
                width="38"
                height="8"
                viewBox="0 0 38 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`mt-0.5 transition-colors ${isCream ? 'text-ink/60' : 'text-cream/80'}`}
                aria-hidden="true"
              >
                <path
                  d="M1 5.5C10 2.5 24 2 37 6"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Orange Pill: ~6.8vw x 2.7vw with label ~1.1vw in display font */}
            <Link to="/app" className="hidden sm:inline-block">
              <button
                type="button"
                className="bg-orange hover:bg-orange-deep text-forest font-display rounded-full transition-all duration-150 shadow-sm active:scale-95 cursor-pointer flex items-center justify-center text-center px-4"
                style={{
                  width: 'clamp(115px, 6.8vw, 175px)',
                  height: 'clamp(38px, 2.7vw, 70px)',
                  fontSize: 'clamp(13px, 1.1vw, 26px)',
                }}
              >
                Open MDstash
              </button>
            </Link>

            {/* Right circle: shield/lock icon linking to /privacy (~2.7vw diameter) */}
            <Link
              to="/privacy"
              title="Privacy policy"
              aria-label="Privacy policy"
              className={`hidden sm:flex rounded-full border items-center justify-center transition-colors cursor-pointer hover:border-orange hover:text-orange ${
                isCream
                  ? 'border-line-ink text-ink bg-cream/40'
                  : 'border-line text-cream bg-transparent'
              }`}
              style={{
                width: 'clamp(38px, 2.7vw, 70px)',
                height: 'clamp(38px, 2.7vw, 70px)',
              }}
            >
              <Shield className="w-[clamp(16px,1vw,26px)] h-[clamp(16px,1vw,26px)]" />
            </Link>

            {/* "Menu" label + Hamburger button with thicker strokes */}
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={isMenuOpen}
              aria-label="Open menu"
              className={`flex items-center gap-[clamp(6px,0.5vw,12px)] px-[clamp(12px,0.9vw,22px)] rounded-full border font-display transition-all cursor-pointer hover:border-orange hover:text-orange ${
                isCream
                  ? 'border-line-ink text-ink hover:bg-cream-dim/60'
                  : 'border-line text-cream hover:bg-forest/50'
              }`}
              style={{
                height: 'clamp(38px, 2.7vw, 70px)',
                fontSize: 'clamp(13px, 1.1vw, 26px)',
                minWidth: '44px',
                minHeight: '44px',
              }}
            >
              <span>Menu</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-[clamp(16px,1.1vw,28px)] h-[clamp(16px,1.1vw,28px)]"
                aria-hidden="true"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
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
