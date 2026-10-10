import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export interface HeroHighlightConfig {
  firstCaretStart: number;
  firstCaretBlinkPeriod: number;
  firstSelectionDuration: number;
  firstCaretFadeDuration: number;
  secondCaretOverlap: number;
  secondCaretBlinkPeriod: number;
  secondSelectionDuration: number;
  secondCaretFadeDuration: number;
  selectionEase?: string;
}

export const HERO_HIGHLIGHT_CONFIG: HeroHighlightConfig = {
  // Start caret after headline lines finish landing (headline lands at ~1.49s)
  // 1.84s + 2.65s = 4.49s; 4.49s - 1.49s = ~3.0s total after headline landing
  firstCaretStart: 1.84,
  // First phrase ("markdown,"):
  firstCaretBlinkPeriod: 0.8, // 1 blink, ~0.8s period, steps(1)
  firstSelectionDuration: 0.6, // selection grows in ~0.6s
  firstCaretFadeDuration: 0.15,
  // Second phrase ("ready to drop."):
  secondCaretOverlap: 0.2, // starts ~0.2s before first selection finishes
  secondCaretBlinkPeriod: 0.7, // 1 blink, ~0.7s period, steps(1)
  secondSelectionDuration: 0.75, // selection grows in ~0.75s
  secondCaretFadeDuration: 0.15,
  selectionEase: 'power2.inOut',
};

// In-memory module-level session flag: resets on full page reload/refresh,
// persists across in-app client-side navigation (e.g. / -> /app -> /).
let hasPlayedInSession = false;

interface UseHeroIntroProps {
  onStopLenis?: () => void;
  onStartLenis?: () => void;
}

