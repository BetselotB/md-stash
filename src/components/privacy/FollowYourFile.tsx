import React, { useEffect, useRef, useState, useCallback } from 'react';
import { RotateCcw, ShieldCheck } from 'lucide-react';
import { Pill } from '../ui/Pill';
import gsap from 'gsap';

export const FollowYourFile: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  const initAnimation = useCallback(() => {
    if (!containerRef.current) return;

    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    const card = containerRef.current.querySelector('.fyf-card');
    const drawerGlow = containerRef.current.querySelector('.fyf-drawer-glow');
    const lock = containerRef.current.querySelector('.fyf-lock');
    const packet1 = containerRef.current.querySelector('.fyf-packet-1');
    const packet2 = containerRef.current.querySelector('.fyf-packet-2');
    const packet3 = containerRef.current.querySelector('.fyf-packet-3');
    const nopeStamp = containerRef.current.querySelector('.fyf-nope');
    const ripple = containerRef.current.querySelector('.fyf-barrier-ripple');

    if (!card || !packet1 || !nopeStamp) return;

    // Reset initial states
    gsap.set(card, { y: 20, opacity: 1 });
    gsap.set(drawerGlow, { opacity: 0 });
    gsap.set(lock, { scale: 0.8, opacity: 0 });
    gsap.set([packet1, packet2, packet3], { x: 0, opacity: 0 });
    gsap.set(nopeStamp, { scale: 1.8, opacity: 0, rotation: -12 });
    gsap.set(ripple, { opacity: 0, scaleY: 0.5 });

    const tl = gsap.timeline({
      onStart: () => setIsPlaying(true),
      onComplete: () => setIsPlaying(false),
    });

    timelineRef.current = tl;

    // Step 1: Note card drops down into the IndexedDB drawer (0s - 0.7s)
    tl.to(card, {
      y: 140,
      duration: 0.7,
      ease: 'bounce.out',
    });

    // Step 2: Drawer glows and locks (0.7s - 1.0s)
    tl.to(
      drawerGlow,
      {
        opacity: 0.35,
        duration: 0.3,
      },
      '-=0.2'
    );
    tl.to(
      lock,
      {
        scale: 1,
        opacity: 1,
        duration: 0.3,
        ease: 'back.out(1.7)',
      },
      '-=0.1'
    );

    // Step 3: Packets try to escape toward the cloud (1.0s - 1.6s)
    tl.to(
      packet1,
      {
        opacity: 1,
        x: 180,
        duration: 0.45,
        ease: 'power2.in',
      },
      '+=0.1'
    );
    tl.to(
      packet2,
      {
        opacity: 1,
        x: 180,
        duration: 0.45,
        ease: 'power2.in',
      },
      '-=0.3'
    );
    tl.to(
      packet3,
      {
        opacity: 1,
        x: 180,
        duration: 0.45,
        ease: 'power2.in',
      },
      '-=0.3'
    );

    // Step 4: Barrier ripples as packets hit the tab border
    tl.to(
      ripple,
      {
        opacity: 0.8,
        scaleY: 1,
        duration: 0.1,
      },
      '-=0.1'
    );

    // Step 5: Packets bounce backwards with deflection
    tl.to(
      [packet1, packet2, packet3],
      {
        x: 130,
        opacity: 0,
        duration: 0.35,
        ease: 'power3.out',
      },
      '+=0.05'
    );
    tl.to(
      ripple,
      {
        opacity: 0,
        duration: 0.3,
      },
      '<'
    );

    // Step 6: "nope" rubber stamp drops onto tab boundary
    tl.to(
      nopeStamp,
      {
        opacity: 1,
        scale: 1,
        rotation: -6,
        duration: 0.3,
        ease: 'back.out(2)',
      },
      '-=0.2'
    );
  }, []);

  const setStaticState = useCallback(() => {
    if (!containerRef.current) return;
    const card = containerRef.current.querySelector('.fyf-card');
    const drawerGlow = containerRef.current.querySelector('.fyf-drawer-glow');
    const lock = containerRef.current.querySelector('.fyf-lock');
    const [packet1, packet2, packet3] = containerRef.current.querySelectorAll('.fyf-packet');
    const nopeStamp = containerRef.current.querySelector('.fyf-nope');

    if (card) gsap.set(card, { y: 140, opacity: 1 });
    if (drawerGlow) gsap.set(drawerGlow, { opacity: 0.35 });
    if (lock) gsap.set(lock, { scale: 1, opacity: 1 });
    if (packet1) gsap.set([packet1, packet2, packet3], { x: 130, opacity: 0 });
    if (nopeStamp) gsap.set(nopeStamp, { scale: 1, opacity: 1, rotation: -6 });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const reduced = !!mq?.matches;
    setIsReducedMotion(reduced);

    if (reduced) {
      setStaticState();
      return;
    }

    // Trigger one-shot animation when entering view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            initAnimation();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.25 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
      if (timelineRef.current) timelineRef.current.kill();
    };
  }, [initAnimation, setStaticState]);

  const handleReplay = () => {
    if (isReducedMotion) {
      setStaticState();
    } else {
      initAnimation();
    }
  };

  return (
    <section className="py-20 sm:py-24 bg-cream text-ink border-t border-line-ink/40 relative">
      <div className="max-w-5xl mx-auto px-6" ref={containerRef}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div className="space-y-3 max-w-xl">
            <Pill>Follow your file</Pill>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-ink tracking-tight">
              From drag-and-drop to local drawer.
            </h2>
            <p className="text-sm sm:text-base text-ink/75 font-sans leading-relaxed">
              When you drop a markdown file into MDstash, it writes directly to your browser's IndexedDB storage.
              Outbound packets to cloud servers hit a hard boundary and are rejected.
            </p>
          </div>

          <button
            type="button"
            onClick={handleReplay}
            disabled={isPlaying}
            aria-label="Replay file safety animation"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-cream-dim border border-line-ink hover:border-orange hover:text-orange transition-colors font-display text-sm text-ink self-start sm:self-auto cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange disabled:opacity-50"
          >
            <RotateCcw className={`w-4 h-4 ${isPlaying ? 'animate-spin' : ''}`} />
            <span>Replay scene</span>
          </button>
        </div>

        {/* Visual Canvas (Responsive SVG Scene) */}
        <div className="rounded-3xl bg-cream-dim/60 border-2 border-line-ink p-4 sm:p-8 shadow-sm relative overflow-hidden">
          <svg
            viewBox="0 0 840 380"
            className="w-full h-auto max-h-[460px] select-none"
            aria-label="Visual demonstration: markdown note stored in IndexedDB drawer, packets blocked at tab border"
            role="img"
          >
            <defs>
              {/* Pattern for background grid */}
              <pattern id="fyfGrid" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M 24 0 L 0 0 0 24" fill="none" stroke="var(--ink)" strokeWidth="0.5" strokeOpacity="0.06" />
              </pattern>
              {/* Drop shadow */}
              <filter id="fyfShadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="var(--forest)" floodOpacity="0.12" />
              </filter>
            </defs>

            {/* Grid background */}
            <rect width="840" height="380" fill="url(#fyfGrid)" rx="20" />

            {/* ================= BROWSER TAB FRAME ================= */}
            <g transform="translate(30, 24)">
              {/* Browser window shadow & card */}
              <rect
                x="0"
                y="0"
                width="490"
                height="332"
                rx="16"
                fill="var(--cream)"
                stroke="var(--ink)"
                strokeWidth="2"
                filter="url(#fyfShadow)"
              />

              {/* Window Header Bar */}
              <rect
                x="0"
                y="0"
                width="490"
                height="42"
                rx="16"
                fill="var(--forest)"
              />
              <rect
                x="0"
                y="26"
                width="490"
                height="16"
                fill="var(--forest)"
              />

              {/* Window Controls (Traffic Lights) */}
              <circle cx="22" cy="21" r="5" fill="#EE7666" />
              <circle cx="38" cy="21" r="5" fill="#E8B949" />
              <circle cx="54" cy="21" r="5" fill="#78B978" />

              {/* Tab Title Pill */}
              <g transform="translate(80, 8)">
                <rect
                  x="0"
                  y="0"
                  width="180"
                  height="26"
                  rx="6"
                  fill="var(--cream)"
                  stroke="var(--line-ink)"
                  strokeWidth="1"
                />
                <circle cx="16" cy="13" r="4" fill="var(--orange)" />
                <text
                  x="28"
                  y="17"
                  fontFamily="var(--font-display)"
                  fontSize="11"
                  fill="var(--ink)"
                >
                  mdstash.app (local)
                </text>
              </g>

              {/* Tab Interior / Canvas */}
              {/* Drop Zone Box */}
              <rect
                x="40"
                y="64"
                width="220"
                height="80"
                rx="10"
                fill="none"
                stroke="var(--line-ink)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text
                x="150"
                y="108"
                textAnchor="middle"
                fontFamily="var(--font-display)"
                fontSize="12"
                fill="var(--ink)"
                opacity="0.45"
              >
                Drop markdown files here
              </text>

              {/* Animated Dropping Note Card */}
              <g className="fyf-card" transform="translate(118, 54)">
                <rect
                  x="0"
                  y="0"
                  width="64"
                  height="80"
                  rx="6"
                  fill="var(--cream-dim)"
                  stroke="var(--orange)"
                  strokeWidth="2"
                  filter="url(#fyfShadow)"
                />
                {/* Note title line */}
                <rect x="10" y="12" width="30" height="5" rx="2" fill="var(--orange)" />
                {/* Content lines */}
                <rect x="10" y="24" width="44" height="3" rx="1.5" fill="var(--ink)" opacity="0.3" />
                <rect x="10" y="32" width="36" height="3" rx="1.5" fill="var(--ink)" opacity="0.3" />
                <rect x="10" y="40" width="40" height="3" rx="1.5" fill="var(--ink)" opacity="0.3" />
                <rect x="10" y="48" width="28" height="3" rx="1.5" fill="var(--ink)" opacity="0.3" />
                {/* .md badge */}
                <rect x="36" y="60" width="20" height="12" rx="3" fill="var(--forest)" />
                <text
                  x="46"
                  y="69"
                  textAnchor="middle"
                  fontFamily="var(--font-mono)"
                  fontSize="8"
                  fontWeight="bold"
                  fill="var(--cream)"
                >
                  .md
                </text>
              </g>

              {/* IndexedDB Drawer Compartment */}
              <g transform="translate(40, 204)">
                {/* Drawer background slot */}
                <rect
                  x="0"
                  y="0"
                  width="410"
                  height="96"
                  rx="12"
                  fill="var(--forest)"
                  stroke="var(--forest-dark)"
                  strokeWidth="2"
                />

                {/* Drawer glow on landing */}
                <rect
                  className="fyf-drawer-glow"
                  x="4"
                  y="4"
                  width="402"
                  height="88"
                  rx="10"
                  fill="var(--orange)"
                  opacity="0"
                />

                {/* Drawer Label & Info */}
                <g transform="translate(24, 28)">
                  <text
                    fontFamily="var(--font-display)"
                    fontSize="16"
                    fontWeight="bold"
                    fill="var(--cream)"
                  >
                    IndexedDB storage drawer
                  </text>
                  <text
                    y="22"
                    fontFamily="var(--font-mono)"
                    fontSize="11"
                    fill="var(--cream-dim)"
                    opacity="0.8"
                  >
                    database: "MDstashDB" · local client only
                  </text>
                </g>

                {/* Storage lock icon indicator */}
                <g className="fyf-lock" transform="translate(350, 48)">
                  <circle cx="0" cy="0" r="18" fill="var(--orange)" />
                  <path
                    d="M-5 -2 L-5 -6 C-5 -9 5 -9 5 -6 L5 -2 M-7 -2 L7 -2 L7 8 L-7 8 Z"
                    fill="none"
                    stroke="var(--forest)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              </g>

              {/* Right Tab Edge Barrier (Impact Line) */}
              <line
                x1="490"
                y1="42"
                x2="490"
                y2="332"
                stroke="var(--orange)"
                strokeWidth="2"
                strokeDasharray="6 4"
              />

              {/* Barrier Ripple upon collision */}
              <ellipse
                className="fyf-barrier-ripple"
                cx="490"
                cy="170"
                rx="8"
                ry="36"
                fill="var(--orange)"
                opacity="0"
              />

              {/* "nope" Rubber Stamp */}
              <g className="fyf-nope" transform="translate(460, 160)">
                <rect
                  x="-38"
                  y="-18"
                  width="76"
                  height="36"
                  rx="8"
                  fill="var(--cream)"
                  stroke="#D94E38"
                  strokeWidth="3"
                />
                <rect
                  x="-34"
                  y="-14"
                  width="68"
                  height="28"
                  rx="5"
                  fill="none"
                  stroke="#D94E38"
                  strokeWidth="1"
                  strokeDasharray="3 2"
                />
                <text
                  x="0"
                  y="5"
                  textAnchor="middle"
                  fontFamily="var(--font-display)"
                  fontSize="17"
                  fontWeight="bold"
                  fill="#D94E38"
                  letterSpacing="0.05em"
                >
                  nope
                </text>
              </g>

              {/* Data Packets attempting outbound flight */}
              <circle
                className="fyf-packet fyf-packet-1"
                cx="290"
                cy="145"
                r="7"
                fill="var(--orange)"
                stroke="var(--forest)"
                strokeWidth="2"
              />
              <circle
                className="fyf-packet fyf-packet-2"
                cx="275"
                cy="170"
                r="6"
                fill="var(--orange)"
                stroke="var(--forest)"
                strokeWidth="2"
              />
              <circle
                className="fyf-packet fyf-packet-3"
                cx="295"
                cy="195"
                r="6"
                fill="var(--orange)"
                stroke="var(--forest)"
                strokeWidth="2"
              />
            </g>

            {/* ================= CLOUD ON THE RIGHT ================= */}
            <g transform="translate(590, 80)">
              {/* Cloud Dashed Outline */}
              <path
                d="M 50 110 A 35 35 0 0 1 75 45 A 50 50 0 0 1 165 40 A 40 40 0 0 1 205 95 A 35 35 0 0 1 185 150 L 50 150 A 30 30 0 0 1 50 110 Z"
                fill="none"
                stroke="var(--ink)"
                strokeWidth="2"
                strokeDasharray="6 6"
                opacity="0.35"
              />

              {/* Cloud Label */}
              <text
                x="125"
                y="95"
                textAnchor="middle"
                fontFamily="var(--font-display)"
                fontSize="14"
                fill="var(--ink)"
                opacity="0.5"
              >
                External cloud
              </text>
              <text
                x="125"
                y="115"
                textAnchor="middle"
                fontFamily="var(--font-mono)"
                fontSize="10"
                fill="var(--ink)"
                opacity="0.4"
              >
                0 bytes received
              </text>

              {/* Red Crossed Out Arrow */}
              <line
                x1="-40"
                y1="100"
                x2="10"
                y2="100"
                stroke="#D94E38"
                strokeWidth="2"
                strokeDasharray="3 3"
              />
              <text
                x="-15"
                y="92"
                textAnchor="middle"
                fontFamily="var(--font-display)"
                fontSize="10"
                fill="#D94E38"
              >
                blocked
              </text>
            </g>
          </svg>
        </div>

        {/* Caption below visual */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-display text-ink/75">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-forest shrink-0" />
            <span>Browser sandboxed: network sockets never transmit your markdown files.</span>
          </div>
          <span className="font-mono text-[11px] text-ink/60">
            Storage engine: Dexie.js / IndexedDB
          </span>
        </div>
      </div>
    </section>
  );
};
