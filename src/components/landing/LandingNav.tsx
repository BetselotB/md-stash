import React, { useState, useEffect } from 'react';
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

// Rebuilt Nav Badge in Brew District reference style
export const BrewDistrictBadge: React.FC<{ isCream?: boolean }> = () => {
  return (
    <svg
      viewBox="0 0 100 114"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full overflow-visible"
      aria-hidden="true"
    >
      {/* Outer Frame: Solid outline frame, stroke ~4% (4px) */}
      <rect
        x="4"
        y="4"
        width="92"
        height="92"
        stroke="currentColor"
        strokeWidth="4"
        fill="transparent"
      />

      {/* Top Thin Horizontal Bar */}
      <line
        x1="12"
        y1="13"
        x2="88"
        y2="13"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      {/* First Word: "MD" very large and heavy, condensed spanning inner width */}
      <text
        x="50"
        y="48"
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize="38"
        fontWeight="900"
        fill="currentColor"
        letterSpacing="-0.02em"
      >
        MD
      </text>

      {/* Center Divider Bar (at 54% of badge frame, lines up with nav rules) */}
      <line
        x1="12"
        y1="54"
        x2="88"
        y2="54"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      {/* Second Word: "stash" in lowercase, justified to span exact same inner width */}
      <text
        x="50"
        y="78"
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize="23"
        fontWeight="700"
        fill="currentColor"
        textLength="74"
        lengthAdjust="spacingAndGlyphs"
      >
        stash
      </text>

      {/* Bottom Thin Bar */}
      <line
        x1="12"
        y1="85"
        x2="88"
        y2="85"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      {/* Centered Swallowtail Ribbon Tab on bottom edge with cutout "26" */}
      <polygon
        data-testid="badge-tab"
        points="35,88 65,88 65,112 50,103 35,112"
        fill="currentColor"
      />
      <text
        x="50"
        y="102"
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize="13"
        fontWeight="bold"
        fill="var(--surface)"
        className="badge-numeral"
      >
        26
      </text>
    </svg>
  );
};

interface LandingNavProps {
  theme?: 'sage' | 'cream';
  onNavigateSection?: (id: string) => void;
}

