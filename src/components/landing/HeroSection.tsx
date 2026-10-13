import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDown, RefreshCw } from 'lucide-react';
import { CrateLogo } from '../ui/CrateLogo';

interface HeroSectionProps {
  onScrollNext?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onScrollNext }) => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [isDropping, setIsDropping] = useState(false);
  const [isTabHovered, setIsTabHovered] = useState(false);
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);
  const [canScroll, setCanScroll] = useState(true);

  // Check prefers-reduced-motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);

  // Track scroll position to fade out scroll cue past 80px
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      setIsScrolledPastHero(y > 80);
    };

    const checkCanScroll = () => {
      const sh = document.documentElement.scrollHeight;
      if (!sh) {
        setCanScroll(true);
        return;
      }
      const isScrollable = sh > window.innerHeight + 40;
      setCanScroll(isScrollable);
    };

    handleScroll();
    checkCanScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', checkCanScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkCanScroll);
    };
  }, []);

  // Trigger file drop into crate then navigate to /app
  const handleStashClick = () => {
    if (isDropping) return;
    if (prefersReducedMotion) {
      navigate('/app');
      return;
    }
    setIsDropping(true);
    setTimeout(() => {
      navigate('/app');
    }, 480);
  };

  const handleScrollCueClick = () => {
    const win = window as unknown as {
      lenis?: { scrollTo: (target: string, opts?: { duration?: number; offset?: number }) => void };
    };
    if (win.lenis && typeof win.lenis.scrollTo === 'function') {
      win.lenis.scrollTo('#cream-curtain', { duration: 1.2, offset: -60 });
    } else if (onScrollNext) {
      onScrollNext();
    } else {
      const el = document.querySelector('#cream-curtain') || document.querySelector('#how-it-works');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={heroRef}
      className="relative min-h-[calc(100vh-clamp(72px,5.5vw,140px))] w-full max-w-[2560px] mx-auto px-[clamp(16px,1.7vw,44px)] pt-2 pb-0 flex flex-col justify-between items-center text-center select-none overflow-visible"
    >
      {/* ================= FIXED RIGHT-EDGE PROTRUDING ORANGE TAB ================= */}
      <div className="hero-right-tab fixed right-0 top-1/2 -translate-y-1/2 z-30 hidden md:block">
        <button
          type="button"
          onClick={handleStashClick}
          onMouseEnter={() => setIsTabHovered(true)}
          onMouseLeave={() => setIsTabHovered(false)}
          title="Open MDstash"
          aria-label="Open MDstash"
          className="group relative flex items-center bg-orange hover:bg-orange-deep text-forest transition-all duration-300 cursor-pointer shadow-lg rounded-l-full overflow-hidden"
          style={{
            height: 'clamp(120px, 12.4vw, 318px)',
            width: isTabHovered ? 'clamp(170px, 12vw, 300px)' : 'clamp(56px, 5vw, 128px)',
            paddingLeft: 'clamp(12px, 1vw, 24px)',
            paddingRight: 'clamp(8px, 0.6vw, 16px)',
          }}
        >
          <div className="flex flex-col items-center justify-center gap-2 shrink-0">
            {/* Recolorable Crate Logo: Green crate body in --forest, doc & # in --cream */}
            <CrateLogo
              className={`object-contain transition-transform duration-200 ${
                isTabHovered ? 'scale-110 -rotate-6' : ''
              }`}
              style={{
                width: 'clamp(34px, 3.5vw, 90px)',
                height: 'clamp(34px, 3.5vw, 90px)',
                // @ts-expect-error CSS variable overrides
                '--logo-body': 'var(--forest)',
                '--logo-doc': 'var(--cream)',
                '--logo-mark': 'var(--cream)',
              }}
            />
            {/* Small circular rotate/drag arrows glyph in --ink */}
            <RefreshCw
              strokeWidth={2.5}
              className="transition-transform group-hover:rotate-180 duration-500"
              style={{
                width: 'clamp(14px, 1.2vw, 28px)',
                height: 'clamp(14px, 1.2vw, 28px)',
                color: 'var(--ink)',
              }}
              aria-hidden="true"
            />
          </div>
          {/* Revealed label on hover */}
          {isTabHovered && (
            <span className="font-display text-forest text-[clamp(14px,1.1vw,28px)] ml-3 whitespace-nowrap animate-fadeIn leading-tight">
              Open the stash
            </span>
          )}
        </button>
      </div>

      {/* ================= ASTERISK SHAPE & CAPTION IN RING BADGE'S OLD PLACE ================= */}
      {/* Centered where the ring badge's center was: about 6vw from left edge and about 76% down the first viewport */}
      <div
        className="hero-asterisk-group absolute z-20 flex items-center gap-[clamp(8px,0.8vw,20px)] text-left pointer-events-auto"
        style={{
          left: 'clamp(20px, 6vw, 154px)',
          top: '76%',
          transform: 'translateY(-50%)',
        }}
      >
        <div
          className={`hero-motif-left transition-transform duration-300 ${prefersReducedMotion ? '' : 'animate-spin-slow'}`}
          style={{
            width: 'clamp(44px, 7vw, 180px)',
            height: 'clamp(44px, 7vw, 180px)',
          }}
        >
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full text-orange drop-shadow-md"
            fill="currentColor"
            aria-label="Markdown asterisk motif"
          >
            <g transform="translate(50,50)">
              <rect x="-9" y="-46" width="18" height="92" rx="9" fill="var(--orange)" />
              <rect x="-9" y="-46" width="18" height="92" rx="9" transform="rotate(60)" fill="var(--orange)" />
              <rect x="-9" y="-46" width="18" height="92" rx="9" transform="rotate(120)" fill="var(--orange)" />
            </g>
          </svg>
        </div>
        <div
          className="hero-caption-left font-display text-cream leading-tight hidden sm:block"
          style={{
            fontSize: 'clamp(11px, 0.9vw, 23px)',
          }}
        >
          <span className="block">Zero cloud</span>
          <span className="block opacity-85">zero servers</span>
        </div>
      </div>

      {/* ================= HERO CENTER STAGE: HEADLINE ================= */}
      <div className="hero-stage relative w-full max-w-[85vw] my-auto flex flex-col items-center justify-center z-10 py-2">
        {/* Headline: 3 lines on desktop, font-size reduced ~8% to target ~68% width at 2560 */}
        <h1
          aria-label="Your components, stashed, sorted, ready for any agent."
          className="hero-headline font-display text-cream select-none text-shadow-stamp text-center"
          style={{
            fontSize: 'min(clamp(31px, 8.5vw, 222px), clamp(31px, 15.2vh, 222px))',
            lineHeight: '0.95',
            letterSpacing: '-0.02em',
          }}
        >
          {/* LINE 1 */}
          <span
            className="hero-line hero-line-1 block whitespace-normal sm:whitespace-nowrap"
            style={{
              overflow: 'hidden',
              padding: '0.12em 0.35em 0.35em 0.35em',
              margin: '-0.12em -0.35em -0.35em -0.35em',
            }}
          >
            <span className="hero-line-inner inline-block" aria-hidden="true">
              Your{' '}
              <mark className="hl hl-markdown text-inherit bg-transparent relative inline-block">
                <span
                  className="hl-bg absolute bg-orange rounded-[0.18em] -rotate-[0.6deg] origin-left pointer-events-none"
                  style={{ width: '0%' }}
                  aria-hidden="true"
                />
                <span
                  className="hl-caret absolute top-[6%] w-[0.06em] h-[0.9em] bg-cream opacity-0 pointer-events-none z-20"
                  style={{ left: '0%' }}
                  aria-hidden="true"
                />
                <span className="hl-text relative z-10 transition-colors duration-200">
                  {'components'.split('').map((char, i) => (
                    <span key={i} className="hl-char inline-block" data-char={char}>
                      {char}
                    </span>
                  ))}
                </span>
              </mark>
              ,
            </span>
          </span>

          {/* LINE 2 */}
          <span
            className="hero-line hero-line-2 block whitespace-normal sm:whitespace-nowrap mt-[clamp(2px,0.5vw,10px)]"
            style={{
              overflow: 'hidden',
              padding: '0.12em 0.35em 0.35em 0.35em',
              margin: '-0.12em -0.35em -0.35em -0.35em',
            }}
          >
            <span className="hero-line-inner inline-block" aria-hidden="true">
              stashed, sorted,
            </span>
          </span>

          {/* LINE 3 */}
          <span
            className="hero-line hero-line-3 block whitespace-normal sm:whitespace-nowrap mt-[clamp(2px,0.5vw,10px)]"
            style={{
              overflow: 'hidden',
              padding: '0.12em 0.35em 0.35em 0.35em',
              margin: '-0.12em -0.35em -0.35em -0.35em',
            }}
          >
            <span className="hero-line-inner inline-block" aria-hidden="true">
              <mark className="hl hl-ready text-inherit bg-transparent relative inline-block">
                <span
                  className="hl-bg absolute bg-orange rounded-[0.18em] -rotate-[0.6deg] origin-left pointer-events-none"
                  style={{ width: '0%' }}
                  aria-hidden="true"
                />
                <span
                  className="hl-caret absolute top-[6%] w-[0.06em] h-[0.9em] bg-cream opacity-0 pointer-events-none z-20"
                  style={{ left: '0%' }}
                  aria-hidden="true"
                />
                <span className="hl-text relative z-10 transition-colors duration-200">
                  {'ready for any agent.'.split('').map((char, i) => (
                    <span key={i} className="hl-char inline-block" data-char={char}>
                      {char === ' ' ? '\u00A0' : char}
                    </span>
                  ))}
                </span>
              </mark>
            </span>
          </span>
        </h1>
      </div>

      {/* ================= BOTTOM CENTER CRATE INSIDE DASHED ARCH OUTLINE ================= */}
      <div
        className="hero-crate-container relative z-10 flex flex-col items-center justify-end overflow-visible"
        style={{
          marginTop: 'auto',
          marginBottom: 'calc(clamp(14px, 2.2vh, 40px) + clamp(44px, 2.7vw, 70px) + clamp(18px, 1.4vw, 36px))',
        }}
      >
        {/* Dashed arch outline with legs ending safely above the scroll cue */}
        <div
          className="relative flex flex-col items-center justify-end cursor-pointer group"
          style={{
            width: 'clamp(180px, 13vw, 340px)',
            height: 'clamp(90px, 7vw, 170px)',
          }}
          onClick={handleStashClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleStashClick();
            }
          }}
          aria-label="Interactive MDstash crate. Click to open application"
          title="Click to drop into crate and open MDstash"
        >
          {/* SVG Dashed Arch outline with shortened legs and soft fade-out */}
          <svg
            className="hero-crate-arch absolute inset-0 w-full h-full pointer-events-none overflow-visible"
            viewBox="0 0 200 100"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="archFade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--cream)" stopOpacity="0.35" />
                <stop offset="70%" stopColor="var(--cream)" stopOpacity="0.35" />
                <stop offset="100%" stopColor="var(--cream)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              className="hero-crate-arch-path"
              d="M 2 85 L 2 45 A 98 45 0 0 1 198 45 L 198 85"
              fill="none"
              stroke="url(#archFade)"
              strokeWidth="2"
              strokeDasharray="6 6"
              style={{ strokeDashoffset: 0 }}
            />
          </svg>

          {/* File card pops up out of crate on hover */}
          <div
            className={`absolute left-1/2 -translate-x-1/2 z-20 bg-cream rounded-lg border-2 border-orange shadow-card flex flex-col p-2 gap-1 transition-all duration-300 pointer-events-none ${
              isHovered && !isDropping
                ? '-top-12 opacity-100 scale-100'
                : 'top-2 opacity-0 scale-75'
            }`}
            style={{
              width: 'clamp(54px, 4vw, 100px)',
              height: 'clamp(70px, 5.2vw, 130px)',
            }}
          >
            <div className="h-2 w-8 bg-orange rounded" />
            <div className="h-1.5 w-full bg-forest/30 rounded mt-1" />
            <div className="h-1.5 w-3/4 bg-forest/30 rounded" />
            <div className="h-1.5 w-5/6 bg-forest/30 rounded" />
          </div>

          {/* Animated dropping card on click */}
          {isDropping && (
            <div
              className="absolute left-1/2 -translate-x-1/2 z-20 bg-cream rounded-lg border-2 border-orange shadow-card flex flex-col p-2 gap-1 animate-slideDown"
              style={{
                width: 'clamp(54px, 4vw, 100px)',
                height: 'clamp(70px, 5.2vw, 130px)',
                animation: 'dropIntoCrate 450ms cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
              }}
            >
              <div className="h-2 w-8 bg-orange rounded" />
              <div className="h-1.5 w-full bg-forest/30 rounded" />
              <div className="h-1.5 w-3/4 bg-forest/30 rounded" />
            </div>
          )}

          {/* Crate image with gentle float */}
          <div className={`hero-crate ${prefersReducedMotion ? '' : 'animate-bob'}`}>
            <img
              src="/logo.svg"
              alt="MDstash Crate Logo"
              className="object-contain drop-shadow-[0_12px_24px_rgba(25,32,28,0.5)] group-hover:scale-105 transition-transform duration-200"
              style={{
                width: 'clamp(150px, 11vw, 280px)',
                height: 'auto',
              }}
            />
          </div>
        </div>
      </div>

      {/* ================= DOWNWARD SCROLL CUE AT BOTTOM CENTER ================= */}
      {canScroll && (
        <div
          className="hero-scroll-cue absolute z-30 left-1/2 -translate-x-1/2 transition-opacity duration-300"
          style={{
            bottom: 'clamp(14px, 2.2vh, 40px)',
            opacity: isScrolledPastHero ? 0 : 1,
            pointerEvents: isScrolledPastHero ? 'none' : 'auto',
          }}
        >
          <button
            type="button"
            onClick={handleScrollCueClick}
            aria-label="Scroll down"
            title="Scroll down"
            className="group relative flex items-center justify-center rounded-full border border-cream/70 hover:border-orange text-cream hover:text-orange bg-transparent transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange"
            style={{
              width: 'clamp(44px, 2.7vw, 70px)',
              height: 'clamp(44px, 2.7vw, 70px)',
            }}
          >
            {/* Subtle outward rippling ring */}
            <span
              className={`absolute inset-0 rounded-full border border-cream/50 pointer-events-none ${
                prefersReducedMotion ? 'hidden' : 'animate-cue-ripple'
              }`}
              aria-hidden="true"
            />
            {/* Thin down arrow gently bobbing */}
            <ArrowDown
              className={`w-[clamp(18px,1.2vw,32px)] h-[clamp(18px,1.2vw,32px)] transition-colors ${
                prefersReducedMotion ? '' : 'animate-arrow-bob'
              }`}
              strokeWidth={1.75}
              aria-hidden="true"
            />
          </button>
        </div>
      )}

      {/* ================= BOTTOM BAR: BOTTOM-LEFT IS EMPTY, BOTTOM-RIGHT HAS PROMPT MARK ================= */}
      <div
        className="w-full flex items-end justify-end z-10 pointer-events-none"
        style={{
          marginTop: '-clamp(20px, 2vw, 44px)',
          paddingBottom: 'clamp(22px, 3vh, 48px)',
        }}
      >
        {/* Bottom Right: Chunky solid orange >_ prompt mark (wider underscore, aligned with nav right) */}
        <div className="flex items-center gap-[clamp(8px,0.8vw,20px)] text-right pointer-events-auto">
          <div
            className="hero-caption-right font-display text-cream leading-tight hidden sm:block"
            style={{
              fontSize: 'clamp(11px, 0.9vw, 23px)',
            }}
          >
            <span className="block">Works offline</span>
            <span className="block opacity-85">stored in your browser</span>
          </div>
          <div
            className="hero-motif-right transition-transform duration-300"
            style={{
              width: 'clamp(66px, 10.3vw, 262px)',
              height: 'clamp(38px, 5.8vw, 148px)',
              transform: 'rotate(6deg)',
              transformOrigin: 'right bottom',
            }}
          >
            <svg
              viewBox="0 0 180 100"
              className="w-full h-full drop-shadow-md"
              fill="none"
              aria-label="Markdown prompt motif"
            >
              {/* Chunky > blockquote chevron */}
              <path
                d="M12 18 L68 50 L12 82 L26 94 L94 50 L26 6 Z"
                fill="var(--orange)"
              />
              {/* Chunky _ cursor underscore (about 2x wider) */}
              <rect
                x="98"
                y="74"
                width="76"
                height="16"
                rx="4"
                fill="var(--orange)"
                className={prefersReducedMotion ? '' : 'animate-pulse'}
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};
