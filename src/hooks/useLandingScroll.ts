import { useEffect, useState, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { getPerfFlags, trackRender } from '../utils/perfFlags';

gsap.registerPlugin(ScrollTrigger);

interface UseLandingScrollProps {
  heroRef: React.RefObject<HTMLDivElement>;
  creamCurtainRef: React.RefObject<HTMLDivElement>;
  finalCtaRef: React.RefObject<HTMLDivElement>;
}

export function useLandingScroll({
  heroRef,
  creamCurtainRef,
  finalCtaRef,
}: UseLandingScrollProps) {
  trackRender('useLandingScroll');
  const lenisRef = useRef<Lenis | null>(null);

  const updateNavTheme = (theme: 'sage' | 'cream') => {
    const nav = document.querySelector('[data-testid="landing-nav"]') as HTMLElement | null;
    if (nav && nav.getAttribute('data-theme') !== theme) {
      nav.setAttribute('data-theme', theme);
    }
  };

  useEffect(() => {
    const flags = getPerfFlags();
    // Check prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (flags.has('nolenis')) {
      // Native scroll ablation: skip Lenis
      return;
    }

    if (prefersReducedMotion) {
      // For reduced motion: instant section color changes on scroll via IntersectionObserver
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.target === creamCurtainRef.current && entry.isIntersecting) {
              updateNavTheme('cream');
            } else if (entry.target === heroRef.current && entry.isIntersecting) {
              updateNavTheme('sage');
            } else if (entry.target === finalCtaRef.current && entry.isIntersecting) {
              updateNavTheme('sage');
            }
          });
        },
        { threshold: 0.2 }
      );

      if (heroRef.current) observer.observe(heroRef.current);
      if (creamCurtainRef.current) observer.observe(creamCurtainRef.current);
      if (finalCtaRef.current) observer.observe(finalCtaRef.current);

      return () => observer.disconnect();
    }

    // 1. Initialize Lenis instance
    const lenis = new Lenis({
      duration: 1.05,
      wheelMultiplier: 1,
      smoothWheel: true,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    lenisRef.current = lenis;
    if (typeof window !== 'undefined') {
      (window as unknown as { lenis?: Lenis }).lenis = lenis;
    }

    // 2. Synchronize Lenis with ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    // 3. Setup ScrollTrigger for Sage-to-Cream Curtain Transition
    const ctx = gsap.context(() => {
      if (!creamCurtainRef.current || !heroRef.current) return;

      // Hero gentle scale down and fade beneath the rising curtain
      gsap.to(heroRef.current, {
        scale: 0.96,
        opacity: 0.88,
        ease: 'none',
        scrollTrigger: {
          trigger: creamCurtainRef.current,
          start: 'top bottom',
          end: 'top 20%',
          scrub: true,
        },
      });

      // Curtain curved top edge flattening as it rises
      const archElement = creamCurtainRef.current.querySelector('.curtain-arch');
      if (archElement) {
        gsap.to(archElement, {
          scaleY: 0,
          transformOrigin: 'bottom center',
          ease: 'power1.out',
          scrollTrigger: {
            trigger: creamCurtainRef.current,
            start: 'top 85%',
            end: 'top 25%',
            scrub: true,
          },
        });
      }

      // Nav theme switch: flips data-theme attribute directly (zero React re-renders)
      if (!flags.has('nostate')) {
        ScrollTrigger.create({
          trigger: creamCurtainRef.current,
          start: 'top 60px',
          end: 'bottom 60px',
          onEnter: () => updateNavTheme('cream'),
          onLeaveBack: () => updateNavTheme('sage'),
          onLeave: () => updateNavTheme('sage'),
          onEnterBack: () => updateNavTheme('cream'),
        });
      }
    });

    return () => {
      ctx.revert();
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      lenisRef.current = null;
      if (typeof window !== 'undefined') {
        (window as unknown as { lenis?: Lenis | null }).lenis = null;
      }
    };
  }, [heroRef, creamCurtainRef, finalCtaRef]);

  const stopLenis = () => {
    lenisRef.current?.scrollTo(0, { immediate: true });
    lenisRef.current?.stop();
  };

  const startLenis = () => {
    lenisRef.current?.start();
    ScrollTrigger.refresh();
  };

  return { navTheme: 'sage' as const, lenis: lenisRef.current, stopLenis, startLenis };
}
