import React, { useState } from 'react';
import { useUIStore } from '../../store/uiStore';
import { useFiles } from '../../hooks/useDb';
import { buildBundleText } from '../../domain/bundle';
import { CopyMode } from '../../domain/types';
import { Layers, Copy, X, Check, ArrowUp, ArrowDown, ListOrdered } from 'lucide-react';
import { Select, SelectOption } from '../ui/Select';

const BUNDLE_FORMAT_OPTIONS: SelectOption<CopyMode>[] = [
  { value: 'prompt', label: 'Prompt-ready', hint: '### File' },
  { value: 'codeblock', label: 'Fenced code block', hint: '```markdown' },
  { value: 'raw', label: 'Raw markdown', hint: '---' },
];

export const BundleTray: React.FC = () => {
  const { selectedFileIds, selectFiles, clearSelection, showToast } = useUIStore();
  const allFiles = useFiles();
  const [copyMode, setCopyMode] = useState<CopyMode>('prompt');
  const [isCopied, setIsCopied] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  if (selectedFileIds.length < 2) return null;

  // Selected files preserving current order
  const selectedFiles = selectedFileIds
    .map((id) => allFiles.find((f) => f.id === id))
    .filter(Boolean) as typeof allFiles;

  const handleCopyBundle = async () => {
    try {
      const bundleText = buildBundleText(selectedFiles, { mode: copyMode });
      await navigator.clipboard.writeText(bundleText);
      setIsCopied(true);
      showToast(`Copied bundle (${selectedFiles.length} files) to clipboard!`, 'success');
      setTimeout(() => setIsCopied(false), 1200);
    } catch {
      showToast('Failed to copy bundle', 'error');
    }
  };

  const moveOrder = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= selectedFileIds.length) return;
    const next = [...selectedFileIds];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);
    selectFiles(next);
  };

  const fileNamesTooltip = selectedFiles.map((f) => f.filename).join(', ');

  return (
    <div
      data-lenis-prevent
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[94%] min-w-[640px] max-w-[880px] animate-slideUp select-none"
    >
      <div className="relative flex flex-col bg-[#D8D3BC] text-ink border border-[rgba(38,51,42,0.22)] rounded-2xl shadow-[0_16px_36px_-6px_rgba(38,51,42,0.25)] overflow-hidden focus-within:ring-2 focus-within:ring-orange/80">
        {/* Grain overlay on top */}
        <div
          className="pointer-events-none absolute inset-0 bg-paper-grain rounded-2xl"
          aria-hidden="true"
        />

        {/* Main Bar */}
        <div className="relative z-10 flex flex-row items-center justify-between gap-4 px-5 py-3.5">
          {/* Title and Count Group (flex: 0 0 auto, never wraps or stacks) */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-[rgba(38,51,42,0.08)] border border-[rgba(38,51,42,0.16)] flex items-center justify-center text-ink shrink-0">
              <Layers className="w-5 h-5 text-ink" />
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <span className="font-display text-base tracking-tight text-ink whitespace-nowrap">
                Bundle selected
              </span>
              <span
                className="text-xs px-2.5 py-0.5 rounded-full bg-orange text-ink font-mono font-bold whitespace-nowrap shrink-0 shadow-xs cursor-default"
                title={fileNamesTooltip}
              >
                {selectedFiles.length} files
              </span>
            </div>
          </div>

          {/* Controls Group on the right */}
          <div className="flex items-center gap-2.5 shrink-0 ml-auto">
            {/* Toggle Reorder list */}
            <button
              type="button"
              onClick={() => setIsReordering(!isReordering)}
              className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange ${
                isReordering
                  ? 'border-orange bg-orange text-ink font-bold shadow-xs'
                  : 'border-[rgba(38,51,42,0.22)] text-ink/75 hover:text-ink hover:bg-[rgba(38,51,42,0.08)]'
              }`}
              title="Reorder files"
              aria-label="Reorder files"
            >
              <ListOrdered className="w-4 h-4" />
            </button>

            {/* Custom accessible format dropdown */}
            <Select<CopyMode>
              value={copyMode}
              onChange={(val) => setCopyMode(val)}
              placement="up"
              label="Bundle format"
              options={BUNDLE_FORMAT_OPTIONS}
            />

            {/* Copy Bundle orange button */}
            <button
              type="button"
              onClick={handleCopyBundle}
              className="px-4 py-2 rounded-full bg-orange hover:bg-orange-deep text-ink font-display text-xs tracking-wide shadow-xs transition-colors active:scale-[0.98] cursor-pointer flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-orange focus-visible:outline-none"
            >
              {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'Copied!' : 'Copy bundle'}</span>
            </button>

            {/* Close button */}
            <button
              type="button"
              onClick={clearSelection}
              className="p-1.5 rounded-full text-ink/75 hover:text-ink hover:bg-[rgba(38,51,42,0.1)] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange"
              title="Close bundle tray"
              aria-label="Close bundle tray"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expandable Reorder List */}
        {isReordering && (
          <div className="relative z-10 px-5 py-3 border-t border-[rgba(38,51,42,0.16)] bg-[#CEC9B2] space-y-2 max-h-48 overflow-y-auto">
            <div className="text-[11px] font-semibold text-ink/75 tracking-tight">
              Order of files in bundle output:
            </div>
            {selectedFiles.map((f, idx) => (
              <div
                key={f.id}
                className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#D8D3BC] border border-[rgba(38,51,42,0.16)] text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="font-mono text-orange-deep font-bold">{idx + 1}.</span>
                  <span className="font-bold text-ink truncate">{f.title}</span>
                  <span className="font-mono text-ink/60 text-[11px] truncate">({f.filename})</span>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveOrder(idx, 'up')}
                    className="p-1 text-ink/60 hover:text-ink disabled:opacity-20 cursor-pointer"
                    title="Move up"
                    aria-label="Move up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === selectedFiles.length - 1}
                    onClick={() => moveOrder(idx, 'down')}
                    className="p-1 text-ink/60 hover:text-ink disabled:opacity-20 cursor-pointer"
                    title="Move down"
                    aria-label="Move down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