export function useHeroIntro({ onStopLenis, onStartLenis }: UseHeroIntroProps = {}) {
  const isIntroCompleteRef = useRef(false);
  const [bfCacheTick, setBfCacheTick] = useState(0);

  // Store callbacks in refs to avoid recreating useEffect on parent re-renders
  const onStopLenisRef = useRef(onStopLenis);
  onStopLenisRef.current = onStopLenis;
  const onStartLenisRef = useRef(onStartLenis);
  onStartLenisRef.current = onStartLenis;

  // Handle bfcache restores (pageshow event with persisted = true)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        hasPlayedInSession = false;
        if ('scrollRestoration' in history) {
          history.scrollRestoration = 'manual';
        }
        window.scrollTo(0, 0);
        setBfCacheTick((c) => c + 1);
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => {
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Clean up any legacy sessionStorage key from previous implementation
    try {
      sessionStorage.removeItem('mdstash_hero_intro_played');
    } catch {
      // ignore
    }

    const isReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const urlParams = new URLSearchParams(window.location.search);
    const noIntro = urlParams.has('nointro');
    const isTest = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';

    // Failsafe / skip condition:
    // Plays on every fresh page load/reload because hasPlayedInSession starts false.
    // Skips only on in-app client-side navigation back to "/" in same session.
    if (isReducedMotion || noIntro || hasPlayedInSession || isTest) {
      document.documentElement.classList.remove('is-loading');
      isIntroCompleteRef.current = true;
      // Immediately set final settled states
      document.querySelectorAll('.hl-bg').forEach((el) => {
        (el as HTMLElement).style.width = '100%';
      });
      document.querySelectorAll('.hl-char').forEach((el) => {
        (el as HTMLElement).style.color = 'var(--ink)';
      });
      document.querySelectorAll('.hl-caret').forEach((el) => {
        (el as HTMLElement).style.opacity = '0';
      });
      document.querySelectorAll('.hero-line').forEach((el) => {
        const line = el as HTMLElement;
        line.style.overflow = 'visible';
        line.style.clipPath = 'none';
        line.style.padding = '';
        line.style.margin = '';
      });
      document.querySelectorAll('.hero-line-inner').forEach((el) => {
        (el as HTMLElement).style.transform = 'none';
        (el as HTMLElement).style.opacity = '1';
      });
      document.querySelectorAll('.hero-scroll-cue').forEach((el) => {
        (el as HTMLElement).style.opacity = '';
        (el as HTMLElement).style.transform = 'none';
      });

      document.querySelectorAll('.nav-badge').forEach((el) => {
        (el as HTMLElement).style.opacity = '1';
        (el as HTMLElement).style.transform = 'none';
      });
      onStartLenisRef.current?.();
      return;
    }

    // Scroll to top and lock scroll before intro starts
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    let isCancelled = false;
    let resizeCtx: gsap.Context | null = null;
    const mountTime = Date.now();

    const runTimeline = async () => {
      // 1. Wait for document.fonts.ready
      if (document.fonts && document.fonts.ready) {
        try {
          await document.fonts.ready;
        } catch {
          // ignore font loading error
        }
      }

      if (isCancelled) return;

      // Lock Lenis at scroll 0 during intro
      onStopLenisRef.current?.();
      window.scrollTo(0, 0);

      const ctx = gsap.context(() => {
        // Remove .is-loading class so hero is visible for GSAP
        document.documentElement.classList.remove('is-loading');

        const tl = gsap.timeline({
          onComplete: () => {
            isIntroCompleteRef.current = true;
            hasPlayedInSession = true;
            document.querySelectorAll('.hero-line').forEach((el) => {
              const line = el as HTMLElement;
              line.style.overflow = 'visible';
              line.style.clipPath = 'none';
              line.style.padding = '';
              line.style.margin = '';
            });
            onStartLenisRef.current?.();
          },
        });

        const safeSet = (selector: string, vars: gsap.TweenVars) => {
          if (document.querySelector(selector)) {
            gsap.set(selector, vars);
          }
        };

        const safeTo = (selector: string, vars: gsap.TweenVars, position?: gsap.Position) => {
          if (document.querySelector(selector)) {
            tl.to(selector, vars, position);
          }
        };

        // 0.0s: Initial states
        safeSet('.nav-badge', { y: -20, opacity: 0 });
        safeSet('.nav-left > *', { y: -10, opacity: 0 });
        safeSet('.nav-right > *', { y: -10, opacity: 0 });
        safeSet('.hero-line-inner', { yPercent: 140, rotate: 1.5, opacity: 0 });
        safeSet('.hero-crate', { y: 40, opacity: 0 });
        safeSet('.hero-crate-arch-path', { strokeDashoffset: 300 });
        safeSet('.hero-right-tab', { x: 80, opacity: 0 });
        safeSet('.hero-motif-left, .hero-motif-right', { scale: 0.6, opacity: 0 });
        safeSet('.hero-caption-left, .hero-caption-right', { opacity: 0, y: 8 });
        safeSet('.hero-scroll-cue', { opacity: 0, y: 12 });

        // Highlights initial states
        safeSet('.hl-bg', { width: '0%' });
        safeSet('.hl-caret', { opacity: 0, left: '0%' });
        safeSet('.hl-char', { color: 'var(--cream)' });

        // 0.1s: Badge drops 20px with fade
        safeTo('.nav-badge', { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' }, 0.1);

        // 0.2s: Nav items fade up staggered
        safeTo('.nav-left > *, .nav-right > *', { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', stagger: 0.06 }, 0.2);

        // 0.4s: 3 Headline lines rise out of mask (expo.out, stagger 0.12s)
        safeTo(
          '.hero-line-inner',
          {
            yPercent: 0,
            rotate: 0,
            opacity: 1,
            duration: 0.85,
            ease: 'expo.out',
            stagger: 0.12,
            onComplete: () => {
              document.querySelectorAll('.hero-line').forEach((el) => {
                const line = el as HTMLElement;
                line.style.overflow = 'visible';
                line.style.clipPath = 'none';
                line.style.padding = '';
                line.style.margin = '';
              });
              if (typeof window !== 'undefined') {
                (window as unknown as { __headlineLandedAt?: number }).__headlineLandedAt = performance.now();
              }
            },
          },
          0.4
        );

        // 0.9s: Crate rises and dashed arch draws
        safeTo('.hero-crate', { y: 0, opacity: 1, duration: 0.75, ease: 'power2.out' }, 0.9);
        safeTo('.hero-crate-arch-path', { strokeDashoffset: 0, duration: 0.85, ease: 'power1.inOut' }, 0.9);

        // 1.0s: Right tab slides in (back.out)
        safeTo('.hero-right-tab', { x: 0, opacity: 1, duration: 0.65, ease: 'back.out(1.4)' }, 1.0);

        // 1.3s: Asterisk and prompt marks pop in (back.out), captions fade in
        safeTo(
          '.hero-motif-left, .hero-motif-right',
          { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.5)', stagger: 0.08 },
          1.3
        );
        safeTo(
          '.hero-caption-left, .hero-caption-right',
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.08 },
          1.4
        );

        // 1.6s: Scroll cue fades in
        safeTo(
          '.hero-scroll-cue',
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            onComplete: () => {
              document.querySelectorAll('.hero-scroll-cue').forEach((el) => {
                (el as HTMLElement).style.opacity = '';
                (el as HTMLElement).style.transform = '';
              });
            },
          },
          1.6
        );

        // ================= HIGHLIGHT SEQUENCE =================
        const cfg = HERO_HIGHLIGHT_CONFIG;

        // Phrase 1: "markdown"
        const t1CaretStart = cfg.firstCaretStart;
        const t1SelectStart = t1CaretStart + cfg.firstCaretBlinkPeriod;
        const t1SelectEnd = t1SelectStart + cfg.firstSelectionDuration;

        // Caret 1 appears & blinks once (period cfg.firstCaretBlinkPeriod, steps(1))
        tl.add(() => {
          gsap.set('.hl-markdown .hl-caret', { opacity: 1, left: '0%' });
        }, t1CaretStart);

        safeTo(
          '.hl-markdown .hl-caret',
          {
            opacity: 0,
            duration: cfg.firstCaretBlinkPeriod / 2,
            repeat: 1,
            yoyo: true,
            ease: 'steps(1)',
          },
          t1CaretStart
        );

        const selectionEase = cfg.selectionEase || 'power2.inOut';

        // Selection 1 grows in cfg.firstSelectionDuration (8 chars)
        tl.add(() => {
          gsap.set('.hl-markdown .hl-caret', { opacity: 1 });
        }, t1SelectStart);

        safeTo(
          '.hl-markdown .hl-bg',
          {
            width: '100%',
            duration: cfg.firstSelectionDuration,
            ease: selectionEase,
          },
          t1SelectStart
        );
        safeTo(
          '.hl-markdown .hl-caret',
          {
            left: '100%',
            duration: cfg.firstSelectionDuration,
            ease: selectionEase,
          },
          t1SelectStart
        );
        safeTo(
          '.hl-markdown .hl-char',
          {
            color: 'var(--ink)',
            duration: 0.04,
            stagger: {
              amount: cfg.firstSelectionDuration,
              ease: selectionEase,
            },
          },
          t1SelectStart
        );

        // Caret 1 fades
        safeTo('.hl-markdown .hl-caret', { opacity: 0, duration: cfg.firstCaretFadeDuration }, t1SelectEnd);

        // Phrase 2: "ready to drop."
        // Starts during the first selection's last cfg.secondCaretOverlap
        const t2CaretStart = t1SelectEnd - cfg.secondCaretOverlap;
        const t2SelectStart = t2CaretStart + cfg.secondCaretBlinkPeriod;
        const t2SelectEnd = t2SelectStart + cfg.secondSelectionDuration;

        tl.add(() => {
          gsap.set('.hl-ready .hl-caret', { opacity: 1, left: '0%' });
        }, t2CaretStart);

        safeTo(
          '.hl-ready .hl-caret',
          {
            opacity: 0,
            duration: cfg.secondCaretBlinkPeriod / 2,
            repeat: 1,
            yoyo: true,
            ease: 'steps(1)',
          },
          t2CaretStart
        );

        // Selection 2 grows in cfg.secondSelectionDuration (14 chars)
        tl.add(() => {
          gsap.set('.hl-ready .hl-caret', { opacity: 1 });
        }, t2SelectStart);

        safeTo(
          '.hl-ready .hl-bg',
          {
            width: '100%',
            duration: cfg.secondSelectionDuration,
            ease: selectionEase,
            onComplete: () => {
              if (typeof window !== 'undefined') {
                (window as unknown as { __highlightsDoneAt?: number }).__highlightsDoneAt = performance.now();
              }
            },
          },
          t2SelectStart
        );
        safeTo(
          '.hl-ready .hl-caret',
          {
            left: '100%',
            duration: cfg.secondSelectionDuration,
            ease: selectionEase,
          },
          t2SelectStart
        );
        safeTo(
          '.hl-ready .hl-char',
          {
            color: 'var(--ink)',
            duration: 0.04,
            stagger: {
              amount: cfg.secondSelectionDuration,
              ease: selectionEase,
            },
          },
          t2SelectStart
        );

        // Caret 2 fades
        safeTo('.hl-ready .hl-caret', { opacity: 0, duration: cfg.secondCaretFadeDuration }, t2SelectEnd);
      });

      resizeCtx = ctx;

      return () => {
        ctx.revert();
      };
    };

    runTimeline();

    return () => {
      isCancelled = true;
      document.documentElement.classList.remove('is-loading');
      // If unmounting after more than 150ms, this is real user navigation away, not React StrictMode
      if (Date.now() - mountTime > 150) {
        hasPlayedInSession = true;
      }
      resizeCtx?.revert();
    };
  }, [bfCacheTick]);

  return { isIntroComplete: isIntroCompleteRef.current };
}
