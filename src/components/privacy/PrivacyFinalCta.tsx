import React from 'react';
import { Link } from 'react-router-dom';

export const PrivacyFinalCta: React.FC = () => {
  const lastUpdatedText = 'Last updated: October 2026';

  return (
    <>
      {/* ================= FINAL CTA ON SAGE ================= */}
      <section data-nav-theme="sage" className="py-24 sm:py-32 bg-sage text-cream border-t border-line text-center px-6 relative z-10">
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

          {/* Last Updated line */}
          <div className="pt-4 text-xs font-sans text-cream-dim/80">
            <span>{lastUpdatedText} · Built with local-first integrity.</span>
          </div>
        </div>
      </section>

      {/* ================= FOOTER IN FOREST ================= */}
      <footer data-nav-theme="sage" className="border-t border-line pt-12 pb-0 px-6 bg-forest text-xs text-cream relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 pb-8 border-b border-cream/10">
          <div className="flex items-center gap-2">
            <span className="font-display text-xl text-cream">
              MD<span className="text-orange">stash</span>
            </span>
            <span className="text-cream">· Organize and stash your markdown locally.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link
              to="/privacy"
              className="text-cream hover:text-orange focus:text-orange focus:outline-none transition-colors"
            >
              Privacy
            </Link>
            <a
              href="https://github.com/Jole-19/MDstash"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cream hover:text-orange focus:text-orange focus:outline-none transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>

        {/* Giant wordmark cropped at bottom edge */}
        <div
          className="w-full text-center select-none pointer-events-none overflow-hidden -mb-8 sm:-mb-14 md:-mb-20 pt-6"
          aria-hidden="true"
        >
          <span className="font-display text-[19vw] leading-none text-cream tracking-tighter block whitespace-nowrap">
            MD<span className="text-orange">stash</span>
          </span>
        </div>
      </footer>
    </>
  );
};
