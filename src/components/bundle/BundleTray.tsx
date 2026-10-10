import React, { useState } from 'react';
import { useUIStore } from '../../store/uiStore';
import { useFiles } from '../../hooks/useDb';
import { buildBundleText } from '../../domain/bundle';
import { CopyMode } from '../../domain/types';
import { Layers, Copy, X, Check, ArrowUp, ArrowDown, ListOrdered } from 'lucide-react';

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
      setTimeout(() => setIsCopied(false), 2000);
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

  return (
    <div
      data-lenis-prevent
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-[94%] animate-slideUp select-none"
    >
      <div className="flex flex-col bg-[#FDFAF2] border-2 border-orange/70 rounded-2xl shadow-[0_16px_36px_-6px_rgba(38,51,42,0.25)] text-ink overflow-hidden">
        {/* Main Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-9 h-9 rounded-xl bg-orange/20 border border-orange flex items-center justify-center text-orange-deep shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-lg tracking-tight text-ink">
                  Bundle selected
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-orange text-forest font-bold">
                  {selectedFiles.length} files
                </span>
              </div>
              {/* Selected filenames as small chips */}
              <div className="flex items-center gap-1.5 flex-wrap mt-1 max-w-xs sm:max-w-sm">
                {selectedFiles.slice(0, 3).map((f) => (
                  <span
                    key={f.id}
                    className="font-mono text-[10.5px] bg-[rgba(38,51,42,0.06)] border border-[rgba(38,51,42,0.12)] text-ink/80 px-2 py-0.5 rounded tracking-tight truncate max-w-[110px]"
                  >
                    {f.filename}
                  </span>
                ))}
                {selectedFiles.length > 3 && (
                  <span className="text-[10px] font-mono text-ink/50">
                    +{selectedFiles.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
            {/* Toggle Reorder list */}
            <button
              type="button"
              onClick={() => setIsReordering(!isReordering)}
              className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer ${
                isReordering
                  ? 'border-orange bg-orange text-forest font-bold'
                  : 'border-[rgba(38,51,42,0.2)] text-ink/70 hover:text-ink hover:bg-cream-dim/30'
              }`}
              title="Reorder bundle files"
              aria-label="Reorder bundle files"
            >
              <ListOrdered className="w-4 h-4" />
            </button>

            {/* Format choice dropdown */}
            <select
              value={copyMode}
              onChange={(e) => setCopyMode(e.target.value as CopyMode)}
              className="bg-cream border border-[rgba(38,51,42,0.2)] text-xs rounded-xl px-3 py-2 text-ink focus:outline-none focus:border-orange cursor-pointer font-sans"
              title="Bundle format"
            >
              <option value="prompt">Prompt-ready (### File)</option>
              <option value="codeblock">Fenced code block</option>
              <option value="raw">Raw markdown</option>
            </select>

            {/* Copy Bundle orange button */}
            <button
              type="button"
              onClick={handleCopyBundle}
              className="px-4 py-2 rounded-full bg-orange hover:bg-orange-deep text-forest font-display text-xs tracking-wide shadow-xs transition-all active:scale-[0.98] cursor-pointer flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-orange focus-visible:outline-none"
            >
              {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'Copied!' : 'Copy bundle'}</span>
            </button>

            {/* Clear button */}
            <button
              type="button"
              onClick={clearSelection}
              className="p-1.5 rounded-full text-ink/50 hover:text-ink hover:bg-cream-dim/30 transition-colors cursor-pointer"
              title="Clear selection"
              aria-label="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expandable Reorder List */}
        {isReordering && (
          <div className="px-5 py-3 border-t border-[rgba(38,51,42,0.12)] bg-[#F8F7E6] space-y-2 max-h-48 overflow-y-auto">
            <div className="text-[11px] font-semibold text-ink/70 tracking-tight">
              Order of files in bundle output:
            </div>
            {selectedFiles.map((f, idx) => (
              <div
                key={f.id}
                className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#FDFAF2] border border-[rgba(38,51,42,0.14)] text-xs"
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
                    className="p-1 text-ink/50 hover:text-ink disabled:opacity-20 cursor-pointer"
                    title="Move up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === selectedFiles.length - 1}
                    onClick={() => moveOrder(idx, 'down')}
                    className="p-1 text-ink/50 hover:text-ink disabled:opacity-20 cursor-pointer"
                    title="Move down"
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
