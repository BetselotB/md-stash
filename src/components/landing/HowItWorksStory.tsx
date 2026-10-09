import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { Check, Copy, FileText, RotateCcw, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { formatFileForCopy } from '../../domain/copyFormats';
import { CopyMode } from '../../domain/types';
import { Pill } from '../ui/Pill';

gsap.registerPlugin(ScrollTrigger);

const SAMPLE_MD_CONTENT = `# Claude Project Memory & Rules
- Local-first architecture
- Zero telemetry or cloud sync`;

interface SegmentGeometry {
  width: number;
  height: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  x2_bot: number;
  y2_bot: number;
  x3: number;
  y3: number;
  d1: string;
  d2: string;
  len1: number;
  len2: number;
}

const DEFAULT_GEOMETRY: SegmentGeometry = {
  width: 1200,
  height: 1800,
  x1: 0,
  y1: 0,
  x2: 0,
  y2: 0,
  x2_bot: 0,
  y2_bot: 0,
  x3: 0,
  y3: 0,
  d1: '',
  d2: '',
  len1: 0,
  len2: 0,
};

export const HowItWorksStory: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  // Outer layout container refs (STABLE layout boxes, never transformed)
  const panel1Ref = useRef<HTMLDivElement>(null);
  const panel2Ref = useRef<HTMLDivElement>(null);
  const panel3Ref = useRef<HTMLDivElement>(null);

  // Inner card refs (may have hover or animation transforms)
  const scene1Ref = useRef<HTMLDivElement>(null);
  const scene2Ref = useRef<HTMLDivElement>(null);
  const scene3Ref = useRef<HTMLDivElement>(null);

  // SVG and path elements
  const path1Ref = useRef<SVGPathElement>(null);
  const path2Ref = useRef<SVGPathElement>(null);
  const mask1Ref = useRef<SVGPathElement>(null);
  const mask2Ref = useRef<SVGPathElement>(null);
  const markerRef = useRef<SVGGElement>(null);

  // Geometry state and ref
  const [geometry, setGeometry] = useState<SegmentGeometry>(DEFAULT_GEOMETRY);
  const geomRef = useRef<SegmentGeometry>(DEFAULT_GEOMETRY);
  geomRef.current = geometry;

  // Scrub progress refs
  const p1ProgressRef = useRef(0);
  const p2ProgressRef = useRef(0);
  const hasPulsedRef = useRef(false);

  // Scene timeline references for replays
  const tl1Ref = useRef<gsap.core.Timeline | null>(null);
  const tl2Ref = useRef<gsap.core.Timeline | null>(null);
  const tl3Ref = useRef<gsap.core.Timeline | null>(null);

  // Interactive state for Scene 3
  const [copyMode, setCopyMode] = useState<CopyMode>('prompt');
  const [isCopied, setIsCopied] = useState(false);
  const [fileCount, setFileCount] = useState(0);

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

  // ----------------------------------------------------
  // GEOMETRY CALCULATION FROM UNTRANSFORMED LAYOUT BOXES
  // ----------------------------------------------------
  const calculateGeometry = useCallback((): SegmentGeometry | null => {
    if (!sectionRef.current || !panel1Ref.current || !panel2Ref.current || !panel3Ref.current) {
      return null;
    }

    const sRect = sectionRef.current.getBoundingClientRect();
    const p1Rect = panel1Ref.current.getBoundingClientRect();
    const p2Rect = panel2Ref.current.getBoundingClientRect();
    const p3Rect = panel3Ref.current.getBoundingClientRect();

    if (sRect.width === 0 || sRect.height === 0) return null;

    const width = Math.round(sRect.width);
    const height = Math.round(sRect.height);

    // Segment 1: Bottom center of Panel 1 -> Top center of Panel 2
    const x1 = +(p1Rect.left - sRect.left + p1Rect.width / 2).toFixed(1);
    const y1 = +(p1Rect.bottom - sRect.top).toFixed(1);

    const x2 = +(p2Rect.left - sRect.left + p2Rect.width / 2).toFixed(1);
    const y2 = +(p2Rect.top - sRect.top).toFixed(1);

    const gap1 = y2 - y1;
    const d1_ctrl = +(gap1 * 0.45).toFixed(1);
    const d1 = `M ${x1},${y1} C ${x1},${y1 + d1_ctrl} ${x2},${y2 - d1_ctrl} ${x2},${y2}`;

    // Segment 2: Bottom center of Panel 2 -> Top center of Panel 3
    const x2_bot = +(p2Rect.left - sRect.left + p2Rect.width / 2).toFixed(1);
    const y2_bot = +(p2Rect.bottom - sRect.top).toFixed(1);

    const x3 = +(p3Rect.left - sRect.left + p3Rect.width / 2).toFixed(1);
    const y3 = +(p3Rect.top - sRect.top).toFixed(1);

    const gap2 = y3 - y2_bot;
    const d2_ctrl = +(gap2 * 0.45).toFixed(1);
    const d2 = `M ${x2_bot},${y2_bot} C ${x2_bot},${y2_bot + d2_ctrl} ${x3},${y3 - d2_ctrl} ${x3},${y3}`;

    return {
      width,
      height,
      x1,
      y1,
      x2,
      y2,
      x2_bot,
      y2_bot,
      x3,
      y3,
      d1,
      d2,
      len1: 0,
      len2: 0,
    };
  }, []);

  // Update geometry function
  const updateGeometry = useCallback(() => {
    const next = calculateGeometry();
    if (!next) return;

    setGeometry((prev) => {
      if (
        prev.d1 === next.d1 &&
        prev.d2 === next.d2 &&
        prev.width === next.width &&
        prev.height === next.height
      ) {
        return prev;
      }
      return next;
    });
  }, [calculateGeometry]);

  // Initial and reactive geometry updates
  useLayoutEffect(() => {
    updateGeometry();
  }, [updateGeometry]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // document.fonts.ready
    document.fonts?.ready?.then(() => {
      updateGeometry();
      ScrollTrigger.refresh();
    });

    // Window resize debounced ~120ms
    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        updateGeometry();
        ScrollTrigger.refresh();
      }, 120);
    };
    window.addEventListener('resize', handleResize);

    // ResizeObserver on section and panels
    const ro = new ResizeObserver(() => {
      handleResize();
    });
    if (sectionRef.current) ro.observe(sectionRef.current);
    if (panel1Ref.current) ro.observe(panel1Ref.current);
    if (panel2Ref.current) ro.observe(panel2Ref.current);
    if (panel3Ref.current) ro.observe(panel3Ref.current);

    // ScrollTrigger refresh hook
    const handleScrollTriggerRefresh = () => {
      updateGeometry();
    };
    ScrollTrigger.addEventListener('refreshInit', handleScrollTriggerRefresh);

    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
      ro.disconnect();
      ScrollTrigger.removeEventListener('refreshInit', handleScrollTriggerRefresh);
    };
  }, [updateGeometry]);

  // Measure path lengths once paths are set
  useEffect(() => {
    if (!path1Ref.current || !path2Ref.current) return;
    try {
      const l1 = path1Ref.current.getTotalLength() || 0;
      const l2 = path2Ref.current.getTotalLength() || 0;
      if (l1 > 0 || l2 > 0) {
        setGeometry((prev) => ({
          ...prev,
          len1: Math.round(l1),
          len2: Math.round(l2),
        }));
      }
    } catch {
      // ignore SVG errors
    }
  }, [geometry.d1, geometry.d2]);

  // ----------------------------------------------------
  // DRAWING AND TRAVELLING MARKER RENDER LOOP
  // ----------------------------------------------------
  const updateDrawingAndMarker = useCallback(() => {
    const p1 = p1ProgressRef.current;
    const p2 = p2ProgressRef.current;

    const path1El = path1Ref.current;
    const path2El = path2Ref.current;
    const mask1El = mask1Ref.current;
    const mask2El = mask2Ref.current;
    const markerEl = markerRef.current;

    // Segment 1 Drawing
    if (path1El && mask1El) {
      const len1 = path1El.getTotalLength() || 1;
      const offset1 = prefersReducedMotion ? 0 : len1 * (1 - p1);
      mask1El.style.strokeDashoffset = `${offset1}`;
      path1El.style.strokeDashoffset = `${offset1}`;
    }

    // Segment 2 Drawing
    if (path2El && mask2El) {
      const len2 = path2El.getTotalLength() || 1;
      const offset2 = prefersReducedMotion ? 0 : len2 * (1 - p2);
      mask2El.style.strokeDashoffset = `${offset2}`;
      path2El.style.strokeDashoffset = `${offset2}`;
    }

    // Travelling Marker logic
    if (markerEl && path1El && path2El) {
      if (prefersReducedMotion || p1 <= 0.001) {
        // Outside the segments: completely hidden
        markerEl.style.opacity = '0';
        hasPulsedRef.current = false;
      } else if (p1 < 0.999) {
        // Travelling along Segment 1
        const len1 = path1El.getTotalLength() || 1;
        const pt = path1El.getPointAtLength(p1 * len1);
        markerEl.style.opacity = '1';
        gsap.set(markerEl, {
          x: pt.x,
          y: pt.y,
          scale: 1,
          transformOrigin: 'center center',
        });
        hasPulsedRef.current = false;
      } else if (p2 <= 0.001) {
        // Segment 1 complete, resting at top of panel 2 before Segment 2 begins
        const len1 = path1El.getTotalLength() || 1;
        const pt = path1El.getPointAtLength(len1);
        markerEl.style.opacity = '1';
        gsap.set(markerEl, {
          x: pt.x,
          y: pt.y,
          scale: 1,
          transformOrigin: 'center center',
        });
        hasPulsedRef.current = false;
      } else if (p2 < 0.999) {
        // Handed off, travelling along Segment 2
        const len2 = path2El.getTotalLength() || 1;
        const pt = path2El.getPointAtLength(p2 * len2);
        markerEl.style.opacity = '1';
        gsap.set(markerEl, {
          x: pt.x,
          y: pt.y,
          scale: 1,
          transformOrigin: 'center center',
        });
        hasPulsedRef.current = false;
      } else {
        // Settled at end of Segment 2 at top of panel 3
        const len2 = path2El.getTotalLength() || 1;
        const pt = path2El.getPointAtLength(len2);
        markerEl.style.opacity = '1';
        gsap.set(markerEl, {
          x: pt.x,
          y: pt.y,
          transformOrigin: 'center center',
        });

        // Trigger settle pulse once upon landing
        if (!hasPulsedRef.current) {
          hasPulsedRef.current = true;
          gsap.fromTo(
            markerEl,
            { scale: 1.35 },
            { scale: 1.0, duration: 0.35, ease: 'back.out(2)' }
          );
        }
      }
    }
  }, [prefersReducedMotion]);

  // Update render when progress or geometry changes
  useEffect(() => {
    updateDrawingAndMarker();
  }, [geometry, updateDrawingAndMarker]);

  // ----------------------------------------------------
  // SCENE 1 TIMELINE: Drop your markdown in
  // ----------------------------------------------------
  const playScene1 = useCallback(() => {
    if (!scene1Ref.current) return;
    tl1Ref.current?.kill();

    const root = scene1Ref.current;
    const cards = root.querySelectorAll('.s1-card');
    const counterEl = root.querySelector('.s1-counter');
    const crateEl = root.querySelector('.s1-crate');

    if (prefersReducedMotion) {
      gsap.set(cards, { opacity: 1, y: 0, scale: 1 });
      setFileCount(4);
      return;
    }

    const tl = gsap.timeline();
    tl1Ref.current = tl;

    // Reset initial states
    gsap.set(cards, { opacity: 0, y: -60, scale: 0.85 });
    gsap.set(crateEl, { scale: 1 });
    setFileCount(0);

    // Staggered fall with springy settle
    cards.forEach((card, i) => {
      tl.to(
        card,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.45,
          ease: 'back.out(1.5)',
          onStart: () => {
            setFileCount(i + 1);
            if (crateEl) {
              gsap.fromTo(
                crateEl,
                { scale: 0.96 },
                { scale: 1, duration: 0.25, ease: 'power2.out' }
              );
            }
          },
        },
        i * 0.18
      );
    });

    if (counterEl) {
      tl.fromTo(
        counterEl,
        { scale: 1.15, color: 'var(--orange)' },
        { scale: 1, color: 'var(--cream)', duration: 0.3 },
        '+=0.1'
      );
    }
  }, [prefersReducedMotion]);

  // ----------------------------------------------------
  // SCENE 2 TIMELINE: Sort into drawers
  // ----------------------------------------------------
  const playScene2 = useCallback(() => {
    if (!scene2Ref.current) return;
    tl2Ref.current?.kill();

    const root = scene2Ref.current;
    const drawers = root.querySelectorAll('.s2-drawer');
    const cards = root.querySelectorAll('.s2-card');
    const tags = root.querySelectorAll('.s2-tag');

    if (prefersReducedMotion) {
      gsap.set(drawers, { opacity: 1, x: 0 });
      gsap.set(cards, { opacity: 1, y: 0, scale: 1 });
      gsap.set(tags, { opacity: 1, scale: 1 });
      return;
    }

    const tl = gsap.timeline();
    tl2Ref.current = tl;

    // Reset states
    gsap.set(drawers, { opacity: 0.4, x: -16 });
    gsap.set(cards, { opacity: 0, x: -30, scale: 0.85 });
    gsap.set(tags, { opacity: 0, scale: 0.6 });

    // Drawers slide open
    tl.to(drawers, {
      opacity: 1,
      x: 0,
      duration: 0.45,
      stagger: 0.1,
      ease: 'power2.out',
    });

    // Cards fly to right drawer on curved paths
    tl.to(
      cards,
      {
        opacity: 1,
        x: 0,
        scale: 1,
        duration: 0.5,
        stagger: 0.12,
        ease: 'back.out(1.4)',
      },
      '-=0.2'
    );

    // Tag chips pop in
    tl.to(
      tags,
      {
        opacity: 1,
        scale: 1,
        duration: 0.35,
        stagger: 0.08,
        ease: 'back.out(2)',
      },
      '-=0.15'
    );
  }, [prefersReducedMotion]);

  // ----------------------------------------------------
  // SCENE 3 TIMELINE: Drop or copy anywhere
  // ----------------------------------------------------
  const playScene3 = useCallback(() => {
    if (!scene3Ref.current) return;
    tl3Ref.current?.kill();

    const root = scene3Ref.current;
    const card = root.querySelector('.s3-flying-card');
    const editor = root.querySelector('.s3-editor');
    const chatInput = root.querySelector('.s3-chat-input');
    const chatChip = root.querySelector('.s3-chat-chip');
    const codeLines = root.querySelectorAll('.s3-code-line');

    if (prefersReducedMotion) {
      gsap.set([editor, chatInput, chatChip], { opacity: 1, y: 0 });
      gsap.set(codeLines, { opacity: 1 });
      return;
    }

    const tl = gsap.timeline();
    tl3Ref.current = tl;

    // Reset states
    gsap.set(card, { opacity: 0, y: -20, x: 0, scale: 0.9 });
    gsap.set(codeLines, { opacity: 0, x: -6 });
    gsap.set(chatChip, { opacity: 0, scale: 0.7 });

    // Card lifts out and travels to editor
    tl.to(card, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.35,
      ease: 'power2.out',
    });

    // Code lines type out/reveal in editor
    tl.to(
      codeLines,
      {
        opacity: 1,
        x: 0,
        duration: 0.3,
        stagger: 0.08,
        ease: 'power1.out',
      },
      '+=0.1'
    );

    // Flips format to preview
    tl.to(card, {
      x: 18,
      y: 12,
      duration: 0.3,
      ease: 'power2.inOut',
    });

    // Attached chip lands in mock chat input
    tl.to(
      chatChip,
      {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        ease: 'back.out(1.8)',
      },
      '+=0.1'
    );
  }, [prefersReducedMotion]);

  // ----------------------------------------------------
  // MAIN SCROLLTRIGGER SETUP: One-shot scene triggers & two segment scrubbers
  // ----------------------------------------------------
  useEffect(() => {
    if (!sectionRef.current) return;
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test') {
      setFileCount(4);
      return;
    }

    const ctx = gsap.context(() => {
      // 1. One-shot scene enter triggers (start: "top 70%", once: true)
      if (panel1Ref.current) {
        ScrollTrigger.create({
          trigger: panel1Ref.current,
          start: 'top 70%',
          once: true,
          toggleActions: 'play none none none',
          onEnter: () => playScene1(),
        });
      }

      if (panel2Ref.current) {
        ScrollTrigger.create({
          trigger: panel2Ref.current,
          start: 'top 70%',
          once: true,
          toggleActions: 'play none none none',
          onEnter: () => playScene2(),
        });
      }

      if (panel3Ref.current) {
        ScrollTrigger.create({
          trigger: panel3Ref.current,
          start: 'top 70%',
          once: true,
          toggleActions: 'play none none none',
          onEnter: () => playScene3(),
        });
      }

      // 2. Scroll-linked drawing for Segment 1 & Segment 2 (THE ONLY SCRUB IN THIS SECTION)
      if (!prefersReducedMotion && sectionRef.current) {
        // SEGMENT 1 TRIGGER: Starts when start point reaches ~75% vh, ends when end point reaches ~50% vh
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: () => `top+=${geomRef.current.y1} 75%`,
          end: () => {
            const { y1, y2 } = geomRef.current;
            const vh = window.innerHeight;
            const naturalDist = (y2 - y1) + 0.25 * vh;
            const minDist = 0.35 * vh;
            const extra = naturalDist < minDist ? minDist - naturalDist : 0;
            return `top+=${y2 + extra} 50%`;
          },
          scrub: 0.6,
          onUpdate: (self) => {
            p1ProgressRef.current = self.progress;
            updateDrawingAndMarker();
          },
        });

        // SEGMENT 2 TRIGGER: Starts when start point reaches ~75% vh, ends when end point reaches ~50% vh
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: () => `top+=${geomRef.current.y2_bot} 75%`,
          end: () => {
            const { y2_bot, y3 } = geomRef.current;
            const vh = window.innerHeight;
            const naturalDist = (y3 - y2_bot) + 0.25 * vh;
            const minDist = 0.35 * vh;
            const extra = naturalDist < minDist ? minDist - naturalDist : 0;
            return `top+=${y3 + extra} 50%`;
          },
          scrub: 0.6,
          onUpdate: (self) => {
            p2ProgressRef.current = self.progress;
            updateDrawingAndMarker();
          },
        });
      }
    }, sectionRef);

    return () => {
      ctx.revert();
      tl1Ref.current?.kill();
      tl2Ref.current?.kill();
      tl3Ref.current?.kill();
    };
  }, [playScene1, playScene2, playScene3, prefersReducedMotion, updateDrawingAndMarker]);

  const handleCopy = () => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1500);
  };

  const formattedPreview = formatFileForCopy('CLAUDE.md', SAMPLE_MD_CONTENT, copyMode);

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="relative w-full pb-16 md:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 selection:bg-orange selection:text-forest"
      style={{
        paddingTop: 'clamp(180px, 14vw, 260px)',
        scrollMarginTop: 'clamp(160px, 13vw, 240px)',
      }}
    >
      {/* ================= CONNECTING RE-ANCHORED TWO-SEGMENT PATHS (Desktop only, NO PIN) ================= */}
      <div className="absolute inset-0 pointer-events-none hidden md:block overflow-visible z-0" aria-hidden="true">
        <svg
          className="w-full h-full overflow-visible"
          viewBox={`0 0 ${geometry.width} ${geometry.height}`}
          style={{ width: `${geometry.width}px`, height: `${geometry.height}px` }}
        >
          <defs>
            {/* Mask for Segment 1 drawing */}
            <mask id="hiw-mask-1" maskUnits="userSpaceOnUse">
              <path
                ref={mask1Ref}
                d={geometry.d1}
                fill="none"
                stroke="white"
                strokeWidth="10"
                strokeLinecap="round"
                style={{
                  strokeDasharray: geometry.len1 > 0 ? `${geometry.len1} ${geometry.len1}` : undefined,
                  strokeDashoffset: prefersReducedMotion ? 0 : geometry.len1,
                }}
              />
            </mask>

            {/* Mask for Segment 2 drawing */}
            <mask id="hiw-mask-2" maskUnits="userSpaceOnUse">
              <path
                ref={mask2Ref}
                d={geometry.d2}
                fill="none"
                stroke="white"
                strokeWidth="10"
                strokeLinecap="round"
                style={{
                  strokeDasharray: geometry.len2 > 0 ? `${geometry.len2} ${geometry.len2}` : undefined,
                  strokeDashoffset: prefersReducedMotion ? 0 : geometry.len2,
                }}
              />
            </mask>
          </defs>

          {/* Segment 1: Bottom center of panel 1 -> Top center of panel 2 */}
          {geometry.d1 && (
            <path
              id="hiw-line-1"
              ref={path1Ref}
              d={geometry.d1}
              fill="none"
              stroke="var(--orange)"
              strokeWidth="2.5"
              strokeOpacity="0.6"
              strokeDasharray="6 6"
              strokeLinecap="round"
              mask="url(#hiw-mask-1)"
            />
          )}

          {/* Segment 2: Bottom center of panel 2 -> Top center of panel 3 */}
          {geometry.d2 && (
            <path
              id="hiw-line-2"
              ref={path2Ref}
              d={geometry.d2}
              fill="none"
              stroke="var(--orange)"
              strokeWidth="2.5"
              strokeOpacity="0.6"
              strokeDasharray="6 6"
              strokeLinecap="round"
              mask="url(#hiw-mask-2)"
            />
          )}

          {/* Small end markers for Segment 1 (Solid orange dot at start, hollow ring at end) */}
          {geometry.d1 && (
            <g className="hiw-markers-1">
              <circle cx={geometry.x1} cy={geometry.y1} r="5" fill="var(--orange)" />
              <circle
                cx={geometry.x2}
                cy={geometry.y2}
                r="5"
                fill="var(--forest)"
                stroke="var(--orange)"
                strokeWidth="2"
              />
            </g>
          )}

          {/* Small end markers for Segment 2 (Solid orange dot at start, hollow ring at end) */}
          {geometry.d2 && (
            <g className="hiw-markers-2">
              <circle cx={geometry.x2_bot} cy={geometry.y2_bot} r="5" fill="var(--orange)" />
              <circle
                cx={geometry.x3}
                cy={geometry.y3}
                r="5"
                fill="var(--forest)"
                stroke="var(--orange)"
                strokeWidth="2"
              />
            </g>
          )}

          {/* Travelling marker: Small crate glyph riding along the leading edge */}
          <g
            ref={markerRef}
            id="hiw-marker"
            className="origin-center pointer-events-none"
            style={{ opacity: 0 }}
            aria-hidden="true"
          >
            <circle r="14" fill="var(--orange)" opacity="0.2" />
            <circle r="9" fill="var(--forest-dark)" stroke="var(--orange)" strokeWidth="1.5" />
            <image href="/logo.svg" x="-5.5" y="-5.5" width="11" height="11" />
          </g>
        </svg>
      </div>

      {/* ================= SIMPLE CLEAN HEADER ================= */}
      <div className="text-center mb-16 md:mb-24 relative z-10">
        <Pill className="mb-3">How it works</Pill>
        <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-ink tracking-tight">
          Drop, sort, drag out.
        </h2>
      </div>

      {/* ================= THREE FREE-SCROLLING SCENE ROWS ================= */}
      <div className="space-y-20 md:space-y-28 relative z-10">
        {/* ---------------------------------------------------- */}
        {/* ROW 1: Drop your markdown in (Text Left, Scene Right) */}
        {/* ---------------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center min-h-[58vh]">
          {/* Text Left */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full border-2 border-orange bg-cream-dim flex items-center justify-center font-display text-lg font-bold text-orange shadow-sm">
                1
              </div>
              <span className="font-display text-sm text-ink/70">
                Ingest
              </span>
            </div>
            <h3 className="font-display text-3xl sm:text-4xl text-ink tracking-tight">
              Drop your markdown in.
            </h3>
            <p className="text-base text-ink/80 mt-3 font-sans leading-relaxed">
              Drag CLAUDE.md, AGENTS.md, or entire folders into your browser. Indexed locally with zero servers.
            </p>
          </div>

          {/* Scene 1 Right */}
          <div className="lg:col-span-7">
            {/* Stable layout container for panel 1 */}
            <div ref={panel1Ref} data-panel="1" className="relative w-full">
              <div
                ref={scene1Ref}
                className="relative rounded-3xl bg-forest border-2 border-line-ink p-6 sm:p-8 text-cream shadow-card overflow-hidden group hover:-translate-y-1 transition-transform duration-300"
              >
                {/* Paper grain overlay inside panel */}
                <div className="absolute inset-0 bg-repeat opacity-15 pointer-events-none mix-blend-soft-light bg-[url('/textures/paper-fine.png')]" />

                {/* Replay Control */}
                <button
                  type="button"
                  onClick={playScene1}
                  aria-label="Replay scene 1"
                  title="Replay scene 1"
                  className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full border border-line/40 bg-forest-dark/80 text-cream/70 hover:text-orange hover:border-orange flex items-center justify-center transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Dashed Drop-Zone Arch with Crate at bottom */}
                <div className="relative border-2 border-dashed border-orange/60 rounded-3xl p-6 sm:p-8 bg-forest-dark/70 flex flex-col items-center text-center">
                  <span className="font-display text-xs text-orange mb-3">
                    Local-first drop target
                  </span>

                  {/* 4 Staggered Markdown Cards */}
                  <div className="grid grid-cols-2 gap-3 w-full max-w-sm mb-6">
                    {[
                      { name: 'CLAUDE.md', tag: 'memory' },
                      { name: 'AGENTS.md', tag: 'rules' },
                      { name: '.cursorrules', tag: 'cursor' },
                      { name: 'README.md', tag: 'starter' },
                    ].map((f) => (
                      <div
                        key={f.name}
                        className="s1-card p-3 rounded-xl bg-forest border border-line text-left shadow-sm flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <FileText className="w-3.5 h-3.5 text-orange shrink-0" />
                          <span className="font-display text-xs text-cream truncate">
                            {f.name}
                          </span>
                        </div>
                        <span className="text-[10px] text-orange/90 font-display shrink-0">
                          #{f.tag}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Crate with Ticking Counter */}
                  <div className="s1-crate flex items-center gap-3 pt-2 border-t border-line/30 w-full justify-center">
                    <img src="/logo.svg" alt="MDstash Crate" className="w-7 h-7 object-contain drop-shadow" />
                    <span className="s1-counter font-display text-sm tracking-tight text-cream">
                      {fileCount} {fileCount === 1 ? 'file' : 'files'} stashed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* ROW 2: Sort into drawers (Scene Left, Text Right)   */}
        {/* ---------------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center min-h-[58vh]">
          {/* Scene 2 Left on desktop */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            {/* Stable layout container for panel 2 */}
            <div ref={panel2Ref} data-panel="2" className="relative w-full">
              <div
                ref={scene2Ref}
                className="relative rounded-3xl bg-forest border-2 border-line-ink p-6 sm:p-8 text-cream shadow-card overflow-hidden group hover:-translate-y-1 transition-transform duration-300"
              >
                {/* Paper grain overlay inside panel */}
                <div className="absolute inset-0 bg-repeat opacity-15 pointer-events-none mix-blend-soft-light bg-[url('/textures/paper-fine.png')]" />

                {/* Replay Control */}
                <button
                  type="button"
                  onClick={playScene2}
                  aria-label="Replay scene 2"
                  title="Replay scene 2"
                  className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full border border-line/40 bg-forest-dark/80 text-cream/70 hover:text-orange hover:border-orange flex items-center justify-center transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* 3 Drawer Slots */}
                <div className="space-y-4 max-w-md mx-auto">
                  {/* Drawer 1: Agent rules (Orange tab) */}
                  <div className="s2-drawer p-4 rounded-2xl bg-forest-dark border-2 border-orange/80 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-orange text-forest text-xs font-display font-bold">
                        Agent rules
                      </span>
                      <span className="s2-tag font-display text-[11px] text-orange">
                        #claude
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <div className="s2-card px-3 py-1.5 rounded-lg bg-forest border border-line text-xs font-display text-cream flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-orange" />
                        <span>CLAUDE.md</span>
                      </div>
                      <div className="s2-card px-3 py-1.5 rounded-lg bg-forest border border-line text-xs font-display text-cream flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-orange" />
                        <span>AGENTS.md</span>
                      </div>
                    </div>
                  </div>

                  {/* Drawer 2: Prompts (Cream tab) */}
                  <div className="s2-drawer p-4 rounded-2xl bg-forest-dark border-2 border-cream/70 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-cream text-ink text-xs font-display font-bold">
                        Prompts
                      </span>
                      <span className="s2-tag font-display text-[11px] text-cream-dim">
                        #cursor
                      </span>
                    </div>
                    <div className="s2-card px-3 py-1.5 rounded-lg bg-forest border border-line text-xs font-display text-cream inline-flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-orange" />
                      <span>.cursorrules</span>
                    </div>
                  </div>

                  {/* Drawer 3: Notes (Sage-deep tab) */}
                  <div className="s2-drawer p-4 rounded-2xl bg-forest-dark border-2 border-sage-deep shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-sage-deep text-cream text-xs font-display font-bold">
                        Notes
                      </span>
                      <span className="s2-tag font-display text-[11px] text-orange">
                        #todo
                      </span>
                    </div>
                    <div className="s2-card px-3 py-1.5 rounded-lg bg-forest border border-line text-xs font-display text-cream inline-flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-orange" />
                      <span>README.md</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Text Right */}
          <div className="lg:col-span-5 flex flex-col justify-center order-1 lg:order-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full border-2 border-orange bg-cream-dim flex items-center justify-center font-display text-lg font-bold text-orange shadow-sm">
                2
              </div>
              <span className="font-display text-sm text-ink/70">
                Organize
              </span>
            </div>
            <h3 className="font-display text-3xl sm:text-4xl text-ink tracking-tight">
              Sort into drawers.
            </h3>
            <p className="text-base text-ink/80 mt-3 font-sans leading-relaxed">
              Organize files into color-coded collections for agent rules, system prompts, or starters. Tag and pin favorites.
            </p>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* ROW 3: Drop or copy anywhere (Text Left, Scene Right) */}
        {/* ---------------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center min-h-[58vh]">
          {/* Text Left */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full border-2 border-orange bg-cream-dim flex items-center justify-center font-display text-lg font-bold text-orange shadow-sm">
                3
              </div>
              <span className="font-display text-sm text-ink/70">
                Export
              </span>
            </div>
            <h3 className="font-display text-3xl sm:text-4xl text-ink tracking-tight">
              Drop or copy anywhere.
            </h3>
            <p className="text-base text-ink/80 mt-3 font-sans leading-relaxed">
              Drag any file straight into your IDE or AI chat. Switch between raw markdown, code block, and prompt-ready headers.
            </p>
          </div>

          {/* Scene 3 Right */}
          <div className="lg:col-span-7">
            {/* Stable layout container for panel 3 */}
            <div ref={panel3Ref} data-panel="3" className="relative w-full">
              <div
                ref={scene3Ref}
                className="relative rounded-3xl bg-forest border-2 border-line-ink p-6 sm:p-8 text-cream shadow-card overflow-hidden group hover:-translate-y-1 transition-transform duration-300"
              >
                {/* Paper grain overlay inside panel */}
                <div className="absolute inset-0 bg-repeat opacity-15 pointer-events-none mix-blend-soft-light bg-[url('/textures/paper-fine.png')]" />

                {/* Replay Control */}
                <button
                  type="button"
                  onClick={playScene3}
                  aria-label="Replay scene 3"
                  title="Replay scene 3"
                  className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full border border-line/40 bg-forest-dark/80 text-cream/70 hover:text-orange hover:border-orange flex items-center justify-center transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <div className="space-y-4 max-w-md mx-auto">
                  {/* Mock Editor Window (with cream outlined dots, NO red/yellow/green!) */}
                  <div className="s3-editor rounded-2xl bg-forest-dark border border-line overflow-hidden shadow-sm">
                    {/* Editor Title Bar */}
                    <div className="px-4 py-2.5 bg-forest border-b border-line flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {/* Cream outlined window dots */}
                        <div className="flex items-center gap-1.5" aria-hidden="true">
                          <span className="w-2.5 h-2.5 rounded-full border border-cream/70 bg-transparent" />
                          <span className="w-2.5 h-2.5 rounded-full border border-cream/70 bg-transparent" />
                          <span className="w-2.5 h-2.5 rounded-full border border-cream/70 bg-transparent" />
                        </div>
                        <span className="s3-flying-card font-display text-xs text-cream ml-2">
                          CLAUDE.md
                        </span>
                      </div>

                      {/* Three-way interactive format toggle */}
                      <div className="flex items-center gap-1 bg-forest-dark p-0.5 rounded-lg border border-line/50">
                        {(['raw', 'codeblock', 'prompt'] as const).map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setCopyMode(m)}
                            className={`px-2 py-0.5 rounded text-[11px] font-display transition-colors cursor-pointer ${
                              copyMode === m
                                ? 'bg-orange text-forest font-bold shadow-xs'
                                : 'text-cream/70 hover:text-cream'
                            }`}
                          >
                            {m === 'codeblock' ? 'code block' : m}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Window Code Content (uses real formatFileForCopy!) */}
                    <div className="p-4 font-mono text-xs leading-relaxed text-cream-dim max-h-36 overflow-y-auto">
                      <pre className="whitespace-pre-wrap font-mono">
                        {formattedPreview.split('\n').map((line, idx) => (
                          <span key={idx} className="s3-code-line block">
                            {line}
                          </span>
                        ))}
                      </pre>
                    </div>
                  </div>

                  {/* Mock Chat Input Window */}
                  <div className="s3-chat-input p-3.5 rounded-2xl bg-cream border border-line-ink shadow-sm flex items-center justify-between gap-3 text-ink">
                    <div className="flex items-center gap-2 truncate">
                      <Sparkles className="w-4 h-4 text-orange shrink-0" />
                      {/* Chat Chip landing in input */}
                      <span className="s3-chat-chip inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-forest text-cream font-display text-xs shrink-0">
                        <FileText className="w-3 h-3 text-orange" />
                        CLAUDE.md
                      </span>
                      <span className="text-xs font-sans text-ink/75 truncate hidden sm:inline">
                        Ask anything with prompt context...
                      </span>
                    </div>

                    {/* Copy Button */}
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="shrink-0 px-3.5 py-1.5 rounded-full bg-orange hover:bg-orange-deep text-forest font-display text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm active:scale-95"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'Copied!' : 'Copy format'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
