import React, { useState } from 'react';
import { useUIStore } from '../../store/uiStore';
import { useFiles } from '../../hooks/useDb';
import { buildBundleText } from '../../domain/bundle';
import { CopyMode } from '../../domain/types';
import { Button } from '../ui/Button';
import { Layers, Copy, X, Check, ArrowRight } from 'lucide-react';

export const BundleTray: React.FC = () => {
  const { selectedFileIds, clearSelection, showToast } = useUIStore();
  const allFiles = useFiles();
  const [copyMode, setCopyMode] = useState<CopyMode>('prompt');
  const [isCopied, setIsCopied] = useState(false);

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

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-[92%] animate-slideUp">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 bg-forest border-2 border-pink rounded-2xl shadow-glow text-cream">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-9 h-9 rounded-xl bg-pink/20 border border-pink flex items-center justify-center text-pink shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-xl uppercase tracking-wider text-cream">
                Bundle Selected
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-pink text-forest font-extrabold">
                {selectedFiles.length} files
              </span>
            </div>
            <p className="text-[11px] text-cream-dim truncate max-w-xs sm:max-w-md">
              {selectedFiles.map((f) => f.filename).join(', ')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Format dropdown */}
          <select
            value={copyMode}
            onChange={(e) => setCopyMode(e.target.value as CopyMode)}
            className="bg-forest-dark border border-line text-xs rounded-full px-3 py-2 text-cream focus:outline-none focus:border-pink cursor-pointer"
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
            className="p-1.5 rounded-full text-cream-dim hover:text-cream hover:bg-cream-faint transition-colors"
            title="Clear selection"
            aria-label="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
