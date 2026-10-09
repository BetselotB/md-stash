import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface UseHeroIntroProps {
  onStopLenis?: () => void;
  onStartLenis?: () => void;
}

export function useHeroIntro({ onStopLenis, onStartLenis }: UseHeroIntroProps = {}) {
  const isIntroCompleteRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const HAS_PLAYED_KEY = 'mdstash_hero_intro_played';
    const isReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const urlParams = new URLSearchParams(window.location.search);
    const noIntro = urlParams.has('nointro');
    const alreadyPlayed = sessionStorage.getItem(HAS_PLAYED_KEY) === 'true';
    const isTest = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';

    // Failsafe / skip condition:
    if (isReducedMotion || noIntro || alreadyPlayed || isTest) {
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
      document.querySelectorAll('.nav-rule-left, .nav-rule-right').forEach((el) => {
        (el as HTMLElement).style.transform = 'scaleX(1)';
      });
      document.querySelectorAll('.nav-badge').forEach((el) => {
        (el as HTMLElement).style.opacity = '1';
        (el as HTMLElement).style.transform = 'none';
      });
      onStartLenis?.();
      return;
    }

    let isCancelled = false;
    let resizeCtx: gsap.Context | null = null;

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

      // Stop Lenis during intro
      onStopLenis?.();

      const ctx = gsap.context(() => {
        // Remove .is-loading class so hero is visible for GSAP
        document.documentElement.classList.remove('is-loading');

        const tl = gsap.timeline({
          onComplete: () => {
            isIntroCompleteRef.current = true;
            document.querySelectorAll('.hero-line').forEach((el) => {
              const line = el as HTMLElement;
              line.style.overflow = 'visible';
              line.style.clipPath = 'none';
              line.style.padding = '';
              line.style.margin = '';
            });
            try {
              sessionStorage.setItem(HAS_PLAYED_KEY, 'true');
            } catch {
              // ignore storage errors
            }
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
        safeSet('.nav-rule-left', { scaleX: 0, transformOrigin: 'right center' });
        safeSet('.nav-rule-right', { scaleX: 0, transformOrigin: 'left center' });
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

        // 0.1s: Nav rules scaleX outward, badge drops 20px with fade
        safeTo('.nav-rule-left, .nav-rule-right', { scaleX: 1, duration: 0.8, ease: 'power2.out' }, 0.1);
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

        // 1.6s: Scroll cue fades in as last element of intro timeline
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

        // 1.9s: Intro settles, Lenis starts
        tl.add(() => {
          onStartLenis?.();
        }, 1.9);

        // ================= MILESTONE 2: CARET THEN GRADUAL SELECTION HIGHLIGHT =================
        // 1. Caret appears at start of "markdown" and blinks for exactly 3 blinks (~1.6s, period 1.06s: 530ms on, 530ms off)
        safeSet('.hl-markdown .hl-caret', { opacity: 1, left: '0%' });
        safeTo(
          '.hl-markdown .hl-caret',
          {
            opacity: 0,
            duration: 0.53,
            repeat: 2,
            yoyo: true,
            ease: 'steps(1)',
          },
          2.0
        );

        // 2. Selection grows gradually left-to-right in character steps (~0.9s, 8 chars)
        // Caret stays at leading edge until selection finishes
        tl.add(() => {
          gsap.set('.hl-markdown .hl-caret', { opacity: 1 });
        }, 3.6);

        safeTo(
          '.hl-markdown .hl-bg',
          {
            width: '100%',
            duration: 0.9,
            ease: 'steps(8)',
          },
          3.6
        );
        safeTo(
          '.hl-markdown .hl-caret',
          {
            left: '100%',
            duration: 0.9,
            ease: 'steps(8)',
          },
          3.6
        );
        safeTo(
          '.hl-markdown .hl-char',
          {
            color: 'var(--ink)',
            duration: 0.05,
            stagger: 0.9 / 8,
            ease: 'none',
          },
          3.6
        );

        // Caret fades
        safeTo('.hl-markdown .hl-caret', { opacity: 0, duration: 0.15 }, 4.5);

        // 3. Caret reappears at start of "ready to drop." (line 3)
        // Blinks 2 times (~1.06s, 530ms on, 530ms off)
        tl.add(() => {
          gsap.set('.hl-ready .hl-caret', { opacity: 1, left: '0%' });
        }, 4.7);

        safeTo(
          '.hl-ready .hl-caret',
          {
            opacity: 0,
            duration: 0.53,
            repeat: 1,
            yoyo: true,
            ease: 'steps(1)',
          },
          4.7
        );

        // 4. "ready to drop." selection grows in character steps (~1.1s, 14 chars)
        tl.add(() => {
          gsap.set('.hl-ready .hl-caret', { opacity: 1 });
        }, 5.76);

        safeTo(
          '.hl-ready .hl-bg',
          {
            width: '100%',
            duration: 1.1,
            ease: 'steps(14)',
          },
          5.76
        );
        safeTo(
          '.hl-ready .hl-caret',
          {
            left: '100%',
            duration: 1.1,
            ease: 'steps(14)',
          },
          5.76
        );
        safeTo(
          '.hl-ready .hl-char',
          {
            color: 'var(--ink)',
            duration: 0.05,
            stagger: 1.1 / 14,
            ease: 'none',
          },
          5.76
        );

        // Caret fades
        safeTo('.hl-ready .hl-caret', { opacity: 0, duration: 0.15 }, 6.86);
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
      resizeCtx?.revert();
    };
  }, [onStopLenis, onStartLenis]);

  return { isIntroComplete: isIntroCompleteRef.current };
}
