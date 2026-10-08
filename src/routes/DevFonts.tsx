import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const FONT_CANDIDATES = [
  {
    id: 'passion-one',
    name: 'Passion One',
    family: "'Passion One', sans-serif",
    weight: '700 / 900',
    character: 'Chunky, condensed retro headline face with tight leading, organic hand-cut feel, and true lowercase glyphs. Closest to the Brew District reference aesthetic.',
    recommended: true,
  },
  {
    id: 'londrina-solid',
    name: 'Londrina Solid',
    family: "'Londrina Solid', cursive",
    weight: '400 / 900',
    character: 'Rounded, organic hand-crafted letterpress style with friendly curves and great lowercase character.',
    recommended: false,
  },
  {
    id: 'alumni-sans',
    name: 'Alumni Sans',
    family: "'Alumni Sans', sans-serif",
    weight: '700 / 900',
    character: 'Ultra-condensed, tall, sleek vintage poster sans with tight horizontal space efficiency.',
    recommended: false,
  },
  {
    id: 'bowlby-one',
    name: 'Bowlby One',
    family: "'Bowlby One', cursive",
    weight: '400',
    character: 'Ultra-heavy 20th century advertising block display with immense weight and presence.',
    recommended: false,
  },
  {
    id: 'anton',
    name: 'Anton',
    family: "'Anton', sans-serif",
    weight: '400',
    character: 'Traditional condensed sans-serif wood-type revival; clean and punchy.',
    recommended: false,
  },
];

export const DevFonts: React.FC = () => {
  const [headline, setHeadline] = useState('Your markdown, stashed. Zero cloud, zero fuss.');
  const [subline, setSubline] = useState('Pure, local, and ready to drop anywhere.');

  return (
    <div className="min-h-screen bg-sage text-cream p-6 md:p-12 font-sans selection:bg-orange selection:text-forest">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="border-b border-cream/20 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-orange/20 text-orange font-mono text-xs font-bold">
                Dev Tool
              </span>
              <h1 className="text-2xl font-bold tracking-tight">Display Font Candidates</h1>
            </div>
            <p className="text-sm text-cream-dim">
              Comparing 5 self-hosted woff2 candidates in sentence case against the Brew District style language.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="px-4 py-2 rounded-xl bg-forest border border-cream/20 text-xs font-bold hover:bg-forest-light transition-colors"
            >
              Back to Landing
            </Link>
          </div>
        </header>

        {/* Live Controls */}
        <section className="p-6 rounded-2xl bg-forest border border-cream/20 space-y-4">
          <label className="block text-xs font-mono text-orange font-bold tracking-wider">
            Edit headline text (sentence case)
          </label>
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-forest-dark border border-cream/20 text-cream focus:outline-none focus:border-orange font-medium text-sm"
          />
          <input
            type="text"
            value={subline}
            onChange={(e) => setSubline(e.target.value)}
            className="w-full px-4 py-2 rounded-xl bg-forest-dark border border-cream/20 text-cream-dim focus:outline-none focus:border-orange font-medium text-xs"
          />
        </section>

        {/* Candidate Comparison Cards */}
        <div className="space-y-8">
          {FONT_CANDIDATES.map((c) => (
            <div
              key={c.id}
              className={`p-8 rounded-3xl bg-forest border transition-all ${
                c.recommended
                  ? 'border-orange shadow-glow ring-2 ring-orange/30'
                  : 'border-cream/20 hover:border-cream/40'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-cream/15 pb-4 mb-6">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-cream">{c.name}</h2>
                    {c.recommended && (
                      <span className="px-3 py-0.5 rounded-full bg-orange text-forest text-xs font-bold tracking-wider">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-cream-dim mt-1">{c.character}</p>
                </div>
                <div className="text-right font-mono text-xs text-orange">
                  <span>Weights: {c.weight}</span>
                </div>
              </div>

              {/* Headline Render */}
              <div className="bg-sage/40 p-6 rounded-2xl border border-cream/10 mb-6">
                <div
                  style={{ fontFamily: c.family, lineHeight: 0.95 }}
                  className="text-4xl md:text-6xl text-cream tracking-tight max-w-3xl"
                >
                  {headline}
                </div>
                <p className="mt-3 text-cream/90 text-sm md:text-base font-sans">
                  {subline}
                </p>
              </div>

              {/* Lowercase Glyph & Character Inspection */}
              <div className="space-y-2 pt-2 border-t border-cream/10">
                <div className="text-xs font-mono text-cream-dim flex justify-between">
                  <span>Lowercase glyph test:</span>
                  <span className="font-mono text-[11px] text-cream-dim/70">font-family: {c.family}</span>
                </div>
                <div
                  style={{ fontFamily: c.family }}
                  className="text-2xl text-cream-dim tracking-wider"
                >
                  abcdefghijklmnopqrstuvwxyz 0123456789 #.-_
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
