import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useFiles, usePinnedFiles, useCollections } from '../hooks/useDb';
import { useUIStore } from '../store/uiStore';
import { searchService } from '../services/search';
import { FileCard } from '../components/library/FileCard';
import { importExportService } from '../services/importExport';
import { importFilesList } from '../services/fileImport';
import { HardDrive, Download, X, Pin } from 'lucide-react';
import { CrateLogo } from '../components/ui/CrateLogo';

export const Library: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const filterType = searchParams.get('filter');

  const allFiles = useFiles();
  const pinnedFiles = usePinnedFiles();
  const collections = useCollections();

  const { searchQuery, activeTag, viewMode, showToast } = useUIStore();
  const [backupNudgeDismissed, setBackupNudgeDismissed] = useState(() => {
    return localStorage.getItem('mdstash_backup_nudge_dismissed') === 'true';
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keep MiniSearch index synchronized
  useEffect(() => {
    searchService.sync(allFiles);
  }, [allFiles]);

  const collectionMap = useMemo(() => {
    return new Map(collections.map((c) => [c.id, c]));
  }, [collections]);

  // Compute filtered files
  const filteredFiles = useMemo(() => {
    let files = allFiles;

    if (filterType === 'pinned') {
      files = files.filter((f) => f.pinned);
    }

    if (activeTag) {
      files = files.filter((f) => f.tags.includes(activeTag));
    }

    if (searchQuery.trim()) {
      const matchIds = new Set(searchService.search(searchQuery));
      files = files.filter((f) => matchIds.has(f.id));
    }

    return files;
  }, [allFiles, filterType, activeTag, searchQuery]);

  // Separate pinned and unpinned for regular all files view
  const showSeparatedPinned = !filterType && !searchQuery.trim() && !activeTag;
  const topPinnedFiles = useMemo(() => {
    return showSeparatedPinned ? filteredFiles.filter((f) => f.pinned) : [];
  }, [filteredFiles, showSeparatedPinned]);

  const remainingFiles = useMemo(() => {
    return showSeparatedPinned ? filteredFiles.filter((f) => !f.pinned) : filteredFiles;
  }, [filteredFiles, showSeparatedPinned]);

  // Virtualize if files count > 200
  const [windowLimit, setWindowLimit] = useState(200);
  const displayedRemainingFiles = useMemo(() => {
    if (remainingFiles.length <= 200) return remainingFiles;
    return remainingFiles.slice(0, windowLimit);
  }, [remainingFiles, windowLimit]);

  const handleDismissNudge = () => {
    setBackupNudgeDismissed(true);
    localStorage.setItem('mdstash_backup_nudge_dismissed', 'true');
  };

  const handleQuickBackup = async () => {
    try {
      await importExportService.exportZip(allFiles, collections);
      showToast('Exported backup zip archive!', 'success');
      handleDismissNudge();
    } catch {
      showToast('Failed to export backup', 'error');
    }
  };

  const handleArchDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer && e.dataTransfer.items) {
      try {
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
          const result = await importFilesList(files);
          showToast(
            `Stashed ${result.added} file(s)${result.skipped > 0 ? ` (${result.skipped} skipped)` : ''}`,
            'success'
          );
        }
      } catch {
        showToast('Failed to import dropped files', 'error');
      }
    }
  };

  return (
    <div className="w-full space-y-8 animate-fadeIn">
      {/* Hidden file input for empty state click */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".md,.markdown,.txt"
        onChange={async (e) => {
          if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            const res = await importFilesList(files);
            showToast(`Stashed ${res.added} file(s)`, 'success');
          }
        }}
        className="hidden"
      />

      {/* Backup Nudge Banner (after 5+ files) */}
      {!backupNudgeDismissed && allFiles.length >= 5 && (
        <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-[#FDFAF2] border border-orange/40 shadow-xs text-xs text-ink">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange/20 text-orange-deep shrink-0">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-ink">Back up your stash: </span>
              <span className="text-ink/75">
                You have {allFiles.length} files saved locally in your browser. Download a `.zip` archive anytime to keep an external copy.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleQuickBackup}
              className="px-3.5 py-1.5 rounded-full bg-orange hover:bg-orange-deep text-forest font-display text-xs tracking-wide shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export zip</span>
            </button>
            <button
              onClick={handleDismissNudge}
              className="p-1 rounded-lg text-ink/50 hover:text-ink transition-colors cursor-pointer"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Empty State: Big dashed arch drop zone with crate and line */}
      {filteredFiles.length === 0 && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
          }}
          onDrop={handleArchDrop}
          onClick={() => fileInputRef.current?.click()}
          className="relative py-20 px-8 flex flex-col items-center justify-center text-center cursor-pointer group transition-all"
        >
          {/* Big dashed arch matching landing hero curve */}
          <div className="relative w-full max-w-xl h-64 flex flex-col items-center justify-center p-8">
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
              viewBox="0 0 200 100"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="emptyArchGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--cream)" stopOpacity="0.4" />
                  <stop offset="80%" stopColor="var(--cream)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="var(--cream)" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              <path
                d="M 4 96 L 4 45 A 96 45 0 0 1 196 45 L 196 96"
                fill="none"
                stroke="url(#emptyArchGrad)"
                strokeWidth="2"
                strokeDasharray="6 6"
              />
            </svg>

            {/* Crate logo */}
            <div className="relative mb-3 transition-transform duration-300 group-hover:scale-105">
              <CrateLogo
                className="w-20 h-20 object-contain drop-shadow-md"
                style={{
                  // @ts-expect-error CSS variables
                  '--logo-body': 'var(--sage-deep)',
                  '--logo-doc': 'var(--cream)',
                  '--logo-mark': 'var(--orange)',
                }}
              />
            </div>

            {/* Line in font-display sentence case */}
            <h2 className="font-display text-2xl text-cream tracking-tight mb-1">
              Drop markdown files here
            </h2>
            <p className="text-xs text-cream/75 font-sans max-w-xs">
              {searchQuery || activeTag
                ? 'Try clearing the search query or tag filter.'
                : 'Drop your files or click to stash markdown notes locally.'}
            </p>
          </div>
        </div>
      )}

      {/* Pinned Section: Wall row above files with pushpins and alternating tilts */}
      {showSeparatedPinned && topPinnedFiles.length > 0 && (
        <div className="space-y-4 pt-1">
          <div className="flex items-center gap-2">
            <Pin className="w-5 h-5 stroke-[1.75] fill-orange text-orange shrink-0" />
            <h2 className="font-display text-xl text-cream tracking-tight">
              Pinned
            </h2>
            <span className="font-sans text-xs text-cream/70 font-semibold">
              ({topPinnedFiles.length})
            </span>
          </div>

          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-[clamp(16px,1.5vw,28px)] w-full'
                : 'space-y-2.5'
            }
          >
            {topPinnedFiles.map((file, idx) => (
              <FileCard
                key={file.id}
                file={file}
                collection={file.collectionId ? collectionMap.get(file.collectionId) : undefined}
                onOpen={(f) => navigate(`/app/f/${f.id}`)}
                viewMode={viewMode}
                index={idx}
                isPinnedWall={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Files Grid/List: Auto-fill columns filling full width with no empty right area */}
      {remainingFiles.length > 0 && (
        <div className="space-y-4 pt-1">
          {showSeparatedPinned && topPinnedFiles.length > 0 && (
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl text-cream tracking-tight">
                Files
              </h2>
              <span className="font-sans text-xs text-cream/70 font-semibold">
                ({remainingFiles.length})
              </span>
            </div>
          )}

          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-[clamp(16px,1.5vw,28px)] w-full'
                : 'space-y-2.5'
            }
          >
            {displayedRemainingFiles.map((file, idx) => (
              <FileCard
                key={file.id}
                file={file}
                collection={file.collectionId ? collectionMap.get(file.collectionId) : undefined}
                onOpen={(f) => navigate(`/app/f/${f.id}`)}
                viewMode={viewMode}
                index={idx}
                isPinnedWall={false}
              />
            ))}
          </div>

          {/* Virtualization "Load more" if over 200 files */}
          {remainingFiles.length > windowLimit && (
            <div className="pt-4 text-center">
              <button
                type="button"
                onClick={() => setWindowLimit((prev) => prev + 100)}
                className="px-5 py-2 rounded-full border border-[rgba(38,51,42,0.2)] bg-[#FDFAF2] text-ink font-display text-xs hover:border-orange hover:text-orange cursor-pointer"
              >
                Load more files ({remainingFiles.length - windowLimit} remaining)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
