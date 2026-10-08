import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Search,
  GripVertical,
  History,
  HardDrive,
  Zap,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { LandingNav } from '../components/landing/LandingNav';
import { HeroSection } from '../components/landing/HeroSection';
import { HowItWorksStory } from '../components/landing/HowItWorksStory';
import { useLandingScroll } from '../hooks/useLandingScroll';

export const Landing: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const creamCurtainRef = useRef<HTMLDivElement>(null);
  const finalCtaRef = useRef<HTMLDivElement>(null);

  const { navTheme } = useLandingScroll({
    heroRef,
    creamCurtainRef,
    finalCtaRef,
  });

  const handleScrollTo = (id: string) => {
    const el = document.querySelector(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-sage text-cream selection:bg-orange selection:text-forest overflow-x-hidden relative">
      {/* Fixed Reference-style Navigation with Dynamic Theme Flipping */}
      <LandingNav theme={navTheme} onNavigateSection={handleScrollTo} />

      {/* ================= 1. HERO ON SUNNY SAGE ================= */}
      <div ref={heroRef} className="pt-16 md:pt-20 bg-sun-glow will-change-transform">
        <HeroSection onScrollNext={() => handleScrollTo('#cream-curtain')} />
      </div>

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

        {/* Features Grid */}
        <section id="features" className="py-20 border-t border-line-ink/40">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-xs font-mono text-orange font-bold">
                Handmade craft tools
              </span>
              <h2 className="font-display text-4xl sm:text-5xl text-ink mt-2">
                Designed for power users
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-cream-dim/50 border border-line-ink space-y-3">
                <div className="w-10 h-10 rounded-xl bg-cream border border-line-ink flex items-center justify-center text-orange shadow-sm">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="font-display text-xl text-ink">
                  Prompt bundles
                </h3>
                <p className="text-xs text-ink/80 leading-relaxed font-sans">
                  Select multiple files and copy them as a unified prompt block with individual headers for AI model context.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-cream-dim/50 border border-line-ink space-y-3">
                <div className="w-10 h-10 rounded-xl bg-cream border border-line-ink flex items-center justify-center text-orange shadow-sm">
                  <Search className="w-5 h-5" />
                </div>
                <h3 className="font-display text-xl text-ink">
                  Instant fuzzy search
                </h3>
                <p className="text-xs text-ink/80 leading-relaxed font-sans">
                  Powered by client-side MiniSearch indexing over title, filename, tags, and full body content.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-cream-dim/50 border border-line-ink space-y-3">
                <div className="w-10 h-10 rounded-xl bg-cream border border-line-ink flex items-center justify-center text-orange shadow-sm">
                  <GripVertical className="w-5 h-5" />
                </div>
                <h3 className="font-display text-xl text-ink">
                  Native drag-out
                </h3>
                <p className="text-xs text-ink/80 leading-relaxed font-sans">
                  Drag files right out of the browser window into your file explorer or text input areas.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-cream-dim/50 border border-line-ink space-y-3">
                <div className="w-10 h-10 rounded-xl bg-cream border border-line-ink flex items-center justify-center text-orange shadow-sm">
                  <History className="w-5 h-5" />
                </div>
                <h3 className="font-display text-xl text-ink">
                  Version history
                </h3>
                <p className="text-xs text-ink/80 leading-relaxed font-sans">
                  Every edit captures an automatic snapshot so you can preview past versions and restore with one click.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-cream-dim/50 border border-line-ink space-y-3">
                <div className="w-10 h-10 rounded-xl bg-cream border border-line-ink flex items-center justify-center text-orange shadow-sm">
                  <HardDrive className="w-5 h-5" />
                </div>
                <h3 className="font-display text-xl text-ink">
                  Full zip export
                </h3>
                <p className="text-xs text-ink/80 leading-relaxed font-sans">
                  Export your stash as a real zip containing nested folders and manifest.json. Never locked in.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-cream-dim/50 border border-line-ink space-y-3">
                <div className="w-10 h-10 rounded-xl bg-cream border border-line-ink flex items-center justify-center text-orange shadow-sm">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="font-display text-xl text-ink">
                  Offline PWA
                </h3>
                <p className="text-xs text-ink/80 leading-relaxed font-sans">
                  Installable as a standalone desktop app that works completely offline with zero server requirements.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="py-20 border-t border-line-ink/40">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="font-display text-4xl text-ink">
                Perfect for repeated context
              </h2>
              <p className="text-xs text-ink/75 mt-2 font-sans">
                Stop digging through old repos to find your favorite prompt files.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              {['CLAUDE.md', 'AGENTS.md', '.cursorrules', 'System prompts', 'API cheatsheets', 'README starters', 'Code snippets', 'Meeting notes'].map((item) => (
                <div
                  key={item}
                  className="p-4 rounded-xl bg-cream-dim/60 border border-line-ink font-mono text-xs text-ink font-bold hover:border-orange hover:bg-cream transition-colors shadow-sm"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

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
        className="py-24 bg-sage text-cream border-t border-line text-center px-6 relative z-10"
      >
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="font-display text-5xl sm:text-6xl text-cream">
            Stash your first file. <br />
            Drop it anywhere.
          </h2>
          <p className="text-sm text-cream-dim max-w-md mx-auto font-sans">
            Ready to organize your markdown files locally? No signup required.
          </p>
          <div>
            <Link to="/app">
              <Button size="lg" variant="primary">
                Open MDstash now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ================= 4. FOOTER IN FOREST ================= */}
      <footer className="border-t border-line py-10 px-6 bg-forest text-xs text-cream-dim relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
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
          </div>
        </div>
      </footer>
    </div>
  );
};
