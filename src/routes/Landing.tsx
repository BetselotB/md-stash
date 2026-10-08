import React from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Search,
  GripVertical,
  History,
  HardDrive,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { LandingNav } from '../components/landing/LandingNav';
import { HeroSection } from '../components/landing/HeroSection';

export const Landing: React.FC = () => {
  const handleScrollTo = (id: string) => {
    const el = document.querySelector(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-sage text-cream selection:bg-orange selection:text-forest overflow-x-hidden relative bg-sun-glow">
      {/* Fixed Reference-style Navigation */}
      <LandingNav />

      {/* Hero Section */}
      <div className="pt-16 md:pt-20">
        <HeroSection onScrollNext={() => handleScrollTo('#how-it-works')} />
      </div>

      {/* How It Works (3 Steps) */}
      <section id="how-it-works" className="py-20 border-t border-line bg-forest/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-mono text-orange font-bold">
              Effortless three-step workflow
            </span>
            <h2 className="font-display text-4xl sm:text-5xl text-cream mt-2">
              How MDstash works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="p-8 rounded-3xl bg-forest border border-line flex flex-col items-start text-left relative overflow-hidden group hover:border-orange/60 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-orange/20 border border-orange text-orange flex items-center justify-center mb-6 font-display text-2xl">
                1
              </div>
              <h3 className="font-display text-2xl text-cream mb-2">
                Drag in files or folders
              </h3>
              <p className="text-sm text-cream-dim leading-relaxed">
                Drop any <code>.md</code>, <code>.markdown</code>, or whole directories right into the browser window, or paste clipboard text anytime.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-8 rounded-3xl bg-forest border border-line flex flex-col items-start text-left relative overflow-hidden group hover:border-orange/60 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-orange/20 border border-orange text-orange flex items-center justify-center mb-6 font-display text-2xl">
                2
              </div>
              <h3 className="font-display text-2xl text-cream mb-2">
                Sort into collections
              </h3>
              <p className="text-sm text-cream-dim leading-relaxed">
                Create color-coded collections for Claude rules, Cursor prompts, project readmes, or agent setups. Tag files freely.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-8 rounded-3xl bg-forest border border-line flex flex-col items-start text-left relative overflow-hidden group hover:border-orange/60 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-orange/20 border border-orange text-orange flex items-center justify-center mb-6 font-display text-2xl">
                3
              </div>
              <h3 className="font-display text-2xl text-cream mb-2">
                Drop or copy anywhere
              </h3>
              <p className="text-sm text-cream-dim leading-relaxed">
                Copy prompt-ready blocks with file headers, fenced code blocks, or drag files out directly onto your desktop or IDE chats.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 border-t border-line">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-mono text-orange font-bold">
              Handmade craft tools
            </span>
            <h2 className="font-display text-4xl sm:text-5xl text-cream mt-2">
              Designed for power users
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-forest border border-line space-y-3">
              <div className="w-10 h-10 rounded-xl bg-forest-dark border border-line flex items-center justify-center text-orange">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-display text-xl text-cream">
                Prompt bundles
              </h3>
              <p className="text-xs text-cream-dim leading-relaxed">
                Select multiple files and copy them as a unified prompt block with individual headers for AI model context.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-forest border border-line space-y-3">
              <div className="w-10 h-10 rounded-xl bg-forest-dark border border-line flex items-center justify-center text-orange">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="font-display text-xl text-cream">
                Instant fuzzy search
              </h3>
              <p className="text-xs text-cream-dim leading-relaxed">
                Powered by client-side MiniSearch indexing over title, filename, tags, and full body content.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-forest border border-line space-y-3">
              <div className="w-10 h-10 rounded-xl bg-forest-dark border border-line flex items-center justify-center text-orange">
                <GripVertical className="w-5 h-5" />
              </div>
              <h3 className="font-display text-xl text-cream">
                Native drag-out
              </h3>
              <p className="text-xs text-cream-dim leading-relaxed">
                Drag files right out of the browser window into your file explorer or text input areas.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-forest border border-line space-y-3">
              <div className="w-10 h-10 rounded-xl bg-forest-dark border border-line flex items-center justify-center text-orange">
                <History className="w-5 h-5" />
              </div>
              <h3 className="font-display text-xl text-cream">
                Version history
              </h3>
              <p className="text-xs text-cream-dim leading-relaxed">
                Every edit captures an automatic snapshot so you can preview past versions and restore with one click.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-forest border border-line space-y-3">
              <div className="w-10 h-10 rounded-xl bg-forest-dark border border-line flex items-center justify-center text-orange">
                <HardDrive className="w-5 h-5" />
              </div>
              <h3 className="font-display text-xl text-cream">
                Full zip export
              </h3>
              <p className="text-xs text-cream-dim leading-relaxed">
                Export your stash as a real zip containing nested folders and manifest.json. Never locked in.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-forest border border-line space-y-3">
              <div className="w-10 h-10 rounded-xl bg-forest-dark border border-line flex items-center justify-center text-orange">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-display text-xl text-cream">
                Offline PWA
              </h3>
              <p className="text-xs text-cream-dim leading-relaxed">
                Installable as a standalone desktop app that works completely offline with zero server requirements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 border-t border-line bg-forest/20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl text-cream">
              Perfect for repeated context
            </h2>
            <p className="text-xs text-cream-dim mt-2">
              Stop digging through old repos to find your favorite prompt files.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {['CLAUDE.md', 'AGENTS.md', '.cursorrules', 'System prompts', 'API cheatsheets', 'README starters', 'Code snippets', 'Meeting notes'].map((item) => (
              <div
                key={item}
                className="p-4 rounded-xl bg-forest border border-line font-mono text-xs text-cream font-bold hover:border-orange transition-colors"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA & Footer */}
      <section className="py-24 border-t border-line text-center px-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="font-display text-5xl sm:text-6xl text-cream">
            Stash your first file. <br />
            Drop it anywhere.
          </h2>
          <p className="text-sm text-cream-dim max-w-md mx-auto">
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

      {/* Footer */}
      <footer className="border-t border-line py-8 px-6 bg-forest-dark text-xs text-cream-dim">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display text-lg text-cream">
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
