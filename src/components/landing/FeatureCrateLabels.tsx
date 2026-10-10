import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Layers, Copy, Search, History, Wifi, WifiOff, Check } from 'lucide-react';
import gsap from 'gsap';
import { Pill } from '../ui/Pill';

export const FeatureCrateLabels: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const set1Ref = useRef<HTMLDivElement>(null);

  // Marquee tween reference
  const marqueeTweenRef = useRef<gsap.core.Tween | null>(null);

  // Pause states
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const isManuallyPausedRef = useRef(false);
  isManuallyPausedRef.current = isManuallyPaused;

  const isHoveredRef = useRef(false);
  const isFocusedRef = useRef(false);
  const isSectionInViewRef = useRef(true);

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

  // Responsive mobile check
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Card demo timeline references (interactive set 1)
  const tl1Ref = useRef<gsap.core.Timeline | null>(null);
  const tl2Ref = useRef<gsap.core.Timeline | null>(null);
  const tl3Ref = useRef<gsap.core.Timeline | null>(null);
  const tl4Ref = useRef<gsap.core.Timeline | null>(null);
  const tl5Ref = useRef<gsap.core.Timeline | null>(null);

  // Card interactive states
  const [userCopyMode, setUserCopyMode] = useState<'raw' | 'code' | 'prompt'>('prompt');
  const [userCopied, setUserCopied] = useState(false);

  const [userSearchQuery, setUserSearchQuery] = useState('agent');
  const searchItems = [
    { name: 'CLAUDE.md', tag: 'agent-rules', desc: 'Project instructions' },
    { name: 'AGENTS.md', tag: 'agent-rules', desc: 'Multi-agent system prompt' },
    { name: 'api-notes.md', tag: 'notes', desc: 'REST endpoints spec' },
    { name: 'prompts.md', tag: 'prompts', desc: 'Draft system instructions' },
  ];
  const filteredSearch = searchItems.filter(
    (item) =>
      item.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      item.tag.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  const [userVersionIndex, setUserVersionIndex] = useState(2);
  const versions = [
    { ver: 'v1.0', time: '10 mins ago', text: '# Rules (Initial draft)\n- Be concise' },
    { ver: 'v1.1', time: '5 mins ago', text: '# Rules\n- Be concise\n- Follow tokens' },
    { ver: 'v1.2', time: 'Just now', text: '# Rules\n- Be concise\n- Follow tokens\n- Local first' },
  ];

  const [userOffline, setUserOffline] = useState(false);

  const isTestEnv = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';

  // ----------------------------------------------------
  // MARQUEE DRIVER SETUP
  // ----------------------------------------------------
  const updateMarqueeSpeed = useCallback(() => {
    if (prefersReducedMotion || !trackRef.current || !set1Ref.current) return;

    marqueeTweenRef.current?.kill();

    const setWidth = set1Ref.current.offsetWidth || 1920;
    const targetSpeed = isMobile ? 30 : 45; // px per second
    const duration = setWidth / targetSpeed;

    // Set initial position
    gsap.set(trackRef.current, { x: 0 });

    // Single time-based GSAP tween from 0 to -setWidth for seamless loop
    const tween = gsap.to(trackRef.current, {
      x: -setWidth,
      duration,
      ease: 'none',
      repeat: -1,
      paused: isManuallyPausedRef.current,
    });

    marqueeTweenRef.current = tween;
  }, [isMobile, prefersReducedMotion]);

  useEffect(() => {
    updateMarqueeSpeed();
    const handleResize = () => updateMarqueeSpeed();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      marqueeTweenRef.current?.kill();
    };
  }, [updateMarqueeSpeed]);

  // Pause / Resume smooth easing helpers
  const easeMarqueeSpeed = useCallback((targetScale: number) => {
    const tween = marqueeTweenRef.current;
    if (!tween) return;
    gsap.to(tween, {
      timeScale: targetScale,
      duration: 0.4,
      ease: 'power2.out',
    });
  }, []);

  // Hover & Focus handlers
  const handleMouseEnter = () => {
    isHoveredRef.current = true;
    if (!isManuallyPausedRef.current) {
      easeMarqueeSpeed(0);
    }
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
    if (!isManuallyPausedRef.current && !isFocusedRef.current) {
      easeMarqueeSpeed(1);
    }
  };

  const handleFocus = () => {
    isFocusedRef.current = true;
    if (!isManuallyPausedRef.current) {
      easeMarqueeSpeed(0);
    }
  };

  const handleBlur = () => {
    isFocusedRef.current = false;
    if (!isManuallyPausedRef.current && !isHoveredRef.current) {
      easeMarqueeSpeed(1);
    }
  };

  // Toggle button handler
  const handleTogglePause = () => {
    setIsManuallyPaused((prev) => {
      const next = !prev;
      isManuallyPausedRef.current = next;
      if (next) {
        easeMarqueeSpeed(0);
      } else {
        easeMarqueeSpeed(1);
      }
      return next;
    });
  };

  // Shared IntersectionObserver & Document visibility
  useEffect(() => {
    if (!sectionRef.current) return;

    const pauseAll = () => {
      marqueeTweenRef.current?.pause();
      tl1Ref.current?.pause();
      tl2Ref.current?.pause();
      tl3Ref.current?.pause();
      tl4Ref.current?.pause();
      tl5Ref.current?.pause();
    };

    const resumeAll = () => {
      if (!isManuallyPausedRef.current) {
        marqueeTweenRef.current?.play();
      }
      tl1Ref.current?.play();
      tl2Ref.current?.play();
      tl3Ref.current?.play();
      tl4Ref.current?.play();
      tl5Ref.current?.play();
    };

    let unsubscribe: (() => void) | null = null;
    import('../../utils/sharedAnimationObserver').then(({ observeAnimationVisibility }) => {
      if (!sectionRef.current) return;
      unsubscribe = observeAnimationVisibility(sectionRef.current, (inView) => {
        isSectionInViewRef.current = inView;
        if (inView) {
          resumeAll();
        } else {
          pauseAll();
        }
      });
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // ----------------------------------------------------
  // INDEPENDENT CARD ANIMATION TIMELINES
  // ----------------------------------------------------
  useEffect(() => {
    if (prefersReducedMotion || !trackRef.current || isTestEnv) return;

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(trackRef.current!);

      const updateAllText = (selector: string, text: string) => {
        q(selector).forEach((el: Element) => {
          (el as HTMLElement).textContent = text;
        });
      };

      // --------------------------------------------------
      // Card 1: The Binder (Loop ~6.5s, rest ~1.4s)
      // --------------------------------------------------
      const c1_c1 = q('.card1-file-1');
      const c1_c2 = q('.card1-file-2');
      const c1_c3 = q('.card1-file-3');
      const c1_chip = q('.card1-bundle-chip');

      if (c1_c1.length && c1_c2.length && c1_c3.length && c1_chip.length) {
        const tl1 = gsap.timeline({ repeat: -1, repeatDelay: 1.4 });
        tl1Ref.current = tl1;

        tl1.to({}, { duration: 0.8 });

        // Slide together and collapse into bundle (0.9s power3.inOut)
        tl1.to(
          c1_c1,
          { y: 0, rotate: 0, scale: 0.95, opacity: 0.45, duration: 0.9, ease: 'power3.inOut' },
          'collapse'
        );
        tl1.to(
          c1_c2,
          { y: 0, rotate: 0, scale: 0.98, opacity: 0.75, duration: 0.9, ease: 'power3.inOut' },
          'collapse'
        );
        tl1.to(
          c1_c3,
          { y: 0, rotate: 0, scale: 1.0, duration: 0.9, ease: 'power3.inOut' },
          'collapse'
        );

        // "Bundled" check chip pops in (back.out)
        tl1.to(c1_chip, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' }, '-=0.1');

        tl1.to({}, { duration: 1.1 });

        // Chip fades and stack fans back out smoothly (0.8s power3.inOut)
        tl1.to(c1_chip, { opacity: 0, scale: 0.8, duration: 0.3, ease: 'power2.in' }, 'fanout');
        tl1.to(
          c1_c1,
          { y: -16, rotate: -6, scale: 1, opacity: 1, duration: 0.8, ease: 'power3.inOut' },
          'fanout'
        );
        tl1.to(
          c1_c2,
          { y: 0, rotate: 0, scale: 1, opacity: 1, duration: 0.8, ease: 'power3.inOut' },
          'fanout'
        );
        tl1.to(
          c1_c3,
          { y: 16, rotate: 6, scale: 1, opacity: 1, duration: 0.8, ease: 'power3.inOut' },
          'fanout'
        );

        tl1.time(1.2);
      }

      // --------------------------------------------------
      // Card 2: The Polyglot (Loop ~8.0s, rest ~1.8s)
      // --------------------------------------------------
      const c2_indicator = q('.card2-segment-indicator');
      const c2_textRaw = q('.card2-text-raw');
      const c2_textCode = q('.card2-text-code');
      const c2_textPrompt = q('.card2-text-prompt');
      const c2_copyBtn = q('.card2-copy-btn');

      if (c2_indicator.length && c2_textRaw.length && c2_textCode.length && c2_textPrompt.length && c2_copyBtn.length) {
        const tl2 = gsap.timeline({ repeat: -1, repeatDelay: 1.8 });
        tl2Ref.current = tl2;

        tl2.to({}, { duration: 0.8 });

        // Slide to Code
        tl2.to(c2_indicator, { xPercent: 100, duration: 0.45, ease: 'power2.inOut' }, 'toCode');
        tl2.to(c2_textRaw, { opacity: 0, duration: 0.2 }, 'toCode');
        tl2.to(c2_textCode, { opacity: 1, duration: 0.3 }, 'toCode+=0.15');

        tl2.to({}, { duration: 1.1 });

        // Slide to Prompt
        tl2.to(c2_indicator, { xPercent: 200, duration: 0.45, ease: 'power2.inOut' }, 'toPrompt');
        tl2.to(c2_textCode, { opacity: 0, duration: 0.2 }, 'toPrompt');
        tl2.to(c2_textPrompt, { opacity: 1, duration: 0.3 }, 'toPrompt+=0.15');

        tl2.to({}, { duration: 0.8 });

        // Copy button dip down and turn to "Copied!"
        tl2.to(c2_copyBtn, { scale: 0.94, duration: 0.15, ease: 'power2.in' }, 'click');
        tl2.to(c2_copyBtn, { scale: 1.0, duration: 0.25, ease: 'back.out(2)' }, 'click+=0.15');
        tl2.call(() => {
          updateAllText('.card2-copy-text', 'Copied to clipboard!');
        });

        tl2.to({}, { duration: 1.3 });

        tl2.call(() => {
          updateAllText('.card2-copy-text', 'Copy as prompt');
        });
        tl2.to(c2_indicator, { xPercent: 0, duration: 0.5, ease: 'power2.inOut' }, 'reset');
        tl2.to(c2_textPrompt, { opacity: 0, duration: 0.2 }, 'reset');
        tl2.to(c2_textRaw, { opacity: 1, duration: 0.3 }, 'reset+=0.2');

        tl2.time(2.4);
      }

      // --------------------------------------------------
      // Card 3: The Hound (Loop ~8.5s, rest ~1.5s)
      // --------------------------------------------------
      const c3_match1 = q('.card3-match-1');
      const c3_nonMatch1 = q('.card3-nonmatch-1');
      const c3_tagChip = q('.card3-tag-chip');

      if (c3_match1.length && c3_nonMatch1.length && c3_tagChip.length) {
        const tl3 = gsap.timeline({ repeat: -1, repeatDelay: 1.5 });
        tl3Ref.current = tl3;

        tl3.to({}, { duration: 0.8 });

        // Type "agent" letter by letter
        const letters = ['a', 'ag', 'age', 'agen', 'agent'];
        letters.forEach((l, idx) => {
          tl3.call(() => {
            updateAllText('.card3-search-text', l);
          });
          tl3.to({}, { duration: 0.22 });
          if (idx === 2) {
            tl3.to(
              c3_nonMatch1,
              { opacity: 0, height: 0, marginTop: 0, marginBottom: 0, duration: 0.35, ease: 'power2.inOut' },
              '<'
            );
          }
        });

        tl3.to(c3_tagChip, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2)' });
        tl3.to({}, { duration: 1.4 });

        // Backspace
        const backspaces = ['agen', 'age', 'ag', 'a', ''];
        backspaces.forEach((l) => {
          tl3.call(() => {
            updateAllText('.card3-search-text', l);
          });
          tl3.to({}, { duration: 0.18 });
        });

        tl3.to(c3_tagChip, { opacity: 0, scale: 0.7, duration: 0.25 }, 'restore');
        tl3.to(
          c3_nonMatch1,
          { opacity: 1, height: 'auto', duration: 0.4, ease: 'power2.out' },
          'restore'
        );

        tl3.time(4.2);
      }

      // --------------------------------------------------
      // Card 4: The Time Machine (Loop ~7.5s, rest ~1.6s)
      // --------------------------------------------------
      const c4_scrubber = q('.card4-scrubber-handle');
      const c4_badge = q('.card4-restored-badge');

      if (c4_scrubber.length && c4_badge.length) {
        const tl4 = gsap.timeline({ repeat: -1, repeatDelay: 1.6 });
        tl4Ref.current = tl4;

        tl4.to({}, { duration: 0.8 });

        // Slide left to v1.1
        tl4.to(c4_scrubber, { left: '50%', duration: 0.6, ease: 'power2.inOut' }, 'to11');
        tl4.call(() => {
          updateAllText('.card4-ver-label', 'v1.1');
          updateAllText('.card4-time-label', '5 mins ago');
          updateAllText('.card4-preview-text', '# Rules\n- Be concise\n- Follow tokens');
        });

        tl4.to({}, { duration: 0.8 });

        // Slide left to v1.0
        tl4.to(c4_scrubber, { left: '0%', duration: 0.6, ease: 'power2.inOut' }, 'to10');
        tl4.call(() => {
          updateAllText('.card4-ver-label', 'v1.0');
          updateAllText('.card4-time-label', '10 mins ago');
          updateAllText('.card4-preview-text', '# Rules (Initial draft)\n- Be concise');
        });

        tl4.to(c4_badge, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2)' }, 'pulse');
        tl4.to({}, { duration: 1.2 });

        // Return to v1.2
        tl4.to(c4_badge, { opacity: 0, scale: 0.8, duration: 0.25 }, 'return');
        tl4.to(c4_scrubber, { left: '100%', duration: 0.8, ease: 'power3.inOut' }, 'return');
        tl4.call(() => {
          updateAllText('.card4-ver-label', 'v1.2');
          updateAllText('.card4-time-label', 'Just now');
          updateAllText('.card4-preview-text', '# Rules\n- Be concise\n- Follow tokens\n- Local first');
        });

        tl4.time(1.8);
      }

      // --------------------------------------------------
      // Card 5: The Hermit (Loop ~8.2s, rest ~1.7s)
      // --------------------------------------------------
      const c5_wifiOn = q('.card5-wifi-on');
      const c5_wifiOff = q('.card5-wifi-off');
      const c5_savedFile = q('.card5-saved-file');
      const c5_confirmBadge = q('.card5-confirm-badge');

      if (c5_wifiOn.length && c5_wifiOff.length && c5_savedFile.length && c5_confirmBadge.length) {
        const tl5 = gsap.timeline({ repeat: -1, repeatDelay: 1.7 });
        tl5Ref.current = tl5;

        tl5.to({}, { duration: 0.8 });

        // Wifi cuts out -> offline chip appears
        tl5.to(c5_wifiOn, { opacity: 0, scale: 0.7, duration: 0.25 }, 'cut');
        tl5.to(c5_wifiOff, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2)' }, 'cut');
        tl5.call(() => {
          q('.card5-status-chip').forEach((el: Element) => {
            const h = el as HTMLElement;
            h.textContent = 'Airplane Mode';
            h.className =
              'card5-status-chip text-[9px] font-display px-2 py-0.5 rounded-full font-bold border border-orange bg-orange/20 text-orange-deep';
          });
        });

        tl5.to({}, { duration: 0.7 });

        // File draft.md drops into crate
        tl5.to(c5_savedFile, { opacity: 1, y: 0, duration: 0.45, ease: 'back.out(1.8)' }, 'save');
        tl5.to(c5_confirmBadge, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' }, '+=0.2');

        tl5.to({}, { duration: 1.4 });

        // Restore
        tl5.to(c5_confirmBadge, { opacity: 0, scale: 0.8, duration: 0.25 }, 'restore');
        tl5.to(c5_savedFile, { opacity: 0, y: -6, duration: 0.3 }, 'restore');
        tl5.to(c5_wifiOff, { opacity: 0, scale: 0.7, duration: 0.25 }, 'restore');
        tl5.to(c5_wifiOn, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(1.5)' }, 'restore+=0.1');
        tl5.call(() => {
          q('.card5-status-chip').forEach((el: Element) => {
            const h = el as HTMLElement;
            h.textContent = 'Online';
            h.className =
              'card5-status-chip text-[9px] font-display px-2 py-0.5 rounded-full font-bold border border-sage bg-sage/20 text-forest';
          });
        });

        tl5.time(3.1);
      }
    }, trackRef.current);

    return () => {
      ctx.revert();
      tl1Ref.current?.kill();
      tl2Ref.current?.kill();
      tl3Ref.current?.kill();
      tl4Ref.current?.kill();
      tl5Ref.current?.kill();
    };
  }, [prefersReducedMotion, isTestEnv]);

  // Card Content Renderer (reusable for Set 1, 2, and 3)
  const renderCardSet = (isClone: boolean) => {
    return (
      <>
        {/* ================= CARD 1: THE BINDER ================= */}
        <div
          data-card="1"
          className="min-w-[320px] sm:min-w-[360px] max-w-[360px] shrink-0 rounded-2xl bg-cream-dim/70 border-2 border-line-ink p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group select-none"
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-orange/10 rounded-bl-full pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-display text-orange bg-orange/10 px-2.5 py-0.5 rounded-full border border-orange/20">
                Label no. 01
              </span>
              <Layers className="w-5 h-5 text-ink/60" />
            </div>
            <h3 className="font-display text-2xl text-ink">The Binder</h3>
            <p className="text-xs text-ink/80 mt-1 font-sans">
              Stack multiple files into a single prompt block ready for context windows.
            </p>
          </div>

          {/* Demo 1: Collapsing Bundle Loop */}
          <div className="my-5 p-4 rounded-xl bg-cream border border-line-ink/60 h-[152px] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="relative w-full flex items-center justify-center h-20">
              <div
                className={`card1-file-1 absolute w-36 py-1.5 px-3 rounded-lg bg-forest text-cream font-mono text-[10px] border border-cream/20 shadow will-change-transform ${
                  prefersReducedMotion ? 'translate-y-0 scale-95 opacity-50' : '-translate-y-4 -rotate-6'
                }`}
              >
                CLAUDE.md
              </div>
              <div
                className={`card1-file-2 absolute w-36 py-1.5 px-3 rounded-lg bg-sage text-cream font-mono text-[10px] border border-cream/20 shadow will-change-transform ${
                  prefersReducedMotion ? 'translate-y-0 scale-98 opacity-75' : 'translate-y-0 rotate-0'
                }`}
              >
                rules.md
              </div>
              <div
                className={`card1-file-3 absolute w-36 py-1.5 px-3 rounded-lg bg-orange text-forest font-mono text-[10px] font-bold border border-forest/20 shadow will-change-transform ${
                  prefersReducedMotion ? 'translate-y-0 scale-100 ring-2 ring-forest' : 'translate-y-4 rotate-6'
                }`}
              >
                context.md
              </div>
            </div>

            {/* Check chip popping in */}
            <div
              className={`card1-bundle-chip absolute bottom-3 px-2.5 py-0.5 rounded-full bg-forest text-cream text-[10px] font-display flex items-center gap-1 shadow-sm transition-opacity ${
                prefersReducedMotion ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
              }`}
            >
              <Check className="w-3 h-3 text-orange" />
              <span>Bundled context ready</span>
            </div>
          </div>

          <div className="text-xs font-display text-ink/75 border-t border-line-ink/30 pt-3">
            <span className="font-display text-ink">Zero copy-paste fragmentation</span>
          </div>
        </div>

        {/* ================= CARD 2: THE POLYGLOT ================= */}
        <div
          data-card="2"
          className="min-w-[320px] sm:min-w-[360px] max-w-[360px] shrink-0 rounded-2xl bg-cream-dim/70 border-2 border-line-ink p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden select-none"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-display text-orange bg-orange/10 px-2.5 py-0.5 rounded-full border border-orange/20">
                Label no. 02
              </span>
              <Copy className="w-5 h-5 text-ink/60" />
            </div>
            <h3 className="font-display text-2xl text-ink">The Polyglot</h3>
            <p className="text-xs text-ink/80 mt-1 font-sans">
              Toggle raw text, markdown fences, or full prompt wrappers before pasting.
            </p>
          </div>

          {/* Demo 2: Sliding Format Control Loop */}
          <div className="my-5 p-4 rounded-xl bg-cream border border-line-ink/60 h-[152px] flex flex-col justify-between relative overflow-hidden">
            {/* Segmented control bar */}
            <div className="relative flex rounded-lg bg-cream-dim p-0.5 border border-line-ink/40 overflow-hidden">
              <div
                className={`card2-segment-indicator absolute top-0.5 bottom-0.5 left-0.5 w-[calc(33.33%-1px)] rounded bg-ink shadow-sm transition-transform duration-200 ${
                  prefersReducedMotion ? 'xPercent-200' : ''
                }`}
              />
              {(['raw', 'code', 'prompt'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  tabIndex={isClone ? -1 : 0}
                  onClick={() => setUserCopyMode(m)}
                  className={`relative z-10 flex-1 py-1 text-[10px] font-display capitalize text-center transition-colors ${
                    userCopyMode === m ? 'text-cream font-bold' : 'text-ink/80 hover:text-ink'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Crossfading Preview Text */}
            <div className="relative h-10 my-1 font-mono text-[10px] text-ink/85 p-2 bg-cream-dim/60 rounded border border-line-ink/20 overflow-hidden">
              {isTestEnv ? (
                <span className="truncate block">
                  {userCopyMode === 'raw' && 'You are an expert engineer.'}
                  {userCopyMode === 'code' && '```markdown\n# CLAUDE.md\nYou are...'}
                  {userCopyMode === 'prompt' && '<system>\nYou are an expert...</system>'}
                </span>
              ) : (
                <>
                  <span className="card2-text-raw absolute inset-2 truncate opacity-100">
                    You are an expert engineer.
                  </span>
                  <span className="card2-text-code absolute inset-2 truncate opacity-0 font-mono">
                    ```markdown
# CLAUDE.md
You are an expert engineer.
                  </span>
                  <span className="card2-text-prompt absolute inset-2 truncate opacity-0 font-mono">
                    ### File: CLAUDE.md
You are an expert engineer.
                  </span>
                </>
              )}
            </div>

            {/* Copy Button */}
            <button
              type="button"
              tabIndex={isClone ? -1 : 0}
              onClick={() => {
                setUserCopied(true);
                setTimeout(() => setUserCopied(false), 1200);
              }}
              className="card2-copy-btn w-full py-1.5 px-2 rounded-lg bg-orange hover:bg-orange-deep text-forest font-display text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Copy className="w-3 h-3" />
              <span className="card2-copy-text">
                {userCopied ? 'Copied to clipboard!' : `Copy as ${userCopyMode}`}
              </span>
            </button>
          </div>

          <div className="text-xs font-display text-ink/75 border-t border-line-ink/30 pt-3">
            <span className="font-display text-ink">Ready for every chat prompt</span>
          </div>
        </div>

        {/* ================= CARD 3: THE HOUND ================= */}
        <div
          data-card="3"
          className="min-w-[320px] sm:min-w-[360px] max-w-[360px] shrink-0 rounded-2xl bg-cream-dim/70 border-2 border-line-ink p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden select-none"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-display text-orange bg-orange/10 px-2.5 py-0.5 rounded-full border border-orange/20">
                Label no. 03
              </span>
              <Search className="w-5 h-5 text-ink/60" />
            </div>
            <h3 className="font-display text-2xl text-ink">The Hound</h3>
            <p className="text-xs text-ink/80 mt-1 font-sans">
              Fuzzy instant lookup as fast as you strike keys. Filter by tags or filenames.
            </p>
          </div>

          {/* Demo 3: Live Typing & Filtering Loop */}
          <div className="my-5 p-4 rounded-xl bg-cream border border-line-ink/60 h-[152px] flex flex-col justify-between relative overflow-hidden">
            {/* Search Input */}
            <div className="relative flex items-center bg-cream-dim border border-line-ink/60 rounded px-2 py-1 text-[11px] font-mono text-ink">
              <Search className="w-3.5 h-3.5 text-ink/50 mr-1.5 shrink-0" />
              {isTestEnv ? (
                <input
                  type="text"
                  tabIndex={isClone ? -1 : 0}
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Type to filter..."
                  className="w-full bg-transparent border-none outline-none font-mono text-[11px] text-ink font-bold"
                  aria-label="Type to filter..."
                />
              ) : (
                <>
                  <span className="card3-search-text truncate font-mono text-ink font-bold">
                    {prefersReducedMotion ? 'agent' : ''}
                  </span>
                  <span className="card3-caret w-0.5 h-3.5 bg-orange ml-0.5 animate-pulse" />
                  <input
                    type="text"
                    tabIndex={isClone ? -1 : 0}
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Type to filter..."
                    className="sr-only"
                    aria-label="Type to filter..."
                  />
                </>
              )}
            </div>

            {/* Results Rows */}
            <div className="space-y-1.5 my-1 overflow-hidden min-h-[48px]">
              {isTestEnv ? (
                filteredSearch.slice(0, 2).map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between p-1 rounded bg-cream-dim/60 border border-line-ink/20 text-[10px] font-mono"
                  >
                    <span className="font-bold text-ink">{item.name}</span>
                    <span className="text-orange bg-orange/10 px-1 rounded text-[9px] font-display">
                      #{item.tag}
                    </span>
                  </div>
                ))
              ) : (
                <>
                  <div className="card3-match-1 flex items-center justify-between p-1 rounded bg-cream-dim/60 border border-line-ink/20 text-[10px] font-mono">
                    <span className="font-bold text-ink">
                      CL<span className="text-orange">AUDE</span>.md
                    </span>
                    <span className="text-orange bg-orange/10 px-1 rounded text-[9px] font-display">
                      #agent-rules
                    </span>
                  </div>
                  <div className="card3-nonmatch-1 flex items-center justify-between p-1 rounded bg-cream-dim/30 border border-line-ink/10 text-[10px] font-mono">
                    <span className="text-ink/60">api-notes.md</span>
                    <span className="text-ink/50 bg-line-ink/10 px-1 rounded text-[9px] font-display">
                      #notes
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Filter Tags */}
            <div className="flex items-center justify-between pt-1 border-t border-line-ink/20">
              <div className="flex gap-1">
                <span className="card3-tag-chip opacity-0 text-[9px] font-display px-1.5 py-0.5 rounded bg-orange text-forest font-bold">
                  #agent
                </span>
                <span className="text-[9px] font-display px-1.5 py-0.5 rounded bg-cream-dim border border-line-ink/30 text-ink/70">
                  #notes
                </span>
              </div>
              <span className="text-[9px] font-display text-ink/60">0.4ms index</span>
            </div>
          </div>

          <div className="text-xs font-display text-ink/75 border-t border-line-ink/30 pt-3">
            <span className="font-display text-ink">Sub-millisecond fuzzy search</span>
          </div>
        </div>

        {/* ================= CARD 4: THE TIME MACHINE ================= */}
        <div
          data-card="4"
          className="min-w-[320px] sm:min-w-[360px] max-w-[360px] shrink-0 rounded-2xl bg-cream-dim/70 border-2 border-line-ink p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden select-none"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-display text-orange bg-orange/10 px-2.5 py-0.5 rounded-full border border-orange/20">
                Label no. 04
              </span>
              <History className="w-5 h-5 text-ink/60" />
            </div>
            <h3 className="font-display text-2xl text-ink">The Time Machine</h3>
            <p className="text-xs text-ink/80 mt-1 font-sans">
              Automatic snapshots on every edit. Scrub through revisions and restore in one tap.
            </p>
          </div>

          {/* Demo 4: Scrubber & Version Replay Loop */}
          <div className="my-5 p-4 rounded-xl bg-cream border border-line-ink/60 h-[152px] flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between text-[11px] font-display">
              <span className="card4-ver-label font-bold text-orange">
                {versions[userVersionIndex].ver}
              </span>
              <span className="card4-time-label text-ink/60 text-[10px]">
                {versions[userVersionIndex].time}
              </span>
            </div>

            {/* Code content changing per version */}
            <div className="p-2 rounded bg-forest text-cream font-mono text-[9px] whitespace-pre-line leading-relaxed h-[54px] overflow-hidden relative">
              <span className="card4-preview-text block">
                {versions[userVersionIndex].text}
              </span>
              <span className="card4-restored-badge absolute top-1.5 right-1.5 px-2 py-0.5 rounded bg-orange text-forest font-display text-[9px] font-bold opacity-0 shadow-sm flex items-center gap-1">
                <Check className="w-2.5 h-2.5" /> Restored
              </span>
            </div>

            {/* Scrubber track */}
            <div className="relative pt-1">
              <div className="w-full h-1.5 bg-cream-dim border border-line-ink/40 rounded-full relative">
                <div
                  className="card4-scrubber-handle absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-orange border-2 border-forest shadow cursor-pointer will-change-transform"
                  style={{
                    left: `${(userVersionIndex / 2) * 100}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[9px] font-display text-ink/60 mt-1">
                <span>v1.0 (Initial)</span>
                <span>v1.1</span>
                <span>v1.2 (Current)</span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                tabIndex={isClone ? -1 : 0}
                value={userVersionIndex}
                onChange={(e) => setUserVersionIndex(Number(e.target.value))}
                className="sr-only"
                aria-label="Version history slider"
              />
            </div>
          </div>

          <div className="text-xs font-display text-ink/75 border-t border-line-ink/30 pt-3">
            <span className="font-display text-ink">Zero lost changes, ever</span>
          </div>
        </div>

        {/* ================= CARD 5: THE HERMIT ================= */}
        <div
          data-card="5"
          className="min-w-[320px] sm:min-w-[360px] max-w-[360px] shrink-0 rounded-2xl bg-cream-dim/70 border-2 border-line-ink p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden select-none"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-display text-orange bg-orange/10 px-2.5 py-0.5 rounded-full border border-orange/20">
                Label no. 05
              </span>
              <div className="relative w-5 h-5 flex items-center justify-center">
                <Wifi className="card5-wifi-on w-5 h-5 text-ink/60 absolute inset-0" />
                <WifiOff className="card5-wifi-off w-5 h-5 text-orange absolute inset-0 opacity-0" />
              </div>
            </div>
            <h3 className="font-display text-2xl text-ink">The Hermit</h3>
            <p className="text-xs text-ink/80 mt-1 font-sans">
              Zero internet connection required. Offline PWA and browser IndexedDB storage.
            </p>
          </div>

          {/* Demo 5: Wifi Cut & Local Saved Loop */}
          <div className="my-5 p-4 rounded-xl bg-cream border border-line-ink/60 h-[152px] flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-display text-ink/80">Network Status:</span>
              <button
                type="button"
                tabIndex={isClone ? -1 : 0}
                onClick={() => setUserOffline(!userOffline)}
                className={`card5-status-chip text-[9px] font-display px-2 py-0.5 rounded-full font-bold border transition-colors ${
                  userOffline
                    ? 'border-orange bg-orange/20 text-orange-deep'
                    : 'border-sage bg-sage/20 text-forest'
                }`}
              >
                {userOffline ? 'Airplane Mode' : 'Online'}
              </button>
            </div>

            {/* Offline save card container */}
            <div className="p-2.5 rounded bg-cream-dim border border-line-ink/40 space-y-1.5 relative overflow-hidden">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-forest">
                <span className="w-2 h-2 rounded-full bg-forest animate-pulse" />
                <span>IndexedDB: Ready (Local)</span>
              </div>
              <div className="card5-saved-file flex items-center justify-between text-[10px] font-mono text-ink opacity-0 -translate-y-1.5">
                <span className="font-bold">draft.md</span>
                <span className="text-orange flex items-center gap-1 font-display text-[9px]">
                  <Check className="w-3 h-3" /> Saved 0ms
                </span>
              </div>
            </div>

            <div className="card5-confirm-badge text-[9px] font-display text-forest text-center font-bold opacity-0">
              ✓ Everything works without servers
            </div>
          </div>

          <div className="text-xs font-display text-ink/75 border-t border-line-ink/30 pt-3">
            <span className="font-display text-ink">Runs on airplanes and cabins</span>
          </div>
        </div>
      </>
    );
  };

  return (
    <section ref={sectionRef} id="features" className="py-20 relative bg-cream overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <Pill className="mb-3">The crate label lineup</Pill>
            <h2 className="font-display text-5xl sm:text-6xl md:text-7xl text-ink leading-tight">
              Small batch tools, built for markdown.
            </h2>
            <p className="text-sm text-ink/75 max-w-lg mt-2 font-sans">
              Every feature is stamped like a vintage craft label. No bloat, no subscription traps, purely local craft.
            </p>
          </div>
        </div>
      </div>

      {/* ================= CONTINUOUS FULL-BLEED MARQUEE TRACK ================= */}
      {prefersReducedMotion ? (
        /* Reduced motion: Normal scrollable row with scrollbar matching page */
        <div className="max-w-7xl mx-auto px-6">
          <div
            className="flex gap-6 overflow-x-auto pb-8 pt-2 snap-x snap-proximity scrollbar-thin"
            style={{ scrollSnapType: 'x proximity' }}
          >
            {renderCardSet(false)}
          </div>
        </div>
      ) : (
        /* Active Marquee: Edge-to-edge full bleed with soft 6vw edge fades */
        <div
          ref={containerRef}
          className="relative w-screen left-1/2 -translate-x-1/2 overflow-hidden py-4"
          style={{
            maskImage:
              'linear-gradient(to right, transparent, black 6vw, black calc(100% - 6vw), transparent)',
            WebkitMaskImage:
              'linear-gradient(to right, transparent, black 6vw, black calc(100% - 6vw), transparent)',
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onFocus={handleFocus}
          onBlur={handleBlur}
        >
          <div
            ref={trackRef}
            className="marquee-track flex w-max will-change-transform"
          >
            {/* Set 1: Interactive accessible card set */}
            <div ref={set1Ref} className="marquee-set flex gap-6 shrink-0 pr-6">
              {renderCardSet(false)}
            </div>

            {!isTestEnv && (
              <>
                {/* Set 2: Duplicate set for seamless looping (aria-hidden, inert, tabindex -1) */}
                <div
                  className="marquee-set flex gap-6 shrink-0 pr-6"
                  aria-hidden="true"
                  {...({ inert: '' } as Record<string, unknown>)}
                  tabIndex={-1}
                >
                  {renderCardSet(true)}
                </div>

                {/* Set 3: Extra duplicate set to guarantee coverage on 2560px+ screens */}
                <div
                  className="marquee-set flex gap-6 shrink-0 pr-6"
                  aria-hidden="true"
                  {...({ inert: '' } as Record<string, unknown>)}
                  tabIndex={-1}
                >
                  {renderCardSet(true)}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
