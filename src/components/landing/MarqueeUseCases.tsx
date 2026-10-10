import React from 'react';
import { FileCode, Folder, Hash } from 'lucide-react';
import { Pill } from '../ui/Pill';

const ROW_1_FILES = [
  { name: 'CLAUDE.md', type: 'rules', tag: 'agent-context' },
  { name: 'AGENTS.md', type: 'system', tag: 'multi-agent' },
  { name: '.cursorrules', type: 'ide', tag: 'editor' },
  { name: 'prompts/system.md', type: 'folder', tag: 'system' },
  { name: 'README.md', type: 'doc', tag: 'documentation' },
  { name: 'api-reference.md', type: 'spec', tag: 'endpoints' },
  { name: 'code-review-rules.md', type: 'rules', tag: 'review' },
  { name: 'persona-prompt.md', type: 'prompt', tag: 'creative' },
];

const ROW_2_FILES = [
  { name: 'notes.md', type: 'notes', tag: 'scratchpad' },
  { name: 'meeting-notes.md', type: 'sync', tag: 'weekly' },
  { name: 'design-tokens.md', type: 'spec', tag: 'styling' },
  { name: 'prompts/critique.md', type: 'folder', tag: 'qa' },
  { name: 'checklist.md', type: 'tasks', tag: 'release' },
  { name: 'guidelines.md', type: 'rules', tag: 'team' },
  { name: 'context-window.md', type: 'prompt', tag: 'memory' },
  { name: 'shortcuts.md', type: 'cheatsheet', tag: 'keys' },
];

export const MarqueeUseCases: React.FC = () => {
  const sectionRef = React.useRef<HTMLElement>(null);
  const [isInView, setIsInView] = React.useState(false);

  React.useEffect(() => {
    if (!sectionRef.current) return;
    let unsubscribe: (() => void) | null = null;
    import('../../utils/sharedAnimationObserver').then(({ observeAnimationVisibility }) => {
      if (!sectionRef.current) return;
      unsubscribe = observeAnimationVisibility(sectionRef.current, (inView) => {
        setIsInView(inView);
      });
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <section ref={sectionRef} id="use-cases" className="py-20 bg-cream border-t border-line-ink/40 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 mb-10 text-center">
        <Pill className="mb-3">Every markdown pattern</Pill>
        <h2 className="font-display text-4xl sm:text-5xl text-ink leading-tight">
          Stash anything you don't want to retype.
        </h2>
        <p className="text-sm text-ink/75 max-w-lg mx-auto mt-2 font-sans">
          From complex multi-agent instructions to daily scratchpads, all your repeatable text sits in one local tray.
        </p>
      </div>

      {/* Marquee Row 1: Scrolling Left */}
      <div className="w-full overflow-hidden py-2 mask-linear">
        <div
          className="animate-marquee-left flex gap-4"
          style={{ animationPlayState: isInView ? 'running' : 'paused' }}
        >
          {/* Double list for smooth infinite looping */}
          {[...ROW_1_FILES, ...ROW_1_FILES].map((file, idx) => (
            <div
              key={`${file.name}-${idx}`}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-cream-dim/80 border border-line-ink font-mono text-xs text-ink font-bold hover:border-orange hover:bg-cream transition-colors shadow-sm select-none"
            >
              {file.type === 'folder' ? (
                <Folder className="w-3.5 h-3.5 text-orange" />
              ) : (
                <FileCode className="w-3.5 h-3.5 text-forest" />
              )}
              <span>{file.name}</span>
              <span className="text-[10px] text-orange bg-orange/15 px-1.5 py-0.5 rounded font-normal">
                #{file.tag}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Marquee Row 2: Scrolling Right */}
      <div className="w-full overflow-hidden py-3 mt-2">
        <div
          className="animate-marquee-right flex gap-4"
          style={{ animationPlayState: isInView ? 'running' : 'paused' }}
        >
          {/* Double list for smooth infinite looping */}
          {[...ROW_2_FILES, ...ROW_2_FILES].map((file, idx) => (
            <div
              key={`${file.name}-${idx}`}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-cream-dim/80 border border-line-ink font-mono text-xs text-ink font-bold hover:border-orange hover:bg-cream transition-colors shadow-sm select-none"
            >
              {file.type === 'folder' ? (
                <Folder className="w-3.5 h-3.5 text-orange" />
              ) : (
                <FileCode className="w-3.5 h-3.5 text-forest" />
              )}
              <span>{file.name}</span>
              <span className="text-[10px] text-forest bg-forest/10 px-1.5 py-0.5 rounded font-normal">
                #{file.tag}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center mt-8">
        <svg
          className="w-48 sm:w-64 h-3 text-ink/30 pointer-events-none"
          viewBox="0 0 240 10"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M 2 5 C 60 8, 180 8, 238 4"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </section>
  );
};
