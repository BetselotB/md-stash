import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useFiles, usePinnedFiles, useCollections } from '../hooks/useDb';
import { useUIStore } from '../store/uiStore';
import { searchService } from '../services/search';
import { FileCard } from '../components/library/FileCard';
import { importExportService } from '../services/importExport';
import { Pin, FileQuestion, HardDrive, Download, X } from 'lucide-react';
import { Button } from '../components/ui/Button';

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

  const handleDismissNudge = () => {
    setBackupNudgeDismissed(true);
    localStorage.setItem('mdstash_backup_nudge_dismissed', 'true');
  };

  const handleQuickBackup = async () => {
    try {
      await importExportService.exportZip(allFiles, collections);
      showToast('Exported backup zip!', 'success');
      handleDismissNudge();
    } catch {
      showToast('Failed to export backup', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Backup Nudge Banner (after 5+ files) */}
      {!backupNudgeDismissed && allFiles.length >= 5 && (
        <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-forest border border-orange/40 shadow-sm text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange/20 text-orange shrink-0">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-cream">Back up your stash: </span>
              <span className="text-cream-dim">
                You have {allFiles.length} files saved locally in your browser. Download a `.zip` archive anytime to keep an external copy.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" variant="primary" onClick={handleQuickBackup} icon={<Download className="w-3.5 h-3.5" />}>
              Export Zip
            </Button>
            <button
              onClick={handleDismissNudge}
              className="p-1 rounded-lg text-cream-dim hover:text-cream transition-colors cursor-pointer"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* View Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl tracking-normal text-cream">
            {filterType === 'pinned'
              ? 'Pinned Favorites'
              : activeTag
              ? `Tagged #${activeTag}`
              : searchQuery
              ? `Search: "${searchQuery}"`
              : 'All Markdown Files'}
          </h1>
          <p className="text-xs text-cream-dim mt-0.5">
            {filteredFiles.length} file{filteredFiles.length === 1 ? '' : 's'} in your local stash
          </p>
        </div>
      </div>

      {/* Empty State */}
      {filteredFiles.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center text-center p-8 bg-forest/40 border border-dashed border-line rounded-3xl">
          <div className="w-16 h-16 rounded-full bg-forest flex items-center justify-center text-orange mb-4 border border-line">
            <FileQuestion className="w-8 h-8" />
          </div>
          <h2 className="font-display text-2xl tracking-normal text-cream mb-1">
            {searchQuery || activeTag ? 'No matching files found' : 'Your stash is empty'}
          </h2>
          <p className="text-xs text-cream-dim max-w-sm mb-6">
            {searchQuery || activeTag
              ? 'Try clearing the search query or tag filter.'
              : 'Drag & drop your Markdown files, folders, or paste text to get started.'}
          </p>
        </div>
      )}

      {/* Pinned Section */}
      {showSeparatedPinned && topPinnedFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold tracking-normal text-orange">
            <Pin className="w-3.5 h-3.5 fill-orange" />
            <span>Pinned to Top ({topPinnedFiles.length})</span>
          </div>
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                : 'space-y-2.5'
            }
          >
            {topPinnedFiles.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                collection={file.collectionId ? collectionMap.get(file.collectionId) : undefined}
                onOpen={(f) => navigate(`/app/f/${f.id}`)}
                viewMode={viewMode}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Files Grid/List */}
      {remainingFiles.length > 0 && (
        <div className="space-y-3">
          {showSeparatedPinned && topPinnedFiles.length > 0 && (
            <div className="text-xs font-bold tracking-normal text-cream-dim/70">
              Files ({remainingFiles.length})
            </div>
          )}
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                : 'space-y-2.5'
            }
          >
            {remainingFiles.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                collection={file.collectionId ? collectionMap.get(file.collectionId) : undefined}
                onOpen={(f) => navigate(`/app/f/${f.id}`)}
                viewMode={viewMode}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
