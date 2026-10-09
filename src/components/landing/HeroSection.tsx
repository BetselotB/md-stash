import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDown } from 'lucide-react';
import { StampBadge } from '../ui/StampBadge';

interface HeroSectionProps {
  onScrollNext?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onScrollNext }) => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [isDropping, setIsDropping] = useState(false);
  const [isTabHovered, setIsTabHovered] = useState(false);

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

  const handleScrollDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onScrollNext) {
      onScrollNext();
    } else {
      const el = document.querySelector('#how-it-works');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={heroRef}
      className="relative min-h-[calc(100vh-clamp(72px,5.5vw,140px))] w-full max-w-[2560px] mx-auto px-[clamp(16px,1.7vw,44px)] pt-2 pb-0 flex flex-col justify-between items-center text-center select-none overflow-hidden"
    >
      {/* ================= FIXED RIGHT-EDGE PROTRUDING ORANGE TAB ================= */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-30 hidden md:block">
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
            <img
              src="/logo.svg"
              alt="MDstash Crate"
              className={`object-contain transition-transform duration-200 ${
                isTabHovered ? 'scale-110 -rotate-6' : ''
              }`}
              style={{
                width: 'clamp(34px, 3.5vw, 90px)',
                height: 'clamp(34px, 3.5vw, 90px)',
              }}
            />
            {/* Small circular rotate/drag arrows glyph */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-forest transition-transform group-hover:rotate-180 duration-500"
              style={{
                width: 'clamp(14px, 1.2vw, 28px)',
                height: 'clamp(14px, 1.2vw, 28px)',
              }}
              aria-hidden="true"
            >
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 21h5v-5" />
            </svg>
          </div>
          {/* Revealed label on hover */}
          {isTabHovered && (
            <span className="font-display text-forest text-[clamp(14px,1.1vw,28px)] ml-3 whitespace-nowrap animate-fadeIn leading-tight">
              Open the stash
            </span>
          )}
        </button>
      </div>

      {/* ================= ROTATING CIRCULAR STAMP BADGE ================= */}
      {/* Positioned beside lower headline line: left ~6.3vw, vertically ~58% */}
      <div
        className="hero-badge absolute z-20 hidden md:block"
        style={{
          left: 'clamp(20px, 6.3vw, 160px)',
          top: '58%',
          transform: 'translateY(-50%)',
        }}
      >
        <button
          type="button"
          onClick={handleScrollDown}
          aria-label="Scroll to how it works"
          className="focus:outline-none focus:ring-2 focus:ring-orange rounded-full cursor-pointer hover:scale-105 transition-transform"
        >
          <StampBadge
            text="private & honest · local first · private & honest · local first · "
            size="clamp(140px, 7.8vw, 200px)"
            icon={<ArrowDown className="w-[clamp(18px,1.2vw,30px)] h-[clamp(18px,1.2vw,30px)] text-cream" />}
          />
        </button>
      </div>

      {/* ================= HERO CENTER STAGE: HEADLINE ================= */}
      <div className="hero-stage relative w-full max-w-[80vw] my-auto flex flex-col items-center justify-center z-10 py-2">
        {/* Headline: exactly 2 lines on desktop, font-size reduced by ~12% with clamp() */}
        <h1
          aria-label="Your markdown, stashed."
          className="font-display text-cream select-none text-shadow-stamp text-center"
          style={{
            fontSize: 'clamp(34px, 7.5vw, 192px)',
            lineHeight: '0.95',
            letterSpacing: '-0.02em',
          }}
        >
          <span className="hero-line hero-line-1 block whitespace-nowrap overflow-hidden">
            <span className="hero-line-inner inline-block">
              Your{' '}
              <mark className="hl text-inherit bg-transparent relative inline-block">
                <span className="hl-bg absolute inset-0 bg-orange rounded-[0.15em] -rotate-[1deg] origin-left scale-x-0" aria-hidden="true" />
                <span className="hl-caret absolute -left-1 top-0 bottom-0 w-[3px] bg-orange opacity-0" aria-hidden="true" />
                <span className="hl-text relative z-10 transition-colors duration-300">markdown</span>
              </mark>
              ,
            </span>
          </span>
          <span className="hero-line hero-line-2 block whitespace-nowrap overflow-hidden mt-[clamp(2px,0.6vw,12px)]">
            <span className="hero-line-inner inline-block">
              stashed.
            </span>
          </span>
        </h1>
      </div>

      {/* ================= BOTTOM CENTER CRATE INSIDE DASHED ARCH OUTLINE ================= */}
      <div
        className="hero-crate-container relative z-10 flex flex-col items-center justify-end overflow-visible"
        style={{
          marginTop: 'auto',
          marginBottom: '0',
        }}
      >
        {/* Dashed arch outline running off the bottom edge of hero */}
        <div
          className="border-t-2 border-x-2 border-dashed border-cream/35 rounded-t-[50px] md:rounded-t-[80px] flex flex-col items-center justify-end relative cursor-pointer group"
          style={{
            width: 'clamp(180px, 13vw, 340px)',
            paddingTop: 'clamp(14px, 1.2vw, 30px)',
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
          <div className={prefersReducedMotion ? '' : 'animate-bob'}>
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

      {/* ================= BOTTOM CORNERS: FLAT SOLID ORANGE CHUNKY SHAPES ================= */}
      <div
        className="w-full flex items-end justify-between z-10 pointer-events-none"
        style={{
          marginTop: '-clamp(20px, 2vw, 44px)',
          paddingBottom: 'clamp(10px, 1vw, 24px)',
        }}
      >
        {/* Bottom Left: Chunky solid orange asterisk mark (tilted, slowly rotating) */}
        <div className="flex items-center gap-[clamp(8px,0.8vw,20px)] text-left pointer-events-auto">
          <div
            className={`transition-transform duration-300 ${prefersReducedMotion ? '' : 'animate-spin-slow'}`}
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
            className="font-display text-cream leading-tight hidden sm:block"
            style={{
              fontSize: 'clamp(11px, 0.9vw, 23px)',
            }}
          >
            <span className="block">Zero cloud</span>
            <span className="block opacity-85">zero servers</span>
          </div>
        </div>

        {/* Bottom Right: Chunky solid orange >_ prompt mark (tilted +6°, blinking cursor) */}
        <div className="flex items-center gap-[clamp(8px,0.8vw,20px)] text-right pointer-events-auto">
          <div
            className="font-display text-cream leading-tight hidden sm:block"
            style={{
              fontSize: 'clamp(11px, 0.9vw, 23px)',
            }}
          >
            <span className="block">Works offline</span>
            <span className="block opacity-85">stored in your browser</span>
          </div>
          <div
            className="transition-transform duration-300"
            style={{
              width: 'clamp(52px, 8vw, 204px)',
              height: 'clamp(38px, 5.8vw, 148px)',
              transform: 'rotate(6deg)',
            }}
          >
            <svg
              viewBox="0 0 140 100"
              className="w-full h-full drop-shadow-md"
              fill="none"
              aria-label="Markdown prompt motif"
            >
              {/* Chunky > blockquote chevron */}
              <path
                d="M12 18 L68 50 L12 82 L26 94 L94 50 L26 6 Z"
                fill="var(--orange)"
              />
              {/* Chunky _ cursor underscore */}
              <rect
                x="98"
                y="74"
                width="38"
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
