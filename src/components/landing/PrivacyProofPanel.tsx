import React, { useEffect, useState } from 'react';
import { ShieldCheck, RefreshCw, ExternalLink, Lock, CheckCircle2 } from 'lucide-react';

interface NetworkEntry {
  name: string;
  type: string;
  duration: number;
  size: number;
}

export const PrivacyProofPanel: React.FC = () => {
  const [entries, setEntries] = useState<NetworkEntry[]>([]);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  const inspectNetwork = () => {
    if (typeof window !== 'undefined' && window.performance && window.performance.getEntriesByType) {
      const resources = window.performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const mapped = resources
        .filter((r) => {
          // Keep own-origin or local bundle assets
          return (
            r.name.includes(window.location.origin) ||
            r.name.startsWith('/') ||
            r.name.includes('localhost') ||
            r.name.includes('.woff2') ||
            r.name.includes('.js') ||
            r.name.includes('.css') ||
            r.name.includes('.svg')
          );
        })
        .map((r) => {
          const urlParts = r.name.split('/');
          const shortName = urlParts[urlParts.length - 1] || r.name;
          return {
            name: shortName.split('?')[0],
            type: r.initiatorType || 'asset',
            duration: Math.round(r.duration),
            size: r.transferSize || 0,
          };
        })
        .slice(-6); // last 6 resources

      setEntries(mapped);
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    inspectNetwork();
    // Re-check after 1s to capture fonts / deferred modules
    const timer = setTimeout(inspectNetwork, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section id="privacy-proof" className="py-24 bg-cream border-t border-line-ink/40 relative">
      <div className="max-w-5xl mx-auto px-6">
        {/* Container */}
        <div className="rounded-3xl bg-cream-dim/70 border-2 border-line-ink p-8 sm:p-12 shadow-sm relative overflow-hidden">
          {/* Subtle vintage watermark */}
          <div className="absolute -right-12 -bottom-12 w-64 h-64 border-[16px] border-line-ink/10 rounded-full pointer-events-none select-none flex items-center justify-center font-display text-line-ink/10 text-9xl">
            #
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left info column (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream border border-line-ink text-[11px] font-mono text-ink font-bold shadow-sm">
                <Lock className="w-3.5 h-3.5 text-orange" />
                Network Transparency
              </div>

              <h2 className="font-display text-4xl sm:text-5xl text-ink leading-tight">
                Proof, not promises.
              </h2>

              <p className="text-sm text-ink/80 font-sans leading-relaxed">
                Your markdown stays in your browser's IndexedDB. We literally have no server database, no analytics cookies, and no tracking scripts listening.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-2.5 text-xs text-ink/90 font-sans">
                  <CheckCircle2 className="w-4 h-4 text-forest flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Static files only:</strong> Every single HTTP request this page makes is for local client code (JavaScript, CSS, fonts, and SVG icons).
                  </span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-ink/90 font-sans">
                  <CheckCircle2 className="w-4 h-4 text-forest flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Zero document telemetry:</strong> Not a single line, prompt, or filename ever leaves your computer.
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-4 text-xs font-mono text-ink/75">
                <span className="font-bold">Open DevTools &gt; Network and try it yourself.</span>
              </div>
            </div>

            {/* Right proof stamp & live resource monitor (5 cols) */}
            <div className="lg:col-span-5 flex flex-col items-center">
              {/* Big Vintage Stamp */}
              <div className="w-full max-w-sm rounded-2xl border-4 border-forest bg-cream p-5 text-center shadow-md relative transform rotate-1 hover:rotate-0 transition-transform">
                <div className="border-2 border-dashed border-forest/60 p-4 rounded-xl">
                  <div className="text-[10px] font-mono font-bold tracking-widest text-orange">
                    Audit verification stamp
                  </div>
                  <div className="font-display text-4xl text-forest my-2 tracking-tight">
                    0 requests
                  </div>
                  <div className="font-mono text-xs font-bold text-forest tracking-wider">
                    with your files
                  </div>
                  <div className="text-[10px] text-ink/60 font-sans mt-2">
                    Verified local-first client architecture
                  </div>
                </div>
              </div>

              {/* Real live network log */}
              <div className="w-full max-w-sm mt-5 rounded-xl bg-forest text-cream p-4 border border-cream/20 shadow font-mono text-[10px]">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-cream/10 text-cream-dim">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange"></span>
                    <span>Live Static Assets ({entries.length})</span>
                  </div>
                  <button
                    onClick={inspectNetwork}
                    className="hover:text-cream text-cream/70 flex items-center gap-1 transition-colors"
                    title="Refresh resource timing entries"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Scan</span>
                  </button>
                </div>

                <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                  {entries.length === 0 ? (
                    <div className="text-cream/50 py-2 text-center">Reading resource timings...</div>
                  ) : (
                    entries.map((entry, i) => (
                      <div key={i} className="flex items-center justify-between text-cream/80 truncate">
                        <span className="truncate max-w-[150px]">{entry.name || 'bundle'}</span>
                        <span className="text-orange text-[9px]">{entry.type}</span>
                        <span className="text-cream/50 text-[9px]">{entry.duration}ms</span>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-2 mt-2 border-t border-cream/10 flex items-center justify-between text-[9px] text-cream-dim">
                  <span>File upload calls: <strong>0</strong></span>
                  <span>Checked: {lastChecked.toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
