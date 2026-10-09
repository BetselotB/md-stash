import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface Candidate {
  id: string;
  name: string;
  family: string;
  weight: string;
  notes: string;
  recommended?: boolean;
}

const CANDIDATES: Candidate[] = [
  {
    id: 'chelsea-market',
    name: 'Chelsea Market',
    family: "'Chelsea Market', cursive, sans-serif",
    weight: '400',
    notes: 'Medium-bold stroke (~1/4 cap height), near-monoline, hand-cut retro bohemian sans with round terminals, wide-open C, low crossbars on A/E/H, quirky imperfect edges, and beautiful authentic lowercase glyphs. Closest match to the Brew District craft aesthetic.',
    recommended: true,
  },
  {
    id: 'alumni-sans',
    name: 'Alumni Sans ExtraBold',
    family: "'Alumni Sans', sans-serif",
    weight: '800',
    notes: 'Condensed tall retro/art-deco sans with low crossbars and tight tracking. Geometric terminals, slightly cleaner than the reference hand-cut style.',
  },
  {
    id: 'londrina-solid',
    name: 'Londrina Solid',
    family: "'Londrina Solid', cursive, sans-serif",
    weight: '400 / 900',
    notes: 'Hand-crafted poster letterpress style with friendly rounded corners and authentic lowercase characters.',
  },
  {
    id: 'passion-one',
    name: 'Passion One',
    family: "'Passion One', sans-serif",
    weight: '700',
    notes: 'Punchy retro condensed headline font. Thicker stroke weight with tight spacing, but heavier and less art-deco than the reference.',
  },
  {
    id: 'lilita-one',
    name: 'Lilita One',
    family: "'Lilita One', cursive, sans-serif",
    weight: '400',
    notes: 'Bold, slightly rounded display face with retro packaging feel, wider proportions.',
  },
  {
    id: 'gluten',
    name: 'Gluten',
    family: "'Gluten', cursive, sans-serif",
    weight: '700',
    notes: 'Bouncy, quirky personality with rounded terminals, highly expressive and organic.',
  },
  {
    id: 'sniglet',
    name: 'Sniglet ExtraBold',
    family: "'Sniglet', cursive, sans-serif",
    weight: '800',
    notes: 'Rounded and friendly, softer and wider aesthetic.',
  },
  {
    id: 'bagel-fat-one',
    name: 'Bagel Fat One',
    family: "'Bagel Fat One', cursive, sans-serif",
    weight: '400',
    notes: 'Heavy puffy display face, thicker stroke than reference.',
  },
  {
    id: 'limelight',
    name: 'Limelight',
    family: "'Limelight', cursive, sans-serif",
    weight: '400',
    notes: 'Classic geometric art-deco theatre font with dramatic contrast strokes.',
  },
];

export const DevFonts: React.FC = () => {
  const [headline, setHeadline] = useState('Your markdown, stashed.');
  const [subline, setSubline] = useState('Markdown craft for your desktop.');

  return (
    <div className="min-h-screen bg-sage text-cream p-6 md:p-12 font-sans selection:bg-orange selection:text-forest">
      <div className="max-w-6xl mx-auto space-y-10">
        <header className="border-b border-cream/20 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-orange/20 text-orange font-mono text-xs font-bold">
                Font Lab
              </span>
              <h1 className="text-2xl font-bold tracking-tight">Display Font Candidates</h1>
            </div>
            <p className="text-sm text-cream-dim">
              Comparing 9 self-hosted candidates against the Brew District reference traits: medium-bold, near-monoline, condensed, hand-cut retro sans with round terminals, wide-open C, low crossbars, tight letter spacing, and real lowercase glyphs.
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

        {/* Live Input Controls */}
        <section className="p-6 rounded-2xl bg-forest border border-cream/20 space-y-4">
          <label className="block text-xs font-mono text-orange font-bold tracking-wider">
            Headline text (sentence case)
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
            className="w-full px-4 py-2.5 rounded-xl bg-forest-dark border border-cream/20 text-cream-dim focus:outline-none focus:border-orange font-medium text-xs"
          />
        </section>

        {/* Font Candidate Comparison List */}
        <div className="space-y-8">
          {CANDIDATES.map((c) => (
            <div
              key={c.id}
              className={`p-8 rounded-3xl bg-forest border transition-all ${
                c.recommended
                  ? 'border-orange shadow-glow ring-2 ring-orange/40'
                  : 'border-cream/20 hover:border-cream/40'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-cream/15 pb-4 mb-6">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-cream">{c.name}</h2>
                    {c.recommended && (
                      <span className="px-3 py-0.5 rounded-full bg-orange text-forest text-xs font-bold tracking-wider">
                        Closest Match
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-cream-dim mt-1 max-w-3xl">{c.notes}</p>
                </div>
                <div className="text-right font-mono text-xs text-orange shrink-0">
                  <span>Weight: {c.weight}</span>
                </div>
              </div>

              {/* Sample Nav Row in this font */}
              <div className="mb-6 p-4 rounded-xl bg-sage/20 border border-cream/10 flex flex-wrap items-center justify-between gap-4">
                <span className="text-xs font-mono text-cream-dim/60">Nav row sample:</span>
                <div className="flex items-center gap-6" style={{ fontFamily: c.family }}>
                  <span className="text-base text-cream">Home</span>
                  <span className="text-base text-cream">Menu</span>
                  <span className="px-4 py-1.5 rounded-full bg-orange text-forest text-sm font-bold">
                    Open MDstash
                  </span>
                </div>
              </div>

              {/* Headline Render */}
              <div className="bg-sage/40 p-6 rounded-2xl border border-cream/10 mb-6">
                <div
                  style={{ fontFamily: c.family, lineHeight: 0.95 }}
                  className="text-4xl md:text-6xl text-cream tracking-tight max-w-4xl"
                >
                  {headline}
                </div>
                <p
                  style={{ fontFamily: c.family }}
                  className="mt-3 text-cream/90 text-lg md:text-xl"
                >
                  {subline}
                </p>
              </div>

              {/* Lowercase Glyph & Character Inspection */}
              <div className="space-y-2 pt-2 border-t border-cream/10">
                <div className="text-xs font-mono text-cream-dim flex justify-between">
                  <span>Glyph check (wide-open C, low crossbars, real lowercase):</span>
                  <span className="text-[11px] text-cream-dim/70">font-family: {c.family}</span>
                </div>
                <div
                  style={{ fontFamily: c.family }}
                  className="text-2xl text-cream-dim tracking-wider"
                >
                  Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz 0123456789
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
