import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { LandingNav } from '../components/landing/LandingNav';
import { HeroSection } from '../components/landing/HeroSection';
import { HowItWorksStory } from '../components/landing/HowItWorksStory';
import { FeatureCrateLabels } from '../components/landing/FeatureCrateLabels';
import { InteractivePlayground } from '../components/landing/InteractivePlayground';
import { PrivacyProofPanel } from '../components/landing/PrivacyProofPanel';
import { MarqueeUseCases } from '../components/landing/MarqueeUseCases';
import { useLandingScroll } from '../hooks/useLandingScroll';
import { useHeroIntro } from '../hooks/useHeroIntro';

export const Landing: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const creamCurtainRef = useRef<HTMLDivElement>(null);
  const finalCtaRef = useRef<HTMLDivElement>(null);

  const { navTheme, stopLenis, startLenis } = useLandingScroll({
    heroRef,
    creamCurtainRef,
    finalCtaRef,
  });

  useHeroIntro({
    onStopLenis: stopLenis,
    onStartLenis: startLenis,
  });

  const handleScrollTo = (id: string) => {
    const el = document.querySelector(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
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

      {/* Fixed Reference-style Navigation with Dynamic Theme Flipping */}
      <LandingNav theme={navTheme} onNavigateSection={handleScrollTo} />

      {/* ================= 1. HERO ON MUTED SAGE ================= */}
      <main id="main-content" ref={heroRef} className="pt-[clamp(76px,6.2vw,155px)] will-change-transform">
        <HeroSection onScrollNext={() => handleScrollTo('#cream-curtain')} />
      </main>

      {/* ================= 2. THE CREAM CURTAIN ================= */}
      <div
        id="cream-curtain"
        ref={creamCurtainRef}
        className="relative z-10 bg-cream text-ink transition-colors duration-300"
      >
        {/* Curved Elliptical Top Arch that Flattens as it Rises */}
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

        {/* Pinned Scroll-Story: How It Works */}
        <HowItWorksStory />

        {/* Feature Crate Labels Lineup */}
        <FeatureCrateLabels />

        {/* Live Interactive Playground */}
        <InteractivePlayground />

        {/* Privacy Proof Panel */}
        <PrivacyProofPanel />

        {/* Dual Marquee Use Cases */}
        <MarqueeUseCases />

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

      {/* ================= 3. FINAL CTA BACK ON SUNNY SAGE ================= */}
      <section
        ref={finalCtaRef}
        className="py-24 sm:py-32 bg-sage text-cream border-t border-line text-center px-6 relative z-10"
      >
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Crate logo mark */}
          <Link to="/app" className="inline-block group" aria-label="Open MDstash app">
            <img
              src="/logo.svg"
              alt="MDstash crate"
              className="w-24 h-24 mx-auto filter drop-shadow-md group-hover:scale-105 group-hover:-rotate-2 transition-transform duration-300"
            />
          </Link>

          <h2 className="font-display text-5xl sm:text-7xl text-cream tracking-tight leading-none">
            Stash your first file.
          </h2>

          <p className="text-base text-cream-dim max-w-md mx-auto font-sans leading-relaxed">
            Pure, local markdown stash. Ready in seconds, works completely offline.
          </p>

          <div>
            <Link
              to="/app"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-orange hover:bg-orange-deep text-forest font-bold text-base shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-cream/40"
            >
              Open MDstash
            </Link>
          </div>
        </div>
      </section>

      {/* ================= 4. FOOTER IN FOREST ================= */}
      <footer className="border-t border-line pt-12 pb-0 px-6 bg-forest text-xs text-cream-dim relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 pb-8 border-b border-cream/10">
          <div className="flex items-center gap-2">
            <span className="font-display text-xl text-cream">
              MD<span className="text-orange">stash</span>
            </span>
            <span>· Made with care for the craft community.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-cream transition-colors">
              Privacy
            </Link>
            <a
              href="https://github.com/Jole-19/MDstash"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cream transition-colors"
            >
              GitHub
            </a>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:text-cream transition-colors cursor-pointer"
            >
              Back to top ↑
            </button>
          </div>
        </div>

        {/* Giant wordmark cropped at bottom edge */}
        <div
          className="w-full text-center select-none pointer-events-none overflow-hidden -mb-8 sm:-mb-14 md:-mb-20 pt-6"
          aria-hidden="true"
        >
          <span className="font-display text-[19vw] leading-none text-cream/5 tracking-tighter block whitespace-nowrap">
            MDstash
          </span>
        </div>
      </footer>
    </div>
  );
};
