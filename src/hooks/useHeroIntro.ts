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

    // Failsafe / skip condition:
    if (isReducedMotion || noIntro || alreadyPlayed) {
      document.documentElement.classList.remove('is-loading');
      isIntroCompleteRef.current = true;
      // Immediately set final settled state
      const hlBg = document.querySelector('.hl-bg') as HTMLElement | null;
      const hlText = document.querySelector('.hl-text') as HTMLElement | null;
      if (hlBg) {
        hlBg.style.transform = 'scaleX(1)';
      }
      if (hlText) {
        hlText.style.color = 'var(--ink)';
      }
      return;
    }

    let isCancelled = false;

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
            try {
              sessionStorage.setItem(HAS_PLAYED_KEY, 'true');
            } catch {
              // ignore storage errors
            }
            onStartLenis?.();
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
        safeSet('.hero-line-inner', { yPercent: 110, rotate: 1.5, opacity: 0 });
        safeSet('.hero-crate', { y: 40, opacity: 0 });
        safeSet('.hero-crate-arch-path', { strokeDashoffset: 300 });
        safeSet('.hero-right-tab', { x: 80, opacity: 0 });
        safeSet('.hero-badge', { scale: 0.5, rotate: -30, opacity: 0 });
        safeSet('.hero-motif-left, .hero-motif-right', { scale: 0.6, opacity: 0 });
        safeSet('.hero-caption-left, .hero-caption-right', { opacity: 0, y: 8 });
        safeSet('.hl-bg', { scaleX: 0, transformOrigin: 'left center' });
        safeSet('.hl-caret', { opacity: 0 });
        safeSet('.hl-text', { color: 'var(--cream)' });

        // 0.1s: Nav rules scaleX outward, badge drops 20px with fade
        safeTo('.nav-rule-left, .nav-rule-right', { scaleX: 1, duration: 0.8, ease: 'power2.out' }, 0.1);
        safeTo('.nav-badge', { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' }, 0.1);

        // 0.2s: Nav items fade up staggered
        safeTo('.nav-left > *, .nav-right > *', { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', stagger: 0.06 }, 0.2);

        // 0.4s: Headline lines rise out of mask (expo.out, stagger 0.12s)
        safeTo(
          '.hero-line-inner',
          {
            yPercent: 0,
            rotate: 0,
            opacity: 1,
            duration: 0.85,
            ease: 'expo.out',
            stagger: 0.12,
          },
          0.4
        );

        // 0.9s: Crate rises and dashed arch draws
        safeTo('.hero-crate', { y: 0, opacity: 1, duration: 0.75, ease: 'power2.out' }, 0.9);
        safeTo('.hero-crate-arch-path', { strokeDashoffset: 0, duration: 0.85, ease: 'power1.inOut' }, 0.9);

        // 1.0s: Right tab slides in (back.out)
        safeTo('.hero-right-tab', { x: 0, opacity: 1, duration: 0.65, ease: 'back.out(1.4)' }, 1.0);

        // 1.1s: Ring badge scales/rotates in
        safeTo('.hero-badge', { scale: 1, rotate: 0, opacity: 1, duration: 0.7, ease: 'back.out(1.2)' }, 1.1);

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

        // ~2.15s: Lenis starts, and Caret blinks at start of "markdown" for ~400ms
        safeTo(
          '.hl-caret',
          { opacity: 1, duration: 0.1, repeat: 3, yoyo: true, ease: 'steps(1)' },
          2.15
        );

        // Orange selection rectangle sweeps left-to-right (scaleX 0 to 1, ~0.55s, power2.inOut)
        safeTo(
          '.hl-bg',
          { scaleX: 1, duration: 0.55, ease: 'power2.inOut' },
          2.4
        );

        // As orange rectangle sweeps over letters, color changes to ink (#26332A)
        safeTo(
          '.hl-text',
          { color: 'var(--ink)', duration: 0.35, ease: 'power1.out' },
          2.55
        );

        // Caret gently hides after sweep
        safeTo(
          '.hl-caret',
          { opacity: 0, duration: 0.2 },
          2.95
        );
      });

      return () => {
        ctx.revert();
      };
    };

    const cleanupPromise = runTimeline();

    return () => {
      isCancelled = true;
      document.documentElement.classList.remove('is-loading');
      cleanupPromise.then((cleanup) => cleanup?.());
    };
  }, [onStopLenis, onStartLenis]);

  return { isIntroComplete: isIntroCompleteRef.current };
}
