import React from 'react';
import { ExternalLink, Terminal, HardDrive, WifiOff } from 'lucide-react';
import { Pill } from '../ui/Pill';

export const VerificationSteps: React.FC = () => {
  return (
    <section className="py-20 sm:py-28 bg-cream text-ink border-t border-line-ink/40 relative">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
          <Pill>Independent verification</Pill>
          <h2 className="font-display text-4xl sm:text-5xl text-ink tracking-tight">
            Three ways to verify it yourself.
          </h2>
          <p className="text-sm sm:text-base text-ink/75 font-sans leading-relaxed">
            You do not need to take our word for anything. Here is how you can confirm it with your own tools.
          </p>
        </div>

        {/* 3 Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Step 1: Network tab */}
          <div className="p-6 rounded-2xl bg-cream-dim/60 border-2 border-line-ink flex flex-col justify-between space-y-4 shadow-sm hover:border-orange transition-colors">
            <div className="space-y-4">
              {/* Mini DevTools Illustration */}
              <div className="rounded-xl bg-forest text-cream p-3 font-mono text-[11px] space-y-2 border border-cream/10">
                <div className="flex items-center justify-between pb-1.5 border-b border-cream/10 text-[10px] text-cream/60">
                  <span className="flex items-center gap-1.5 font-display text-cream">
                    <Terminal className="w-3 h-3 text-orange" />
                    Network
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-forest-dark text-orange text-[9px]">
                    Fetch/XHR
                  </span>
                </div>
                <div className="py-3 text-center text-cream/40 text-[10px] font-sans">
                  (0 requests recorded)
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-mono text-orange font-bold">Step 1</div>
                <h3 className="font-display text-xl text-ink">
                  Inspect the network tab
                </h3>
                <p className="text-xs sm:text-sm text-ink/75 font-sans leading-relaxed">
                  Open your browser's DevTools with <kbd className="px-1 py-0.5 rounded bg-cream border border-line-ink font-mono text-[11px]">F12</kbd>. Select the Network tab and filter by Fetch/XHR. Edit notes and watch: zero outbound requests are ever fired.
                </p>
              </div>
            </div>
          </div>

          {/* Step 2: Application > IndexedDB */}
          <div className="p-6 rounded-2xl bg-cream-dim/60 border-2 border-line-ink flex flex-col justify-between space-y-4 shadow-sm hover:border-orange transition-colors">
            <div className="space-y-4">
              {/* Mini Storage Illustration */}
              <div className="rounded-xl bg-forest text-cream p-3 font-mono text-[11px] space-y-2 border border-cream/10">
                <div className="flex items-center justify-between pb-1.5 border-b border-cream/10 text-[10px] text-cream/60">
                  <span className="flex items-center gap-1.5 font-display text-cream">
                    <HardDrive className="w-3 h-3 text-orange" />
                    Application
                  </span>
                  <span className="text-cream-dim text-[9px]">IndexedDB</span>
                </div>
                <div className="space-y-1 text-[10px] text-cream/80 pl-1 font-mono">
                  <div className="text-orange">▾ MDstashDB</div>
                  <div className="pl-3 text-cream/60">▸ files</div>
                  <div className="pl-3 text-cream/60">▸ collections</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-mono text-orange font-bold">Step 2</div>
                <h3 className="font-display text-xl text-ink">
                  Read your IndexedDB directly
                </h3>
                <p className="text-xs sm:text-sm text-ink/75 font-sans leading-relaxed">
                  Open Application &gt; Storage &gt; IndexedDB &gt; <strong className="text-ink font-mono">MDstashDB</strong>. You will see every note, version, and collection stored locally in your browser as transparent JSON records.
                </p>
              </div>
            </div>
          </div>

          {/* Step 3: Go offline */}
          <div className="p-6 rounded-2xl bg-cream-dim/60 border-2 border-line-ink flex flex-col justify-between space-y-4 shadow-sm hover:border-orange transition-colors">
            <div className="space-y-4">
              {/* Mini Offline Illustration */}
              <div className="rounded-xl bg-forest text-cream p-3 font-mono text-[11px] space-y-2 border border-cream/10">
                <div className="flex items-center justify-between pb-1.5 border-b border-cream/10 text-[10px] text-cream/60">
                  <span className="flex items-center gap-1.5 font-display text-cream">
                    <WifiOff className="w-3 h-3 text-orange" />
                    Offline mode
                  </span>
                  <span className="text-green-400 text-[9px]">Active</span>
                </div>
                <div className="py-2.5 text-center text-cream/90 text-[10px] font-sans">
                  Ready with service worker precache
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-mono text-orange font-bold">Step 3</div>
                <h3 className="font-display text-xl text-ink">
                  Disconnect and test offline
                </h3>
                <p className="text-xs sm:text-sm text-ink/75 font-sans leading-relaxed">
                  Turn off Wi-Fi or enable airplane mode. Refresh the tab or open a saved bookmark. MDstash loads instantly from service worker cache with full search and editing capabilities.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* GitHub Source Verification Banner */}
        <div className="p-6 rounded-2xl bg-cream-dim border border-line-ink flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="font-display text-base text-ink">
              Verify our client code in the repository
            </div>
            <p className="text-xs text-ink/75 font-sans">
              MDstash is 100% open source. You can audit every database query, bundler rule, and component on GitHub.
            </p>
          </div>

          <a
            href="https://github.com/Jole-19/MDstash"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-forest hover:bg-forest-dark text-cream font-display text-xs transition-colors shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange"
          >
            <span>View source on GitHub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
};
