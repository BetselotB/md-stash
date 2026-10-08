import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFiles, usePinnedFiles, useCollections } from '../hooks/useDb';
import { useUIStore } from '../store/uiStore';
import { searchService } from '../services/search';
import { FileCard } from '../components/library/FileCard';
import { FileDetailModal } from '../components/file/FileDetailModal';
import { StashFile } from '../domain/types';
import { Pin, FileQuestion, Sparkles, Plus, Upload } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const Library: React.FC = () => {
  const [searchParams] = useSearchParams();
  const filterType = searchParams.get('filter');

  const allFiles = useFiles();
  const pinnedFiles = usePinnedFiles();
  const collections = useCollections();

  const { searchQuery, activeTag, viewMode } = useUIStore();
  const [selectedFile, setSelectedFile] = useState<StashFile | null>(null);

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

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* View Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl uppercase tracking-wider text-cream">
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
          <div className="w-16 h-16 rounded-full bg-forest flex items-center justify-center text-pink mb-4 border border-line">
            <FileQuestion className="w-8 h-8" />
          </div>
          <h2 className="font-display text-2xl uppercase tracking-wider text-cream mb-1">
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
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-pink">
            <Pin className="w-3.5 h-3.5 fill-pink" />
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
                onOpen={(f) => setSelectedFile(f)}
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
            <div className="text-xs font-bold uppercase tracking-wider text-cream-dim/70">
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
                onOpen={(f) => setSelectedFile(f)}
                viewMode={viewMode}
              />
            ))}
          </div>
        </div>
      )}

      {/* File Detail Modal */}
      {selectedFile && (
        <FileDetailModal
          file={selectedFile}
          collection={
            selectedFile.collectionId ? collectionMap.get(selectedFile.collectionId) : undefined
          }
          onClose={() => setSelectedFile(null)}
        />
      )}
    </div>
  );
};
