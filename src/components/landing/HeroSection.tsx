import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowDown } from 'lucide-react';
import { StampBadge } from '../ui/StampBadge';

interface HeroSectionProps {
  onScrollNext?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onScrollNext }) => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);

  // Mouse tilt / parallax state
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isDropping, setIsDropping] = useState(false);

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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) / (rect.width / 2);
    const deltaY = (e.clientY - centerY) / (rect.height / 2);
    setTilt({
      x: Math.max(-1, Math.min(1, deltaX)) * 8, // max 8 deg
      y: Math.max(-1, Math.min(1, deltaY)) * 8,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

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
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[calc(100vh-5rem)] max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8 md:pb-12 flex flex-col justify-between items-center text-center select-none overflow-hidden"
    >
      {/* ================= FIXED RIGHT-EDGE PROTRUDING ORANGE TAB ================= */}
      <div
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 hidden md:flex"
      >
        <button
          type="button"
          onClick={handleStashClick}
          title="Open MDstash"
          aria-label="Open MDstash"
          className="group relative flex items-center bg-orange hover:bg-orange-deep text-forest transition-all duration-200 cursor-pointer shadow-glow rounded-l-full py-4 pl-4 pr-2 hover:pl-6 focus:outline-none focus:ring-2 focus:ring-forest"
        >
          <div className="flex items-center gap-2">
            <img
              src="/logo.svg"
              alt="Crate icon"
              className="w-6 h-6 object-contain group-hover:scale-110 transition-transform"
            />
            <ArrowRight className="w-4 h-4 text-forest group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>

      {/* ================= TOP/LEFT ROTATING CIRCULAR STAMP BADGE ================= */}
      <div className="absolute left-4 sm:left-8 top-4 md:top-8 z-20">
        <button
          type="button"
          onClick={handleScrollDown}
          aria-label="Scroll to how it works"
          className="focus:outline-none focus:ring-2 focus:ring-orange rounded-full cursor-pointer hover:scale-105 transition-transform"
        >
          <StampBadge
            text="private & honest · local first · works offline · "
            size={110}
            icon={<ArrowDown className="w-4 h-4 text-cream" />}
          />
        </button>
      </div>

      {/* ================= HERO CENTER STAGE: HEADLINE + OVERLAPPING CRATE ================= */}
      <div className="relative w-full max-w-5xl my-auto flex flex-col items-center justify-center pt-8 md:pt-4">
        {/* Layer 1: Headline in 3 lines max in sentence case */}
        <h1
          className="font-display text-[12vw] sm:text-[10vw] md:text-[7.8rem] lg:text-[8.8rem] leading-[0.84] tracking-tight text-cream select-none text-shadow-stamp z-0 relative"
          style={{ letterSpacing: '-0.02em' }}
        >
          <span className="block">Your markdown,</span>
          <span className="block">stashed.</span>
          <span className="block">Zero cloud, zero fuss.</span>
        </h1>

        {/* Layer 2: Overlapping Center Crate Logo (Layered on top of headline like the reference can) */}
        <div
          onClick={handleStashClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] cursor-pointer group"
          style={{
            transform: prefersReducedMotion
              ? 'translate(-50%, -45%)'
              : `translate(calc(-50% + ${tilt.x * 2}px), calc(-45% + ${tilt.y * 2}px)) rotate(${tilt.x * 0.4}deg)`,
            transition: isHovered ? 'transform 0.15s ease-out' : 'transform 0.4s ease-out',
          }}
          title="Click to stash and open MDstash"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleStashClick();
            }
          }}
          aria-label="Interactive MDstash crate. Click to open application"
        >
          {/* Animated dropping card on click */}
          {isDropping && (
            <div
              className="absolute left-1/2 -translate-x-1/2 -top-12 z-20 w-16 h-20 bg-cream rounded-lg border-2 border-orange shadow-card flex flex-col p-1.5 gap-1 animate-slideDown"
              style={{
                animation: 'dropIntoCrate 450ms cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
              }}
            >
              <div className="h-1.5 w-8 bg-orange rounded" />
              <div className="h-1 w-full bg-forest/30 rounded" />
              <div className="h-1 w-10 bg-forest/30 rounded" />
              <div className="h-1 w-12 bg-forest/30 rounded" />
            </div>
          )}

          {/* Radial Warm Glow behind crate */}
          <div className="absolute inset-0 -inset-x-8 rounded-full bg-orange/20 blur-3xl group-hover:bg-orange/40 transition-all pointer-events-none" />

          {/* Crate image with float animation */}
          <div className={prefersReducedMotion ? '' : 'animate-bob'}>
            <img
              src="/logo.svg"
              alt="MDstash Crate Logo"
              className="w-36 sm:w-48 md:w-56 lg:w-64 h-auto drop-shadow-[0_16px_28px_rgba(25,32,28,0.55)] group-hover:scale-105 transition-transform duration-200"
            />
          </div>
        </div>

        {/* Subline under thin rules */}
        <div className="w-full max-w-xl mx-auto mt-6 z-10 flex flex-col items-center">
          <div className="w-full flex items-center gap-4 my-2">
            <div className="flex-1 h-px bg-cream/25" />
            <p className="font-display text-lg sm:text-xl md:text-2xl tracking-normal text-cream shrink-0">
              Pure, local, and ready to drop anywhere.
            </p>
            <div className="flex-1 h-px bg-cream/25" />
          </div>
          <p className="text-xs sm:text-sm text-cream-dim max-w-md mx-auto leading-relaxed mt-1">
            Drag files in, organize collections, and copy prompt-ready markdown directly into your editor or AI chats.
          </p>
        </div>
      </div>

      {/* ================= BOTTOM CORNERS: CHUNKY MARKDOWN MOTIFS ================= */}
      <div className="w-full flex items-end justify-between pt-4 border-t border-line mt-6 z-10">
        {/* Bottom Left: Chunky M↓ Markdown Mark */}
        <div className="flex items-center gap-3 text-left">
          <div
            className={`transition-transform duration-300 ${
              prefersReducedMotion ? '' : 'animate-bob'
            }`}
            style={{ transform: 'rotate(-8deg)' }}
          >
            <svg
              viewBox="0 0 160 110"
              className="w-24 sm:w-32 md:w-36 h-auto drop-shadow-md"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Markdown M-down motif"
            >
              <rect
                x="4"
                y="4"
                width="152"
                height="102"
                rx="18"
                stroke="var(--orange)"
                strokeWidth="7"
                fill="rgba(242, 163, 58, 0.12)"
              />
              {/* Chunky M */}
              <path
                d="M26 78V32L52 58L78 32V78"
                stroke="var(--orange)"
                strokeWidth="9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Chunky Down Arrow ↓ */}
              <path
                d="M116 32V74M116 74L100 58M116 74L132 58"
                stroke="var(--orange)"
                strokeWidth="9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="font-mono text-[10px] sm:text-xs text-cream-dim leading-tight">
            <span className="block font-bold text-cream">Zero cloud</span>
            <span className="block opacity-80">zero servers</span>
          </div>
        </div>

        {/* Center prompt quick scroll hint */}
        <button
          type="button"
          onClick={handleScrollDown}
          className="hidden md:flex flex-col items-center gap-1 text-[11px] font-mono text-cream-dim hover:text-orange transition-colors cursor-pointer"
        >
          <span>Explore workflow</span>
          <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
        </button>

        {/* Bottom Right: Chunky # Hash Mark */}
        <div className="flex items-center gap-3 text-right">
          <div className="font-mono text-[10px] sm:text-xs text-cream-dim leading-tight hidden xs:block">
            <span className="block font-bold text-cream">Works offline</span>
            <span className="block opacity-80">stored in your browser</span>
          </div>
          <div
            className={`transition-transform duration-300 ${
              prefersReducedMotion ? '' : 'animate-bob-delayed'
            }`}
            style={{ transform: 'rotate(8deg)' }}
          >
            <svg
              viewBox="0 0 120 110"
              className="w-20 sm:w-28 md:w-32 h-auto drop-shadow-md"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Markdown header hash motif"
            >
              <rect
                x="4"
                y="4"
                width="112"
                height="102"
                rx="18"
                stroke="var(--orange)"
                strokeWidth="7"
                fill="rgba(242, 163, 58, 0.12)"
              />
              {/* Hash vertical bars */}
              <path
                d="M44 24L34 86M76 24L66 86"
                stroke="var(--orange)"
                strokeWidth="9"
                strokeLinecap="round"
              />
              {/* Hash horizontal bars */}
              <path
                d="M18 44L98 40M14 70L94 66"
                stroke="var(--orange)"
                strokeWidth="9"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};
