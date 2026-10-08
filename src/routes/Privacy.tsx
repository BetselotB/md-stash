import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/ui/Logo';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Shield, Lock, HardDrive, EyeOff } from 'lucide-react';

export const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-sage text-cream">
      {/* Top Bar */}
      <header className="px-6 py-5 border-b border-line flex items-center justify-between max-w-5xl mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <Logo size="sm" />
        </Link>
        <Link to="/app">
          <Button size="sm" variant="primary">
            Open MDstash
          </Button>
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 space-y-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-cream-dim hover:text-cream transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div>
          <h1 className="font-display text-5xl sm:text-6xl tracking-normal text-cream mb-2">
            Plain-Language Privacy
          </h1>
          <p className="text-cream-dim text-sm">
            Last updated: October 2026. Zero fluff, zero legalese.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-forest border border-line space-y-4">
          <div className="flex items-center gap-3 text-orange">
            <Shield className="w-6 h-6" />
            <h2 className="font-display text-2xl tracking-normal text-cream">
              The Fundamental Promise
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-cream-dim">
            <strong className="text-cream">MDstash has no backend server.</strong> There are no accounts, no analytics tracking pixels, no telemetry scripts, and no database in the cloud. Every single markdown file, collection name, and tag exists exclusively inside your local browser via IndexedDB.
          </p>
        </div>

        <div className="space-y-6 text-sm text-cream-dim leading-relaxed">
          <div className="space-y-2">
            <h3 className="font-bold text-lg text-cream flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-orange" />
              1. Where does your data go?
            </h3>
            <p>
              Nowhere. All data is saved inside your browser’s local IndexedDB engine. If you disconnect from the internet completely, MDstash continues to work without interruption.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-lg text-cream flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-orange" />
              2. Do we track your activity?
            </h3>
            <p>
              No. We do not use Google Analytics, PostHog, Mixpanel, cookies, or any tracking identifiers.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-lg text-cream flex items-center gap-2">
              <Lock className="w-5 h-5 text-orange" />
              3. Who can read your notes?
            </h3>
            <p>
              Only you and anyone with access to your device. When you copy markdown or export a zip archive, you maintain 100% control over where that text is pasted.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-line flex justify-between items-center text-xs text-cream-dim">
          <span>Crafted with care. Free & open.</span>
          <Link to="/app" className="text-orange font-bold hover:underline">
            Launch MDstash App →
          </Link>
        </div>
      </main>
    </div>
  );
};
