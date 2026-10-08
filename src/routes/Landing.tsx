import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { StampBadge } from '../components/ui/StampBadge';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleScrollTo = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.querySelector(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-sage text-cream selection:bg-orange selection:text-forest overflow-x-hidden relative bg-sun-glow">
      {/* Top Header / Navigation */}
      <header className="relative z-20 border-b border-line px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        {/* Left Nav items */}
        <div className="flex items-center gap-6 text-xs font-bold text-cream-dim">
          <Link to="/" className="text-cream hover:text-orange transition-colors">
            Home
          </Link>
          <a
            href="#how-it-works"
            onClick={(e) => handleScrollTo(e, '#how-it-works')}
            className="hidden sm:inline-block hover:text-orange transition-colors"
          >
            How it works
          </a>
          <a
            href="#features"
            onClick={(e) => handleScrollTo(e, '#features')}
            className="hidden md:inline-block hover:text-orange transition-colors"
          >
            Features
          </a>
          <Link to="/privacy" className="hidden md:inline-block hover:text-orange transition-colors">
            Privacy
          </Link>
        </div>

        {/* Center Framed Badge */}
        <div className="border border-line px-4 py-1.5 rounded-sm flex flex-col items-center justify-center bg-forest-dark/40 shadow-stamp">
          <span className="font-display text-lg text-cream leading-tight">
            MD<span className="text-orange">stash</span>
          </span>
          <span className="text-[9px] text-cream-dim font-mono">
            Local · Est. 2026
          </span>
        </div>

        {/* Right Nav CTA */}
        <div className="flex items-center gap-4">
          <span className="hidden lg:inline-block font-mono text-[11px] text-cream-dim">
            Zero cloud · 100% local
          </span>
          <Link to="/app">
            <Button size="sm" variant="primary">
              Open MDstash
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Left Rotating Stamp Badge */}
        <div className="hidden lg:block absolute left-8 top-20 z-10">
          <StampBadge text="private & honest · local first · works offline · " size={120} />
        </div>

        {/* Right Floating Orange Tab */}
        <div className="hidden lg:flex absolute right-0 top-36 z-10">
          <Link
            to="/app"
            className="w-16 h-28 bg-orange rounded-l-full flex items-center justify-center text-forest hover:bg-orange-deep hover:w-20 transition-all shadow-glow cursor-pointer group"
            title="Open MDstash"
          >
            <div className="flex flex-col items-center gap-1">
              <img src="/logo.svg" alt="MDstash" className="w-8 h-8 group-hover:scale-110 transition-transform" />
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>

        {/* Hero Headlines & Floating Center Stash Can */}
        <div className="relative w-full max-w-5xl my-6 flex flex-col items-center">
          {/* Main Massive Chunky Headline in Sentence Case */}
          <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight leading-[0.92] text-cream select-none text-shadow-stamp">
            Your markdown, stashed. <br />
            Zero cloud, zero fuss.
          </h1>

          {/* Floating Logo Object */}
          <div
            className="my-6 relative z-10 transition-transform duration-300 ease-out cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => navigate('/app')}
            style={{
              transform: isHovered
                ? 'scale(1.08) translateY(-8px) rotate(-1deg)'
                : 'scale(1) translateY(0px)',
            }}
          >
            <div className="relative group">
              <div className="absolute inset-0 rounded-full bg-orange/25 blur-2xl group-hover:bg-orange/45 transition-all" />
              <img
                src="/logo.svg"
                alt="MDstash crate"
                className="relative w-44 sm:w-56 md:w-64 h-auto drop-shadow-2xl mx-auto"
              />
              <span className="inline-block mt-2 px-3 py-1 rounded-full bg-forest-dark/90 border border-line text-[11px] font-mono text-cream-dim group-hover:text-orange transition-colors">
                Click to open stash
              </span>
            </div>
          </div>

          {/* Subline */}
          <p className="font-display text-xl sm:text-2xl md:text-3xl text-cream-dim max-w-2xl mt-4">
            Pure, local, and ready to drop anywhere.
          </p>
          <p className="text-sm sm:text-base text-cream-dim/90 max-w-xl mt-2 leading-relaxed">
            Drag files in, organize into collections, and copy or drop them back into your IDE or AI chats. Nothing ever leaves your device.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <Link to="/app">
              <Button size="lg" variant="primary" icon={<ArrowRight className="w-5 h-5" />}>
                Open the app
              </Button>
            </Link>
            <a href="#how-it-works" onClick={(e) => handleScrollTo(e, '#how-it-works')}>
              <Button size="lg" variant="secondary">
                See how it works
              </Button>
            </a>
          </div>
        </div>

        {/* Bottom Hero Indicators */}
        <div className="w-full flex items-center justify-between pt-12 border-t border-line mt-12 text-xs font-mono text-cream-dim">
          <div className="flex items-center gap-2">
            <span className="text-orange text-sm font-bold">#</span>
            <span>Zero cloud · zero servers</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Works offline · stored in your browser</span>
            <span className="text-orange text-sm font-bold">#</span>
          </div>
        </div>
      </section>

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