export const LandingNav: React.FC<LandingNavProps> = ({
  theme = 'sage',
  onNavigateSection,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = React.useRef<HTMLElement>(null);

  // Scroll listener via GSAP ticker: updates data-scrolled directly with ZERO React re-renders
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    let scrolled = false;
    const checkScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      const next = (!scrolled && y > 24) ? true : (scrolled && y < 8 ? false : scrolled);
      if (next !== scrolled) {
        scrolled = next;
        nav.setAttribute('data-scrolled', scrolled ? 'true' : 'false');
      }

      // Check sections declaring data-nav-theme at nav's vertical center line
      const sections = document.querySelectorAll<HTMLElement>('[data-nav-theme]');
      if (sections.length > 0) {
        const glassEl = nav.querySelector('.nav-glass') as HTMLElement | null;
        const navRect = nav.getBoundingClientRect();
        const navCenterY = navRect.top + (glassEl?.offsetHeight || 60) / 2;
        let activeTheme: 'sage' | 'cream' = 'sage';

        for (let i = 0; i < sections.length; i++) {
          const rect = sections[i].getBoundingClientRect();
          if (rect.top <= navCenterY && rect.bottom > navCenterY) {
            activeTheme = (sections[i].getAttribute('data-nav-theme') as 'sage' | 'cream') || 'sage';
            break;
          }
        }

        if (nav.getAttribute('data-theme') !== activeTheme) {
          nav.setAttribute('data-theme', activeTheme);
        }
      }
    };

    import('gsap').then(({ default: gsap }) => {
      gsap.ticker.add(checkScroll);
    });
    checkScroll();

    return () => {
      import('gsap').then(({ default: gsap }) => {
        gsap.ticker.remove(checkScroll);
      });
    };
  }, []);

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
        ref={navRef}
        aria-label="Main"
        data-testid="landing-nav"
        data-theme={theme}
        data-scrolled="false"
        className="fixed top-0 left-0 right-0 z-40 pointer-events-none"
      >
        {/* ================= FROSTED GLASS BAR SIBLING ================= */}
        {/* Direct child of fixed container, no backdrop-root ancestors */}
        <div
          data-testid="nav-glass-bar"
          className="nav-glass absolute top-0 left-0 right-0 pointer-events-auto transition-opacity duration-250 opacity-0"
          style={{
            height: 'clamp(68px, 5.2vw, 110px)',
          }}
        />

        <div
          className="absolute left-1/2 -translate-x-1/2 z-20 nav-badge pointer-events-auto"
          style={{
            top: 'clamp(8px, 1.1vw, 28px)',
            width: 'clamp(52px, 5.9vw, 150px)',
            height: 'calc(clamp(52px, 5.9vw, 150px) * 1.14)',
            transformOrigin: 'top center',
            transition: 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1), opacity 300ms ease',
          }}
        >
          <Link
            to="/"
            onClick={scrollToTop}
            title="MDstash home"
            aria-label="MDstash home"
            className="group block relative w-full h-full select-none cursor-pointer"
          >
            <BrewDistrictBadge isCream={isCream} />
          </Link>
        </div>

        {/* ================= NAV ITEMS ROW ================= */}
        {/* Full-width container with ~1.7vw side padding */}
        <div
          className="relative w-full flex items-center justify-between pointer-events-auto"
          style={{
            paddingLeft: 'clamp(16px, 1.7vw, 44px)',
            paddingRight: 'clamp(16px, 1.7vw, 44px)',
            height: 'calc(clamp(8px, 1.1vw, 28px) + clamp(52px, 5.9vw, 150px) * 0.54)',
          }}
        >
          {/* ================= ZONE 1: LEFT ================= */}
          <div className="flex items-center gap-[clamp(10px,0.8vw,20px)] shrink-0 z-10 nav-left">
            <Link
              to="/"
              onClick={scrollToTop}
              className="font-display text-[clamp(14px,1.1vw,28px)] transition-colors hover:text-orange"
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
                className="nav-github-link rounded-full border flex items-center justify-center transition-colors cursor-pointer hover:border-orange hover:text-orange"
                style={{
                  width: 'clamp(34px, 2.5vw, 64px)',
                  height: 'clamp(34px, 2.5vw, 64px)',
                }}
              >
                <GitHubIcon className="w-[clamp(21px,1.4vw,34px)] h-[clamp(21px,1.4vw,34px)]" />
              </a>

              {/* Back to top arrow circle */}
              <button
                type="button"
                onClick={scrollToTop}
                title="Back to top"
                aria-label="Scroll back to top"
                className="nav-top-btn hidden sm:flex rounded-full border items-center justify-center transition-colors cursor-pointer hover:border-orange hover:text-orange"
                style={{
                  width: 'clamp(34px, 2.5vw, 64px)',
                  height: 'clamp(34px, 2.5vw, 64px)',
                }}
              >
                <ArrowUp className="w-[clamp(21px,1.4vw,34px)] h-[clamp(21px,1.4vw,34px)]" />
              </button>
            </div>
          </div>

          {/* ================= ZONE 3: RIGHT ================= */}
          <div className="flex items-center gap-[clamp(10px,0.9vw,22px)] shrink-0 z-10 ml-auto nav-right">
            {/* Orange Pill: single-line 'Open MDstash', white-space: nowrap, no fixed width */}
            <Link to="/app" className="hidden sm:inline-block">
              <button
                type="button"
                className="bg-orange hover:bg-orange-deep text-forest font-display rounded-full transition-all duration-150 shadow-sm active:scale-95 cursor-pointer flex items-center justify-center text-center whitespace-nowrap px-[clamp(16px,1.6vw,32px)]"
                style={{
                  height: 'clamp(36px, 2.5vw, 64px)',
                  fontSize: 'clamp(13px, 1.05vw, 24px)',
                }}
              >
                Open MDstash
              </button>
            </Link>

            {/* Right circle: shield/lock icon linking to /privacy */}
            <Link
              to="/privacy"
              title="Privacy policy"
              aria-label="Privacy policy"
              className="nav-privacy-btn hidden sm:flex rounded-full border items-center justify-center transition-colors cursor-pointer hover:border-orange hover:text-orange"
              style={{
                width: 'clamp(34px, 2.5vw, 64px)',
                height: 'clamp(34px, 2.5vw, 64px)',
              }}
            >
              <Shield className="w-[clamp(21px,1.4vw,34px)] h-[clamp(21px,1.4vw,34px)]" />
            </Link>

            {/* Menu Trigger Button */}
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              title="Open navigation menu"
              aria-label="Open navigation menu"
              className="nav-menu-btn rounded-full border flex items-center justify-center gap-1.5 transition-colors cursor-pointer hover:border-orange hover:text-orange px-[clamp(12px,1vw,20px)]"
              style={{
                height: 'clamp(36px, 2.5vw, 64px)',
                fontSize: 'clamp(13px, 1vw, 22px)',
              }}
            >
              <span className="font-display">Menu</span>
              <span className="font-mono text-xs opacity-75">≡</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Fullscreen Mobile/Desktop Menu Drawer */}
      <MenuOverlay
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigateSection={handleSectionClick}
      />
    </>
  );
};
