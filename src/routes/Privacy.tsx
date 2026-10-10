import React, { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { LandingNav } from '../components/landing/LandingNav';
import { PrivacyHero } from '../components/privacy/PrivacyHero';
import { FollowYourFile } from '../components/privacy/FollowYourFile';
import { LiveProofPanel } from '../components/privacy/LiveProofPanel';
import { CollectionReceipt } from '../components/privacy/CollectionReceipt';
import { VerificationSteps } from '../components/privacy/VerificationSteps';
import { PrivacyFaq } from '../components/privacy/PrivacyFaq';
import { PrivacyFinalCta } from '../components/privacy/PrivacyFinalCta';

export const Privacy: React.FC = () => {
  const creamCurtainRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);

  // Update Page Title and Meta Description for SEO
  useEffect(() => {
    const originalTitle = document.title;
    document.title = 'Privacy & Transparency — MDstash';

    let metaDesc = document.querySelector('meta[name="description"]');
    const originalDesc = metaDesc?.getAttribute('content') || '';

    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      'content',
      'MDstash privacy proof: zero cloud storage, zero tracking, zero document telemetry. Your markdown never leaves your device.'
    );

    return () => {
      document.title = originalTitle;
      if (metaDesc && originalDesc) {
        metaDesc.setAttribute('content', originalDesc);
      }
    };
  }, []);

  // Ensure is-loading class is cleared on privacy page
  useEffect(() => {
    document.documentElement.classList.remove('is-loading');
  }, []);
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
      const lenis = new Lenis({
        duration: 1.05,
        wheelMultiplier: 1,
        smoothWheel: true,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
      lenisRef.current = lenis;

      const raf = (time: number) => {
        lenis.raf(time);
        requestAnimationFrame(raf);
      };
      const rafId = requestAnimationFrame(raf);

      return () => {
        cancelAnimationFrame(rafId);
        lenis.destroy();
        lenisRef.current = null;
      };
    }
  }, []);

  const handleScrollTo = (id: string) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(id, { duration: 1.2, offset: -60 });
    } else {
      const el = document.querySelector(id);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-sage text-cream selection:bg-orange selection:text-forest overflow-x-hidden relative">
      {/* Skip to Main Content Link for A11y */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-orange focus:text-forest focus:font-bold focus:rounded-xl focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-forest"
      >
        Skip to main content
      </a>

      {/* Reusable Landing Nav with Dynamic Theme Flipping */}
      <LandingNav theme="sage" onNavigateSection={handleScrollTo} />

      {/* ================= 1. HERO ON MUTED SAGE ================= */}
      <main id="main-content" data-nav-theme="sage" className="will-change-transform">
        <PrivacyHero />
      </main>

      {/* ================= 2. THE CREAM CURTAIN ================= */}
      <div
        id="cream-curtain"
        ref={creamCurtainRef}
        data-nav-theme="cream"
        className="relative bg-cream text-ink transition-colors duration-300"
      >
        {/* Curved Elliptical Top Arch: Sage into Cream */}
        <div className="curtain-arch overflow-hidden w-full leading-none -mt-1 pointer-events-none">
          <svg
            viewBox="0 0 1440 100"
            preserveAspectRatio="none"
            className="w-full h-16 sm:h-24 md:h-32 text-cream fill-current block"
            aria-hidden="true"
          >
            <path d="M0 100C360 0 1080 0 1440 100V100H0Z" />
          </svg>
        </div>

        {/* 2a. Follow Your File: One-shot animated SVG scene */}
        <FollowYourFile />

        {/* 2b. Don't Trust Us, Check: DevTools-style Live Proof Panel */}
        <LiveProofPanel />

        {/* 2c. What We Collect: Paper-style receipt with stamped rows */}
        <CollectionReceipt />

        {/* 2d. Three Ways to Verify: Practical DevTools verification steps */}
        <VerificationSteps />

        {/* 2e. Short FAQ Accordions */}
        <PrivacyFaq />

        {/* Reverse Arch: Cream Transitioning into Sage */}
        <div className="curtain-arch-reverse overflow-hidden w-full leading-none -mb-1 pointer-events-none">
          <svg
            viewBox="0 0 1440 100"
            preserveAspectRatio="none"
            className="w-full h-16 sm:h-24 md:h-32 text-sage fill-current block"
            aria-hidden="true"
          >
            <path d="M0 0C360 100 1080 100 1440 0V100H0Z" />
          </svg>
        </div>
      </div>

      {/* ================= 3. FINAL CTA BACK ON SUNNY SAGE & FOOTER ================= */}
      <PrivacyFinalCta />
    </div>
  );
};
