import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import gsap from 'gsap';

export const PrivacyHero: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      document.querySelectorAll('.privacy-hl-bg').forEach((el) => {
        (el as HTMLElement).style.width = '100%';
      });
      document.querySelectorAll('.privacy-hl-char').forEach((el) => {
        (el as HTMLElement).style.color = 'var(--ink)';
      });
      document.querySelectorAll('.privacy-hl-caret').forEach((el) => {
        (el as HTMLElement).style.opacity = '0';
      });
      return;
    }

    const ctx = gsap.context(() => {
      // Set initial states
      gsap.set('.privacy-hl-bg', { width: '0%' });
      gsap.set('.privacy-hl-caret', { opacity: 0, left: '0%' });
      gsap.set('.privacy-hl-char', { color: 'var(--cream)' });

      const tl = gsap.timeline({ delay: 0.2 });

      // 1. Caret appears and blinks
      tl.to('.privacy-hl-caret', { opacity: 1, duration: 0.1 });
      tl.to('.privacy-hl-caret', {
        opacity: 0,
        duration: 0.45,
        repeat: 2,
        yoyo: true,
        ease: 'steps(1)',
      });

      // 2. Selection highlights "never leave" (11 characters)
      tl.add(() => {
        gsap.set('.privacy-hl-caret', { opacity: 1 });
      });

      tl.to(
        '.privacy-hl-bg',
        {
          width: '100%',
          duration: 0.85,
          ease: 'steps(11)',
        },
        '+=0.1'
      );

      tl.to(
        '.privacy-hl-caret',
        {
          left: '100%',
          duration: 0.85,
          ease: 'steps(11)',
        },
        '<'
      );

      tl.to(
        '.privacy-hl-char',
        {
          color: 'var(--ink)',
          duration: 0.05,
          stagger: 0.85 / 11,
          ease: 'none',
        },
        '<'
      );

      // 3. Caret fades out
      tl.to('.privacy-hl-caret', { opacity: 0, duration: 0.2 }, '+=0.2');
    }, heroRef);

    return () => {
      ctx.revert();
    };
  }, []);

  const highlightText = 'never leave';

  return (
    <section
      ref={heroRef}
      className="relative w-full max-w-7xl mx-auto px-6 sm:px-12 pt-28 sm:pt-36 pb-20 sm:pb-28 flex flex-col items-center text-center"
    >
      {/* Back to Home Link */}
      <div className="w-full max-w-4xl flex items-center justify-start mb-8 sm:mb-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-display text-cream/80 hover:text-orange transition-colors group cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange rounded-md px-1 py-0.5"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to home</span>
        </Link>
      </div>

      {/* Hero Headline */}
      <div className="w-full max-w-4xl relative flex flex-col items-center">
        {/* Main Headline */}
        <h1
          className="font-display text-cream text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-[1.05] mb-6 text-shadow-stamp"
        >
          Your files{' '}
          <mark className="privacy-hl text-inherit bg-transparent relative inline-block">
            <span
              className="privacy-hl-bg absolute bg-orange rounded-[0.18em] -rotate-[0.6deg] origin-left pointer-events-none"
              style={{ width: '0%', inset: '0.08em -0.1em 0.08em -0.1em' }}
              aria-hidden="true"
            />
            <span
              className="privacy-hl-caret absolute top-[10%] w-[0.06em] h-[0.8em] bg-cream opacity-0 pointer-events-none z-20"
              style={{ left: '0%' }}
              aria-hidden="true"
            />
            <span className="privacy-hl-text relative z-10 transition-colors duration-200">
              {highlightText.split('').map((char, i) => (
                <span key={i} className="privacy-hl-char inline-block" data-char={char}>
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </span>
          </mark>{' '}
          this tab.
        </h1>

        {/* One-line subtext */}
        <p className="text-cream-dim text-base sm:text-lg md:text-xl font-sans max-w-2xl mx-auto leading-relaxed">
          MDstash is engineered so that your components, notes, and kits stay local in your browser’s IndexedDB. When pairing with AI agents via local MCP or the edge API, access is strictly token-authenticated and controlled by you.
        </p>
      </div>
    </section>
  );
};
