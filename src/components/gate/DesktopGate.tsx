import React, { useState, useEffect } from 'react';
import { Copy, Check, Mail } from 'lucide-react';

export const DesktopGate: React.FC = () => {
  // Check if pointer is fine and hover is available (i.e. mouse on narrow desktop window vs touch/tablet)
  const [isNarrowDesktop, setIsNarrowDesktop] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  });

  const [liveWidth, setLiveWidth] = useState<number>(() => {
    if (typeof window === 'undefined') return 800;
    return window.innerWidth;
  });

  const [copied, setCopied] = useState<boolean>(false);
  const [currentUrl, setCurrentUrl] = useState<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setCurrentUrl(window.location.href);

    // Track input device capability
    const pointerMq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const onPointerChange = (e: MediaQueryListEvent) => {
      setIsNarrowDesktop(e.matches);
    };

    if (pointerMq.addEventListener) {
      pointerMq.addEventListener('change', onPointerChange);
    } else {
      pointerMq.addListener(onPointerChange);
    }

    // Throttled window width tracking via requestAnimationFrame for narrow desktop readout
    let rafId: number;
    const onResize = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setLiveWidth(window.innerWidth);
      });
    };

    window.addEventListener('resize', onResize, { passive: true });

    return () => {
      if (pointerMq.removeEventListener) {
        pointerMq.removeEventListener('change', onPointerChange);
      } else {
        pointerMq.removeListener(onPointerChange);
      }
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const handleCopyLink = async () => {
    const url = currentUrl || (typeof window !== 'undefined' ? window.location.href : '');
    let copiedSuccess = false;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await Promise.race([
          navigator.clipboard.writeText(url),
          new Promise((_, reject) => setTimeout(() => reject(new Error('clipboard timeout')), 400)),
        ]);
        copiedSuccess = true;
      } catch {
        // Fallback to execCommand if permission denied or document not focused
      }
    }

    if (!copiedSuccess && typeof document !== 'undefined') {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '0';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        copiedSuccess = document.execCommand('copy');
        document.body.removeChild(textarea);
      } catch {
        copiedSuccess = true; // Still give visual confirmation that action fired
      }
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const mailtoUrl = `mailto:?subject=MDstash&body=${encodeURIComponent(currentUrl || 'https://mdstash.app')}`;

  return (
    <div
      id="desktop-gate"
      data-testid="desktop-gate"
      className="min-h-screen min-h-[100dvh] w-full bg-sage text-cream selection:bg-orange selection:text-forest flex flex-col justify-between items-center text-center px-4 sm:px-6 md:px-8 select-none overflow-x-hidden relative"
      style={{
        paddingTop: 'max(1.75rem, env(safe-area-inset-top, 1.75rem))',
        paddingBottom: 'max(1.75rem, env(safe-area-inset-bottom, 1.75rem))',
      }}
    >
      {/* ================= HEADER: CENTERED FIXED-SIZE BADGE ================= */}
      <header className="w-full flex justify-center items-center shrink-0 pt-1 pb-4">
        <div
          data-testid="gate-badge"
          className="w-16 h-20 sm:w-20 sm:h-24 text-cream flex items-center justify-center select-none pointer-events-none"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 100 114"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full overflow-visible"
            style={{ color: 'currentColor' }}
          >
            {/* Outer Frame */}
            <rect
              x="4"
              y="4"
              width="92"
              height="92"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
            />
            {/* Top Bar */}
            <line x1="12" y1="13" x2="88" y2="13" stroke="currentColor" strokeWidth="1.5" />
            {/* First Word: MD */}
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
            {/* Center Divider Bar */}
            <line x1="12" y1="54" x2="88" y2="54" stroke="currentColor" strokeWidth="1.5" />
            {/* Second Word: stash */}
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
            {/* Bottom Bar */}
            <line x1="12" y1="85" x2="88" y2="85" stroke="currentColor" strokeWidth="1.5" />
            {/* Ribbon Tab */}
            <polygon points="35,88 65,88 65,112 50,103 35,112" fill="currentColor" />
            <text
              x="50"
              y="102"
              textAnchor="middle"
              fontFamily="var(--font-display)"
              fontSize="13"
              fontWeight="bold"
              fill="var(--sage)"
            >
              26
            </text>
          </svg>
        </div>
      </header>

      {/* ================= MAIN CONTENT ================= */}
      <main
        id="main-content"
        className="w-full max-w-xl mx-auto flex flex-col items-center justify-center my-auto py-4 space-y-6 sm:space-y-8"
      >
        {/* ================= ILLUSTRATION CONTAINER ================= */}
        <div
          data-testid="gate-illustration"
          className="w-full max-w-[340px] sm:max-w-[420px] h-[160px] sm:h-[190px] flex items-center justify-center"
        >
          {isNarrowDesktop ? (
            /* ================= VARIANT B: NARROW DESKTOP WINDOW ================= */
            <svg
              viewBox="0 0 420 190"
              className="w-full h-full select-none"
              aria-label="Desktop monitor with horizontal widen arrow"
              role="img"
            >
              {/* Monitor frame */}
              <rect
                x="85"
                y="15"
                width="250"
                height="135"
                rx="14"
                fill="var(--forest)"
                stroke="var(--cream)"
                strokeWidth="2.5"
              />
              {/* Monitor stand & base */}
              <rect x="195" y="150" width="30" height="20" fill="var(--cream)" opacity="0.8" />
              <rect x="165" y="170" width="90" height="8" rx="4" fill="var(--cream)" opacity="0.9" />

              {/* Monitor Screen Window Header */}
              <rect x="85" y="15" width="250" height="22" rx="14" fill="var(--forest-dark)" />
              <rect x="85" y="27" width="250" height="10" fill="var(--forest-dark)" />
              <circle cx="100" cy="26" r="3.5" fill="#EE7666" />
              <circle cx="112" cy="26" r="3.5" fill="#E8B949" />
              <circle cx="124" cy="26" r="3.5" fill="#78B978" />

              {/* Screen Interior: MDstash crate logo silhouette */}
              <g transform="translate(190, 60)">
                <rect x="-18" y="-12" width="36" height="32" rx="4" fill="none" stroke="var(--orange)" strokeWidth="2" strokeDasharray="3 3" />
                <path d="M-10 4 L10 4 M-10 10 L6 10" stroke="var(--cream)" strokeWidth="1.5" strokeLinecap="round" />
                <rect x="-6" y="-20" width="12" height="10" rx="2" fill="var(--orange)" />
              </g>

              {/* Double-ended horizontal arrow indicating window widening */}
              <g className="gate-widen-arrow motion-safe:animate-pulse">
                {/* Left arrow head */}
                <polygon points="30,85 50,73 50,97" fill="var(--orange)" />
                {/* Horizontal line extending across */}
                <line x1="45" y1="85" x2="375" y2="85" stroke="var(--orange)" strokeWidth="3" strokeDasharray="6 4" />
                {/* Right arrow head */}
                <polygon points="390,85 370,73 370,97" fill="var(--orange)" />
              </g>

              {/* Sub-label under monitor */}
              <text
                x="210"
                y="125"
                textAnchor="middle"
                fontFamily="var(--font-mono)"
                fontSize="11"
                fill="var(--cream-dim)"
              >
                1024 px minimum
              </text>
            </svg>
          ) : (
            /* ================= VARIANT A: TOUCH / COARSE (PHONE / TABLET) ================= */
            <svg
              viewBox="0 0 420 190"
              className="w-full h-full select-none"
              aria-label="Phone to desktop monitor file movement"
              role="img"
            >
              {/* Smartphone Frame on Left */}
              <g transform="translate(35, 20)">
                <rect
                  x="0"
                  y="0"
                  width="72"
                  height="135"
                  rx="14"
                  fill="var(--forest)"
                  stroke="var(--cream)"
                  strokeWidth="2.5"
                />
                {/* Phone screen */}
                <rect x="5" y="14" width="62" height="106" rx="6" fill="var(--sage)" />
                {/* Speaker slit */}
                <rect x="26" y="6" width="20" height="2.5" rx="1.25" fill="var(--cream)" opacity="0.6" />
                {/* Soft 'x' mark on phone screen */}
                <g transform="translate(36, 67)">
                  <circle cx="0" cy="0" r="14" fill="var(--forest)" opacity="0.35" />
                  <line x1="-6" y1="-6" x2="6" y2="6" stroke="var(--orange)" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="6" y1="-6" x2="-6" y2="6" stroke="var(--orange)" strokeWidth="2.5" strokeLinecap="round" />
                </g>
              </g>

              {/* Desktop Monitor Frame on Right */}
              <g transform="translate(240, 15)">
                <rect
                  x="0"
                  y="0"
                  width="145"
                  height="115"
                  rx="10"
                  fill="var(--forest)"
                  stroke="var(--cream)"
                  strokeWidth="2.5"
                />
                {/* Screen Window Header */}
                <rect x="0" y="0" width="145" height="18" rx="10" fill="var(--forest-dark)" />
                <rect x="0" y="10" width="145" height="8" fill="var(--forest-dark)" />
                <circle cx="12" cy="9" r="2.5" fill="#EE7666" />
                <circle cx="20" cy="9" r="2.5" fill="#E8B949" />
                <circle cx="28" cy="9" r="2.5" fill="#78B978" />

                {/* Stand & Base */}
                <rect x="62" y="115" width="20" height="20" fill="var(--cream)" opacity="0.8" />
                <rect x="42" y="135" width="60" height="6" rx="3" fill="var(--cream)" opacity="0.9" />

                {/* Crate mark inside screen */}
                <g transform="translate(72, 64)">
                  <rect x="-16" y="-12" width="32" height="26" rx="4" fill="var(--orange)" />
                  <rect x="-6" y="-18" width="12" height="8" rx="2" fill="var(--cream)" />
                  <text
                    x="0"
                    y="7"
                    textAnchor="middle"
                    fontFamily="var(--font-display)"
                    fontSize="12"
                    fontWeight="bold"
                    fill="var(--forest)"
                  >
                    #
                  </text>
                </g>
              </g>

              {/* Curved Trajectory Connection */}
              <path
                d="M 112 85 C 150 45, 190 45, 235 75"
                fill="none"
                stroke="var(--cream)"
                strokeWidth="2"
                strokeDasharray="4 4"
                opacity="0.4"
              />

              {/* Floating Markdown Card moving from phone to monitor */}
              <g className="gate-floating-card">
                <g transform="translate(162, 54)">
                  <rect
                    x="0"
                    y="0"
                    width="26"
                    height="34"
                    rx="4"
                    fill="var(--cream)"
                    stroke="var(--orange)"
                    strokeWidth="1.5"
                    filter="drop-shadow(0 4px 6px rgba(0,0,0,0.15))"
                  />
                  <rect x="4" y="6" width="12" height="3" rx="1" fill="var(--orange)" />
                  <rect x="4" y="12" width="18" height="2" rx="1" fill="var(--forest)" opacity="0.4" />
                  <rect x="4" y="17" width="14" height="2" rx="1" fill="var(--forest)" opacity="0.4" />
                  <text
                    x="13"
                    y="28"
                    textAnchor="middle"
                    fontFamily="var(--font-mono)"
                    fontSize="7"
                    fontWeight="bold"
                    fill="var(--forest)"
                  >
                    .md
                  </text>
                </g>
              </g>
            </svg>
          )}
        </div>

        {/* ================= HEADLINE & SUBLINE ================= */}
        <div className="space-y-3 max-w-lg">
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-cream tracking-tight leading-tight">
            MDstash lives on the desktop.
          </h1>

          {isNarrowDesktop ? (
            <p className="text-sm sm:text-base text-cream-dim font-sans max-w-md mx-auto leading-relaxed">
              Your window is <strong className="text-cream font-mono font-bold">{liveWidth} px</strong> wide. MDstash
              needs at least 1024 px. Widen this window to continue.
            </p>
          ) : (
            <p className="text-sm sm:text-base text-cream-dim font-sans max-w-md mx-auto leading-relaxed">
              Sorry! Dragging, dropping and organizing files needs a bigger screen and a mouse. Open this link on a
              computer to start stashing.
            </p>
          )}

          {/* Narrow desktop live width readout indicator */}
          {isNarrowDesktop && (
            <div className="pt-1 flex justify-center">
              <div
                data-testid="live-width-pill"
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream-dim/15 border border-line text-xs font-display text-cream"
              >
                <span className="w-2 h-2 rounded-full bg-orange animate-pulse" aria-hidden="true" />
                <span className="font-mono">{liveWidth} px</span>
                <span className="opacity-75">/ 1024 px minimum</span>
              </div>
            </div>
          )}
        </div>

        {/* ================= ACTION BUTTONS ================= */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-sm pt-2">
          {/* Orange Copy Link Button */}
          <button
            type="button"
            onClick={handleCopyLink}
            aria-label="Copy website link to clipboard"
            className="w-full sm:w-auto min-h-[44px] px-6 py-3 rounded-full bg-orange hover:bg-orange-deep text-forest font-display font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cream/50 flex items-center justify-center gap-2 shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 shrink-0" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 shrink-0" />
                <span>Copy link</span>
              </>
            )}
            <span aria-live="polite" className="sr-only">
              {copied ? 'Link copied to clipboard' : ''}
            </span>
          </button>

          {/* Email to myself mailto link */}
          <a
            href={mailtoUrl}
            aria-label="Email link to myself"
            className="w-full sm:w-auto min-h-[44px] px-6 py-3 rounded-full bg-transparent hover:bg-cream/10 border border-cream/30 text-cream font-display text-sm transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange flex items-center justify-center gap-2 shrink-0"
          >
            <Mail className="w-4 h-4 shrink-0" />
            <span>Email it to myself</span>
          </a>
        </div>
      </main>

      {/* ================= FOOTER REASSURANCE ================= */}
      <footer className="w-full text-center shrink-0 pt-6 pb-2">
        <p className="text-xs text-cream/75 font-sans leading-relaxed">
          No account, no tracking. Your files never leave your device.
        </p>
      </footer>

      {/* Embedded CSS for loop animations (transform and opacity only, paused when reduced motion or hidden) */}
      <style>{`
        @keyframes floatCardMotion {
          0% {
            transform: translate(0px, 0px) scale(0.92);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          85% {
            opacity: 1;
          }
          100% {
            transform: translate(84px, 12px) scale(1.04);
            opacity: 0;
          }
        }
        .gate-floating-card {
          animation: floatCardMotion 5s ease-in-out infinite;
          transform-origin: center;
          will-change: transform, opacity;
        }
        @media (prefers-reduced-motion: reduce) {
          .gate-floating-card {
            animation: none !important;
            transform: translate(42px, 6px) scale(1) !important;
            opacity: 1 !important;
          }
          .gate-widen-arrow {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};
