import React, { useState, useRef } from 'react';
import { Layers, Copy, Search, History, WifiOff, Check, ChevronLeft, ChevronRight } from 'lucide-react';

export const FeatureCrateLabels: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Demo 1: Bundles
  const [bundled, setBundled] = useState(false);

  // Demo 2: Copy Modes
  const [copyMode, setCopyMode] = useState<'raw' | 'code' | 'prompt'>('prompt');
  const [copied, setCopied] = useState(false);

  // Demo 3: Search
  const [searchQuery, setSearchQuery] = useState('agent');
  const searchItems = [
    { name: 'CLAUDE.md', tag: 'agent-rules', desc: 'Project instructions' },
    { name: 'AGENTS.md', tag: 'agent-rules', desc: 'Multi-agent system prompt' },
    { name: 'api-notes.md', tag: 'notes', desc: 'REST endpoints spec' },
    { name: 'prompts.md', tag: 'prompts', desc: 'Draft system instructions' },
  ];
  const filteredSearch = searchItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Demo 4: Version History
  const [versionIndex, setVersionIndex] = useState(2);
  const versions = [
    { ver: 'v1.0', time: '10 mins ago', text: '# Rules\n- Be concise' },
    { ver: 'v1.1', time: '5 mins ago', text: '# Rules\n- Be concise\n- Follow tokens' },
    { ver: 'v1.2', time: 'Just now', text: '# Rules\n- Be concise\n- Follow tokens\n- Local first' },
  ];

  // Demo 5: Offline
  const [offlineSimulated, setOfflineSimulated] = useState(false);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -380 : 380;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section id="features" className="py-20 relative bg-cream">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream-dim border border-line-ink text-[11px] font-mono text-ink font-bold mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-orange"></span>
              The Crate Label Lineup
            </div>
            <h2 className="font-display text-4xl sm:text-5xl text-ink leading-tight">
              Small batch tools, built for markdown.
            </h2>
            <p className="text-sm text-ink/75 max-w-lg mt-2 font-sans">
              Every feature is stamped like a vintage craft label. No bloat, no subscription traps, purely local craft.
            </p>
          </div>

          {/* Scroll navigation arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full border border-line-ink bg-cream-dim/60 hover:bg-cream hover:border-orange text-ink flex items-center justify-center transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-orange"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full border border-line-ink bg-cream-dim/60 hover:bg-cream hover:border-orange text-ink flex items-center justify-center transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-orange"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Horizontal Lineup of Crate Labels */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-8 pt-2 snap-x snap-mandatory scrollbar-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Label 1: The Binder (Bundles) */}
          <div className="min-w-[320px] sm:min-w-[360px] max-w-[360px] snap-center rounded-2xl bg-cream-dim/70 border-2 border-line-ink p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-orange/10 rounded-bl-full pointer-events-none" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono font-bold tracking-wider text-orange uppercase bg-orange/10 px-2 py-0.5 rounded border border-orange/20">
                  Label No. 01
                </span>
                <Layers className="w-5 h-5 text-ink/60" />
              </div>
              <h3 className="font-display text-2xl text-ink">The Binder</h3>
              <p className="text-xs text-ink/80 mt-1 font-sans">
                Stack multiple files into a single prompt block ready for context windows.
              </p>
            </div>

            {/* Mini Demo: Bundles */}
            <div className="my-6 p-4 rounded-xl bg-cream border border-line-ink/60 min-h-[140px] flex flex-col items-center justify-center">
              <div
                className="cursor-pointer relative w-full flex items-center justify-center h-20"
                onMouseEnter={() => setBundled(true)}
                onMouseLeave={() => setBundled(false)}
                onClick={() => setBundled(!bundled)}
                title="Hover or click to bundle"
              >
                <div
                  className={`absolute w-36 py-1.5 px-3 rounded-lg bg-forest text-cream font-mono text-[10px] border border-cream/20 shadow transition-all duration-300 ${
                    bundled
                      ? 'translate-y-0 scale-95 opacity-40'
                      : '-translate-y-4 -rotate-6'
                  }`}
                >
                  CLAUDE.md
                </div>
                <div
                  className={`absolute w-36 py-1.5 px-3 rounded-lg bg-sage text-cream font-mono text-[10px] border border-cream/20 shadow transition-all duration-300 ${
                    bundled
                      ? 'translate-y-0 scale-98 opacity-70'
                      : 'translate-y-0 rotate-0'
                  }`}
                >
                  rules.md
                </div>
                <div
                  className={`absolute w-36 py-1.5 px-3 rounded-lg bg-orange text-forest font-mono text-[10px] font-bold border border-forest/20 shadow transition-all duration-300 ${
                    bundled
                      ? 'translate-y-0 scale-100 shadow-md ring-2 ring-forest'
                      : 'translate-y-4 rotate-6'
                  }`}
                >
                  {bundled ? '📦 3 Files Bundled' : 'context.md'}
                </div>
              </div>
              <span className="text-[10px] text-ink/60 font-mono mt-2">
                {bundled ? '✓ Combined into 1 bundle' : 'Hover or tap to bundle cards'}
              </span>
            </div>

            <div className="text-[11px] font-mono text-ink/70 flex items-center justify-between border-t border-line-ink/40 pt-3">
              <span>Promise</span>
              <span className="font-bold text-ink">Zero copy-paste fragmentation</span>
            </div>
          </div>

          {/* Label 2: The Polyglot (Copy Modes) */}
          <div className="min-w-[320px] sm:min-w-[360px] max-w-[360px] snap-center rounded-2xl bg-cream-dim/70 border-2 border-line-ink p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono font-bold tracking-wider text-orange uppercase bg-orange/10 px-2 py-0.5 rounded border border-orange/20">
                  Label No. 02
                </span>
                <Copy className="w-5 h-5 text-ink/60" />
              </div>
              <h3 className="font-display text-2xl text-ink">The Polyglot</h3>
              <p className="text-xs text-ink/80 mt-1 font-sans">
                Toggle raw text, markdown fences, or full prompt wrappers before pasting.
              </p>
            </div>

            {/* Mini Demo: Copy Modes */}
            <div className="my-6 p-4 rounded-xl bg-cream border border-line-ink/60 min-h-[140px] flex flex-col justify-between">
              <div className="flex rounded-lg bg-cream-dim p-0.5 border border-line-ink/40">
                {(['raw', 'code', 'prompt'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setCopyMode(m)}
                    className={`flex-1 py-1 text-[10px] font-mono font-bold rounded capitalize transition-colors ${
                      copyMode === m
                        ? 'bg-ink text-cream shadow-sm'
                        : 'text-ink/70 hover:text-ink'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <div className="font-mono text-[10px] text-ink/80 p-2 bg-cream-dim/50 rounded border border-line-ink/20 my-2 truncate">
                {copyMode === 'raw' && 'You are an expert engineer.'}
                {copyMode === 'code' && '```markdown\n# CLAUDE.md\nYou are...'}
                {copyMode === 'prompt' && '<system>\nYou are an expert...</system>'}
              </div>

              <button
                onClick={handleCopy}
                className="w-full py-1 px-2 rounded bg-orange hover:bg-orange-deep text-forest font-mono text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied to clipboard!' : `Copy as ${copyMode}`}
              </button>
            </div>

            <div className="text-[11px] font-mono text-ink/70 flex items-center justify-between border-t border-line-ink/40 pt-3">
              <span>Promise</span>
              <span className="font-bold text-ink">Ready for every chat prompt</span>
            </div>
          </div>

          {/* Label 3: The Hound (Search) */}
          <div className="min-w-[320px] sm:min-w-[360px] max-w-[360px] snap-center rounded-2xl bg-cream-dim/70 border-2 border-line-ink p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono font-bold tracking-wider text-orange uppercase bg-orange/10 px-2 py-0.5 rounded border border-orange/20">
                  Label No. 03
                </span>
                <Search className="w-5 h-5 text-ink/60" />
              </div>
              <h3 className="font-display text-2xl text-ink">The Hound</h3>
              <p className="text-xs text-ink/80 mt-1 font-sans">
                Fuzzy instant lookup as fast as you strike keys. Filter by tags or filenames.
              </p>
            </div>

            {/* Mini Demo: Search */}
            <div className="my-6 p-4 rounded-xl bg-cream border border-line-ink/60 min-h-[140px] flex flex-col justify-between">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-ink/50 absolute left-2 top-2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type to filter..."
                  className="w-full pl-7 pr-2 py-1 text-[11px] font-mono bg-cream-dim border border-line-ink/60 rounded text-ink focus:outline-none focus:ring-1 focus:ring-orange"
                />
              </div>

              <div className="space-y-1.5 my-2">
                {filteredSearch.slice(0, 2).map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between p-1.5 rounded bg-cream-dim/40 border border-line-ink/20 text-[10px] font-mono"
                  >
                    <span className="font-bold text-ink">{item.name}</span>
                    <span className="text-orange bg-orange/10 px-1 rounded text-[9px]">
                      #{item.tag}
                    </span>
                  </div>
                ))}
                {filteredSearch.length === 0 && (
                  <div className="text-[10px] font-mono text-ink/50 text-center py-2">
                    No files match
                  </div>
                )}
              </div>

              <div className="flex gap-1">
                {['agent', 'notes', 'all'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag === 'all' ? '' : tag)}
                    className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cream-dim border border-line-ink/40 text-ink/80 hover:text-ink"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-[11px] font-mono text-ink/70 flex items-center justify-between border-t border-line-ink/40 pt-3">
              <span>Promise</span>
              <span className="font-bold text-ink">Sub-millisecond fuzzy search</span>
            </div>
          </div>

          {/* Label 4: The Time Machine (Version History) */}
          <div className="min-w-[320px] sm:min-w-[360px] max-w-[360px] snap-center rounded-2xl bg-cream-dim/70 border-2 border-line-ink p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono font-bold tracking-wider text-orange uppercase bg-orange/10 px-2 py-0.5 rounded border border-orange/20">
                  Label No. 04
                </span>
                <History className="w-5 h-5 text-ink/60" />
              </div>
              <h3 className="font-display text-2xl text-ink">The Time Machine</h3>
              <p className="text-xs text-ink/80 mt-1 font-sans">
                Automatic snapshots on every edit. Scrub through revisions and restore in one tap.
              </p>
            </div>

            {/* Mini Demo: Version History */}
            <div className="my-6 p-4 rounded-xl bg-cream border border-line-ink/60 min-h-[140px] flex flex-col justify-between">
              <div className="flex items-center justify-between font-mono text-[10px]">
                <span className="font-bold text-orange">{versions[versionIndex].ver}</span>
                <span className="text-ink/60">{versions[versionIndex].time}</span>
              </div>

              <div className="p-2 rounded bg-forest text-cream font-mono text-[9px] whitespace-pre-line leading-relaxed my-2 min-h-[50px]">
                {versions[versionIndex].text}
              </div>

              <div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  value={versionIndex}
                  onChange={(e) => setVersionIndex(Number(e.target.value))}
                  className="w-full accent-orange cursor-pointer"
                  aria-label="Version history slider"
                />
                <div className="flex justify-between text-[8px] font-mono text-ink/60">
                  <span>v1.0 (Initial)</span>
                  <span>v1.1</span>
                  <span>v1.2 (Current)</span>
                </div>
              </div>
            </div>

            <div className="text-[11px] font-mono text-ink/70 flex items-center justify-between border-t border-line-ink/40 pt-3">
              <span>Promise</span>
              <span className="font-bold text-ink">Zero lost changes, ever</span>
            </div>
          </div>

          {/* Label 5: The Hermit (Offline) */}
          <div className="min-w-[320px] sm:min-w-[360px] max-w-[360px] snap-center rounded-2xl bg-cream-dim/70 border-2 border-line-ink p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono font-bold tracking-wider text-orange uppercase bg-orange/10 px-2 py-0.5 rounded border border-orange/20">
                  Label No. 05
                </span>
                <WifiOff className="w-5 h-5 text-ink/60" />
              </div>
              <h3 className="font-display text-2xl text-ink">The Hermit</h3>
              <p className="text-xs text-ink/80 mt-1 font-sans">
                Zero internet connection required. Offline PWA and browser IndexedDB storage.
              </p>
            </div>

            {/* Mini Demo: Offline */}
            <div className="my-6 p-4 rounded-xl bg-cream border border-line-ink/60 min-h-[140px] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-ink/80">Network Status:</span>
                <button
                  onClick={() => setOfflineSimulated(!offlineSimulated)}
                  className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold border transition-colors ${
                    offlineSimulated
                      ? 'bg-orange/20 text-orange-deep border-orange'
                      : 'bg-sage/20 text-forest border-sage'
                  }`}
                >
                  {offlineSimulated ? 'Airplane Mode' : 'Online'}
                </button>
              </div>

              <div className="p-2.5 rounded bg-cream-dim border border-line-ink/40 space-y-1.5 my-2">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-forest">
                  <span className="w-2 h-2 rounded-full bg-forest animate-pulse"></span>
                  <span>IndexedDB: Ready (Local)</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-forest">
                  <span className="w-2 h-2 rounded-full bg-orange"></span>
                  <span>ServiceWorker: Cached</span>
                </div>
              </div>

              <div className="text-[9px] font-mono text-ink/70 text-center">
                {offlineSimulated
                  ? 'Works flawlessly offline without hiccups.'
                  : 'Tap switch to test airplane mode.'}
              </div>
            </div>

            <div className="text-[11px] font-mono text-ink/70 flex items-center justify-between border-t border-line-ink/40 pt-3">
              <span>Promise</span>
              <span className="font-bold text-ink">Runs on airplanes and cabins</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
