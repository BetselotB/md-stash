import React, { useState } from 'react';
import { useUIStore } from '../../store/uiStore';
import { useFiles } from '../../hooks/useDb';
import { buildBundleText } from '../../domain/bundle';
import { CopyMode } from '../../domain/types';
import { Button } from '../ui/Button';
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
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-[94%] animate-slideUp"
    >
      <div className="flex flex-col bg-forest border-2 border-orange rounded-2xl shadow-glow text-cream overflow-hidden">
        {/* Main Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-9 h-9 rounded-xl bg-orange/20 border border-orange flex items-center justify-center text-orange shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-xl tracking-normal text-cream">
                  Bundle Selected
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-orange text-forest font-extrabold">
                  {selectedFiles.length} files
                </span>
              </div>
              <p className="text-[11px] text-cream-dim truncate max-w-xs sm:max-w-sm">
                {selectedFiles.map((f) => f.filename).join(', ')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
            {/* Toggle Reorder list */}
            <button
              type="button"
              onClick={() => setIsReordering(!isReordering)}
              className={`p-2 rounded-full border text-xs transition-colors cursor-pointer ${
                isReordering
                  ? 'border-orange bg-orange text-forest font-bold'
                  : 'border-line text-cream-dim hover:text-cream hover:bg-forest-dark'
              }`}
              title="Reorder bundle files"
              aria-label="Reorder bundle files"
            >
              <ListOrdered className="w-4 h-4" />
            </button>

            {/* Format dropdown */}
            <select
              value={copyMode}
              onChange={(e) => setCopyMode(e.target.value as CopyMode)}
              className="bg-forest-dark border border-line text-xs rounded-full px-3 py-2 text-cream focus:outline-none focus:border-orange cursor-pointer"
              title="Bundle format"
            >
              <option value="prompt">Prompt-ready (### File)</option>
              <option value="codeblock">Fenced Code Block</option>
              <option value="raw">Raw Markdown</option>
            </select>

            {/* Copy Bundle button */}
            <Button
              size="sm"
              variant="primary"
              onClick={handleCopyBundle}
              icon={isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            >
              {isCopied ? 'Copied!' : 'Copy Bundle'}
            </Button>

            {/* Clear button */}
            <button
              type="button"
              onClick={clearSelection}
              className="p-1.5 rounded-full text-cream-dim hover:text-cream hover:bg-cream-faint transition-colors cursor-pointer"
              title="Clear selection"
              aria-label="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expandable Reorder List */}
        {isReordering && (
          <div className="px-5 py-3 border-t border-line/60 bg-forest-dark/70 space-y-2 max-h-48 overflow-y-auto">
            <div className="text-[11px] font-semibold text-cream-dim tracking-normal">
              Order of files in bundle output:
            </div>
            {selectedFiles.map((f, idx) => (
              <div
                key={f.id}
                className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-forest border border-line text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="font-mono text-orange font-bold">{idx + 1}.</span>
                  <span className="font-bold text-cream truncate">{f.title}</span>
                  <span className="font-mono text-cream-dim text-[11px] truncate">({f.filename})</span>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveOrder(idx, 'up')}
                    className="p-1 text-cream-dim hover:text-cream disabled:opacity-20 cursor-pointer"
                    title="Move up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === selectedFiles.length - 1}
                    onClick={() => moveOrder(idx, 'down')}
                    className="p-1 text-cream-dim hover:text-cream disabled:opacity-20 cursor-pointer"
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
