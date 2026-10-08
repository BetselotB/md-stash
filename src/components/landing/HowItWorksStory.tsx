import React, { useState, useEffect, useRef } from 'react';
import { ArrowDown, Check, Copy, FileText, Layers, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    num: 1,
    badge: 'Step 01',
    title: 'Drop your markdown in.',
    desc: 'Drag CLAUDE.md, AGENTS.md, .cursorrules, or entire directory trees right into the browser. Zero servers, instant local indexing.',
    highlight: 'Dashed drop-zone with springy ingest',
  },
  {
    num: 2,
    badge: 'Step 02',
    title: 'Sort into color drawers.',
    desc: 'Organize files into color-coded collections for agent rules, system prompts, or starter templates. Auto-tag and pin your favorites.',
    highlight: 'Drawers for Agent rules, Prompts & Notes',
  },
  {
    num: 3,
    badge: 'Step 03',
    title: 'Drop or copy anywhere.',
    desc: 'Pull out any file and drag it straight into your IDE or AI chat. Toggle between raw markdown, code block, and prompt-ready format with file headers.',
    highlight: 'Prompt-ready format in one click',
  },
];

export const HowItWorksStory: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(1);
  const [copyMode, setCopyMode] = useState<'raw' | 'codeblock' | 'prompt'>('prompt');
  const [isCopied, setIsCopied] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || !containerRef.current) return;
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test') return;

    const ctx = gsap.context(() => {
      // Pin the section on desktop and scrub through steps 1 -> 2 -> 3
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top 80px',
        end: '+=200%',
        pin: true,
        scrub: 0.5,
        onUpdate: (self) => {
          const progress = self.progress;
          if (progress < 0.35) {
            setActiveStep(1);
          } else if (progress < 0.7) {
            setActiveStep(2);
          } else {
            setActiveStep(3);
          }
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  const handleCopy = () => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1500);
  };

  return (
    <div
      ref={containerRef}
      id="how-it-works"
      className="relative w-full py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 selection:bg-orange selection:text-forest"
    >
      {/* Section Header */}
      <div className="text-center mb-12 md:mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream-dim border border-line-ink text-xs font-mono text-ink font-semibold">
          <span className="text-orange">#</span>
          <span>Pinned workflow story</span>
        </div>
        <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-ink mt-3 tracking-tight">
          How MDstash works
        </h2>
        <p className="text-sm sm:text-base text-ink/75 max-w-xl mx-auto mt-2 font-sans">
          From loose markdown files to an organized, prompt-ready library you can drop anywhere.
        </p>
      </div>

      {/* Main Grid: Left Steps Controller + Right Illustrated Interactive Scene */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* ================= LEFT COLUMN: STEP TEXT & VERTICAL PROGRESS LINE ================= */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <div className="relative pl-8 md:pl-10 space-y-8 md:space-y-12">
            {/* Vertical Progress Line with # Ornaments */}
            <div className="absolute left-3 top-2 bottom-2 w-[2px] bg-line-ink">
              <div
                className="w-full bg-orange transition-all duration-300"
                style={{
                  height: activeStep === 1 ? '33%' : activeStep === 2 ? '66%' : '100%',
                }}
              />
              {/* Top and Bottom # Ornaments */}
              <div className="absolute -top-3 -left-1.5 font-mono text-[11px] font-bold text-orange">
                #
              </div>
              <div className="absolute -bottom-3 -left-1.5 font-mono text-[11px] font-bold text-orange">
                #
              </div>
            </div>

            {/* Steps List */}
            {STEPS.map((step) => {
              const isActive = activeStep === step.num;
              return (
                <div
                  key={step.num}
                  onClick={() => setActiveStep(step.num)}
                  className={`group cursor-pointer transition-all duration-300 p-4 rounded-2xl ${
                    isActive
                      ? 'bg-cream-dim/80 shadow-stamp border border-line-ink'
                      : 'opacity-50 hover:opacity-80'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {/* Stamped Circular Step Badge */}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all shadow-sm ${
                        isActive
                          ? 'bg-orange text-forest scale-105'
                          : 'bg-cream-dim text-ink border border-line-ink'
                      }`}
                    >
                      {step.num}
                    </div>
                    <span className="font-mono text-[11px] text-ink/70 font-semibold">
                      {step.badge}
                    </span>
                  </div>

                  <h3
                    className={`font-display text-2xl sm:text-3xl tracking-tight transition-colors ${
                      isActive ? 'text-ink' : 'text-ink/70'
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-ink/80 mt-1.5 leading-relaxed font-sans">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= RIGHT COLUMN: ONE BIG ILLUSTRATED SCENE ================= */}
        <div className="lg:col-span-7">
          <div className="relative min-h-[460px] md:min-h-[520px] rounded-3xl bg-cream-dim/40 border-2 border-line-ink p-6 sm:p-8 flex flex-col items-center justify-center overflow-hidden shadow-card">
            {/* Top Stage Indicator */}
            <div className="absolute top-4 left-6 right-6 flex items-center justify-between text-xs font-mono text-ink/60 border-b border-line-ink/40 pb-2">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange animate-ping" />
                Active Stage: Step {activeStep} of 3
              </span>
              <span>Local IndexedDB Sandbox</span>
            </div>

            {/* ================= STAGE 1: DROP ================= */}
            {activeStep === 1 && (
              <div className="w-full flex flex-col items-center justify-center py-6 animate-fadeIn">
                {/* Dashed Drop-zone Outline */}
                <div className="w-full max-w-md border-2 border-dashed border-orange rounded-3xl p-6 sm:p-8 bg-cream/70 flex flex-col items-center text-center relative shadow-sm">
                  <div className="w-14 h-14 rounded-2xl bg-orange/20 border border-orange text-orange flex items-center justify-center mb-4">
                    <ArrowDown className="w-7 h-7 animate-bounce" />
                  </div>
                  <div className="font-display text-2xl text-ink">
                    Drop markdown files here
                  </div>
                  <p className="text-xs text-ink/75 mt-1 font-sans">
                    .md, .markdown, folders or paste text
                  </p>

                  {/* 4 Falling Markdown File Cards */}
                  <div className="grid grid-cols-2 gap-2.5 w-full mt-6">
                    {[
                      { name: 'CLAUDE.md', tag: 'memory', delay: '0ms' },
                      { name: 'AGENTS.md', tag: 'rules', delay: '100ms' },
                      { name: '.cursorrules', tag: 'cursor', delay: '200ms' },
                      { name: 'README.md', tag: 'starter', delay: '300ms' },
                    ].map((f) => (
                      <div
                        key={f.name}
                        className="p-3 bg-forest-dark border border-line rounded-xl text-left shadow-sm transition-transform hover:scale-105"
                        style={{
                          animation: 'fadeIn 300ms ease-out forwards',
                          animationDelay: f.delay,
                        }}
                      >
                        <div className="flex items-center gap-1.5 text-xs font-bold text-cream font-mono truncate">
                          <FileText className="w-3.5 h-3.5 text-orange shrink-0" />
                          <span className="truncate">{f.name}</span>
                        </div>
                        <span className="inline-block mt-1 text-[10px] px-1.5 py-0.2 rounded bg-forest border border-line text-orange font-mono">
                          #{f.tag}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Central Ingesting Crate */}
                  <div className="mt-6 flex items-center gap-2 text-xs font-mono text-ink/80">
                    <img src="/logo.svg" alt="Crate" className="w-6 h-6 object-contain" />
                    <span>Ingesting straight to local stash</span>
                  </div>
                </div>
              </div>
            )}

            {/* ================= STAGE 2: SORT INTO 3 DRAWERS ================= */}
            {activeStep === 2 && (
              <div className="w-full flex flex-col items-center justify-center py-4 animate-fadeIn">
                <div className="w-full max-w-lg space-y-4">
                  {/* Drawer 1: Agent Rules (Orange Label) */}
                  <div className="p-4 rounded-2xl bg-cream border-2 border-orange/80 shadow-sm transition-transform hover:scale-[1.01]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-orange text-forest text-xs font-bold font-mono">
                          Agent rules
                        </span>
                        <span className="text-xs font-mono text-ink/70">2 files</span>
                      </div>
                      <span className="text-[11px] font-mono text-orange font-bold">#active</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <div className="px-3 py-1.5 rounded-lg bg-forest text-cream font-mono text-xs flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-orange" />
                        <span>CLAUDE.md</span>
                        <span className="text-[10px] text-orange">#claude</span>
                      </div>
                      <div className="px-3 py-1.5 rounded-lg bg-forest text-cream font-mono text-xs flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-orange" />
                        <span>AGENTS.md</span>
                        <span className="text-[10px] text-orange">#rules</span>
                      </div>
                    </div>
                  </div>

                  {/* Drawer 2: Prompts (Forest Label) */}
                  <div className="p-4 rounded-2xl bg-cream border-2 border-forest shadow-sm transition-transform hover:scale-[1.01]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-forest text-cream text-xs font-bold font-mono">
                          Prompts
                        </span>
                        <span className="text-xs font-mono text-ink/70">1 file</span>
                      </div>
                      <span className="text-[11px] font-mono text-forest font-bold">#editor</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <div className="px-3 py-1.5 rounded-lg bg-forest text-cream font-mono text-xs flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-orange" />
                        <span>.cursorrules</span>
                        <span className="text-[10px] text-orange">#cursor</span>
                      </div>
                    </div>
                  </div>

                  {/* Drawer 3: Notes (Sage Label) */}
                  <div className="p-4 rounded-2xl bg-cream border-2 border-sage-deep shadow-sm transition-transform hover:scale-[1.01]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-sage-deep text-cream text-xs font-bold font-mono">
                          Notes & Starters
                        </span>
                        <span className="text-xs font-mono text-ink/70">1 file</span>
                      </div>
                      <span className="text-[11px] font-mono text-sage-deep font-bold">#starter</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <div className="px-3 py-1.5 rounded-lg bg-forest text-cream font-mono text-xs flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-orange" />
                        <span>README.md</span>
                        <span className="text-[10px] text-orange">#readme</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= STAGE 3: DROP ANYWHERE (MOCK EDITOR & CHAT) ================= */}
            {activeStep === 3 && (
              <div className="w-full flex flex-col items-center justify-center py-2 animate-fadeIn">
                <div className="w-full max-w-lg space-y-3">
                  {/* Mock Editor Window */}
                  <div className="rounded-2xl bg-forest-dark border border-line text-cream overflow-hidden shadow-md">
                    {/* Window Title Bar */}
                    <div className="px-4 py-2 bg-forest/80 border-b border-line flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                          <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                        </div>
                        <span className="font-mono text-xs text-cream-dim ml-2 font-bold">
                          CLAUDE.md
                        </span>
                      </div>

                      {/* Working Copy Mode Toggle */}
                      <div className="flex items-center gap-1 bg-forest-dark p-0.5 rounded-lg border border-line text-[10px] font-mono">
                        {(['raw', 'codeblock', 'prompt'] as const).map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setCopyMode(m)}
                            className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                              copyMode === m
                                ? 'bg-orange text-forest font-bold'
                                : 'text-cream-dim hover:text-cream'
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Window Code Content */}
                    <div className="p-4 font-mono text-xs leading-relaxed text-cream-dim/90 max-h-36 overflow-y-auto">
                      {copyMode === 'prompt' && (
                        <div>
                          <span className="text-orange font-bold">### File: CLAUDE.md</span>
                          <br />
                          <span className="text-emerald-400"># Claude Project Memory & Rules</span>
                          <br />
                          <span>- Local-first architecture</span>
                          <br />
                          <span>- Zero telemetry or cloud sync</span>
                        </div>
                      )}
                      {copyMode === 'codeblock' && (
                        <div>
                          <span className="text-orange">```markdown</span>
                          <br />
                          <span># Claude Project Memory & Rules</span>
                          <br />
                          <span>- Local-first architecture</span>
                          <br />
                          <span className="text-orange">```</span>
                        </div>
                      )}
                      {copyMode === 'raw' && (
                        <div>
                          <span># Claude Project Memory & Rules</span>
                          <br />
                          <span>- Local-first architecture</span>
                          <br />
                          <span>- Zero telemetry or cloud sync</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mock Chat Input Window */}
                  <div className="p-3.5 rounded-2xl bg-cream border border-line-ink shadow-sm flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs font-mono text-ink/75 truncate">
                      <Sparkles className="w-4 h-4 text-orange shrink-0" />
                      <span className="truncate">
                        Ask Claude or Cursor (dragged file context attached)
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopy}
                      className="shrink-0 px-3 py-1.5 rounded-full bg-orange text-forest font-mono text-xs font-bold flex items-center gap-1.5 hover:bg-orange-deep transition-colors cursor-pointer shadow-sm"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'Copied!' : 'Copy format'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
