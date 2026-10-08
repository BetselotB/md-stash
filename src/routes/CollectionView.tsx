import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useFiles, useCollection, useCollections } from '../hooks/useDb';
import { useUIStore } from '../store/uiStore';
import { searchService } from '../services/search';
import { FileCard } from '../components/library/FileCard';
import { CollectionModal } from '../components/collections/CollectionModal';
import { StashFile, Collection } from '../domain/types';
import { Folder, Inbox, Edit2, FileQuestion, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const CollectionView: React.FC = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const navigate = useNavigate();
  const isUnsorted = collectionId === 'unsorted';

  const collection = useCollection(isUnsorted ? undefined : collectionId);
  const collections = useCollections();
  const files = useFiles(isUnsorted ? null : collectionId);

  const { searchQuery, activeTag, viewMode } = useUIStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const collectionMap = useMemo(() => {
    return new Map(collections.map((c) => [c.id, c]));
  }, [collections]);

  // Check if collection exists once collections are loaded
  const isKnown = isUnsorted || (collectionId && collections.some((c) => c.id === collectionId));
  const isStillLoading = !isUnsorted && collections.length === 0;

  if (!isKnown && !isStillLoading) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-forest border border-line flex items-center justify-center text-orange mx-auto">
          <FileQuestion className="w-8 h-8" />
        </div>
        <h2 className="font-display text-3xl tracking-normal text-cream">
          Collection Not Found
        </h2>
        <p className="text-xs text-cream-dim max-w-sm mx-auto">
          The requested collection does not exist in your stash or has been removed.
        </p>
        <div className="pt-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/app')}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Return to All Files
          </Button>
        </div>
      </div>
    );
  }

  const filteredFiles = useMemo(() => {
    let list = files;
    if (activeTag) {
      list = list.filter((f) => f.tags.includes(activeTag));
    }
    if (searchQuery.trim()) {
      const matchIds = new Set(searchService.search(searchQuery));
      list = list.filter((f) => matchIds.has(f.id));
    }
    return list;
  }, [files, activeTag, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm"
            style={{
              backgroundColor: isUnsorted ? 'var(--forest)' : `${collection?.color}25`,
              borderColor: isUnsorted ? 'var(--line)' : collection?.color,
              color: isUnsorted ? 'var(--cream)' : collection?.color,
            }}
          >
            {isUnsorted ? <Inbox className="w-6 h-6" /> : <Folder className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-4xl tracking-normal text-cream">
                {isUnsorted ? 'Unsorted Files' : collection?.name || 'Collection'}
              </h1>
              {!isUnsorted && collection && (
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="p-1.5 rounded-lg text-cream-dim hover:text-orange hover:bg-forest transition-colors cursor-pointer"
                  title="Edit collection"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-xs text-cream-dim mt-0.5">
              {filteredFiles.length} file{filteredFiles.length === 1 ? '' : 's'} in this collection
            </p>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredFiles.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center text-center p-8 bg-forest/40 border border-dashed border-line rounded-3xl">
          <div className="w-16 h-16 rounded-full bg-forest flex items-center justify-center text-orange mb-4 border border-line">
            <FileQuestion className="w-8 h-8" />
          </div>
          <h2 className="font-display text-2xl tracking-normal text-cream mb-1">
            No files in this collection
          </h2>
          <p className="text-xs text-cream-dim max-w-sm mb-6">
            Drag files from your library or drop new markdown files directly into this collection.
          </p>
        </div>
      )}

      {/* Grid or List */}
      {filteredFiles.length > 0 && (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'space-y-2.5'
          }
        >
          {filteredFiles.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              collection={file.collectionId ? collectionMap.get(file.collectionId) : undefined}
              onOpen={(f) => navigate(`/app/f/${f.id}`)}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}

      {/* Edit Collection Modal */}
      {collection && isEditModalOpen && (
        <CollectionModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          collection={collection}
        />
      )}
    </div>
  );
};
