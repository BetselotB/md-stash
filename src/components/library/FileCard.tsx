import React from 'react';
import { StashFile, Collection } from '../../domain/types';
import { useUIStore } from '../../store/uiStore';
import { filesRepo } from '../../db/files.repo';
import { setupDragOut } from '../../services/dragOut';
import { formatFileForCopy } from '../../domain/copyFormats';
import { persistenceService } from '../../services/persistence';
import {
  Pin,
  GripVertical,
  Copy,
  FileText,
  Trash2,
  Check,
} from 'lucide-react';

interface FileCardProps {
  file: StashFile;
  collection?: Collection;
  onOpen: (file: StashFile) => void;
  viewMode?: 'grid' | 'list';
}

export const FileCard: React.FC<FileCardProps> = ({
  file,
  collection,
  onOpen,
  viewMode = 'grid',
}) => {
  const { selectedFileIds, toggleSelectFile, showToast } = useUIStore();
  const isSelected = selectedFileIds.includes(file.id);

  const handleTogglePin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = await filesRepo.togglePin(file.id);
    showToast(next ? `Pinned "${file.filename}"` : `Unpinned "${file.filename}"`, 'info');
  };

  const handleQuickCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const text = formatFileForCopy(file.filename, file.content, 'prompt');
      await navigator.clipboard.writeText(text);
      showToast(`Copied "${file.filename}" (prompt ready)`, 'success');
    } catch {
      showToast('Clipboard copy failed', 'error');
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete "${file.filename}"? This action cannot be undone.`)) {
      await filesRepo.delete(file.id);
      showToast(`Deleted "${file.filename}"`, 'info');
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    setupDragOut(e, file);
  };

  if (viewMode === 'list') {
    return (
      <div
        onClick={() => onOpen(file)}
        className={`group flex items-center justify-between px-4 py-3 bg-forest rounded-xl border transition-all duration-150 cursor-pointer ${
          isSelected
            ? 'border-orange bg-forest-light/60 shadow-glow'
            : 'border-line hover:border-cream/40 hover:bg-forest-light/40'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Checkbox */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleSelectFile(file.id);
            }}
            className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
              isSelected
                ? 'bg-orange border-orange text-forest'
                : 'border-line hover:border-orange bg-forest-dark'
            }`}
            aria-label="Select file for bundle"
          >
            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </button>

          {/* Drag handle */}
          <div
            draggable
            onDragStart={handleDragStart}
            onClick={(e) => e.stopPropagation()}
            className="text-cream-dim/50 hover:text-cream cursor-grab active:cursor-grabbing p-1 rounded hover:bg-cream-faint"
            title="Drag out to Desktop or IDE"
          >
            <GripVertical className="w-4 h-4" />
          </div>

          {/* Collection dot */}
          {collection ? (
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: collection.color }}
              title={collection.name}
            />
          ) : (
            <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-cream-dim/30" title="Unsorted" />
          )}

          {/* Title & filename */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-cream text-sm truncate">{file.title}</span>
              <span className="font-mono text-xs text-cream-dim/70 truncate">({file.filename})</span>
            </div>
          </div>

          {/* Tags */}
          <div className="hidden md:flex items-center gap-1.5 shrink-0">
            {file.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[11px] px-2 py-0.5 rounded-full bg-forest-dark border border-line text-cream-dim"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Size */}
          <span className="text-xs text-cream-dim font-mono shrink-0 hidden sm:inline-block">
            {persistenceService.formatBytes(file.size)}
          </span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 shrink-0 ml-3 opacity-90 group-hover:opacity-100">
          <button
            type="button"
            onClick={handleQuickCopy}
            className="p-1.5 text-cream-dim hover:text-orange rounded-lg hover:bg-cream-faint transition-colors"
            title="Copy Prompt-ready"
          >
            <Copy className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleTogglePin}
            className={`p-1.5 rounded-lg hover:bg-cream-faint transition-colors ${
              file.pinned ? 'text-orange' : 'text-cream-dim hover:text-cream'
            }`}
            title={file.pinned ? 'Unpin' : 'Pin to top'}
          >
            <Pin className={`w-4 h-4 ${file.pinned ? 'fill-orange' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="p-1.5 text-cream-dim hover:text-red-400 rounded-lg hover:bg-cream-faint transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Grid view card
  return (
    <div
      onClick={() => onOpen(file)}
      className={`group relative flex flex-col justify-between p-4 bg-forest rounded-2xl border transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-card ${
        isSelected
          ? 'border-orange bg-forest-light/60 shadow-glow ring-1 ring-orange'
          : 'border-line hover:border-cream/40 hover:bg-forest-light/30'
      }`}
    >
      <div>
        {/* Top card bar */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            {/* Selection Checkbox */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleSelectFile(file.id);
              }}
              className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                isSelected
                  ? 'bg-orange border-orange text-forest'
                  : 'border-line hover:border-orange bg-forest-dark'
              }`}
              aria-label="Select file"
            >
              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
            </button>

            {/* Collection tag / dot */}
            {collection && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border"
                style={{
                  borderColor: `${collection.color}50`,
                  backgroundColor: `${collection.color}20`,
                  color: collection.color,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: collection.color }}
                />
                {collection.name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Pin toggle */}
            <button
              type="button"
              onClick={handleTogglePin}
              className={`p-1 rounded-md transition-colors ${
                file.pinned
                  ? 'text-orange bg-orange/20'
                  : 'text-cream-dim/60 hover:text-cream hover:bg-cream-faint'
              }`}
              title={file.pinned ? 'Unpin' : 'Pin to top'}
            >
              <Pin className={`w-3.5 h-3.5 ${file.pinned ? 'fill-orange' : ''}`} />
            </button>

            {/* Drag Handle */}
            <div
              draggable
              onDragStart={handleDragStart}
              onClick={(e) => e.stopPropagation()}
              className="text-cream-dim/50 hover:text-cream cursor-grab active:cursor-grabbing p-1 rounded hover:bg-cream-faint"
              title="Drag file out to Desktop or IDE"
            >
              <GripVertical className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Title & icon */}
        <div className="flex items-start gap-2.5 mb-2">
          <FileText className="w-4 h-4 text-cream-dim mt-1 shrink-0" />
          <h3 className="font-bold text-cream text-base tracking-tight line-clamp-2 leading-snug group-hover:text-orange transition-colors">
            {file.title}
          </h3>
        </div>

        {/* Filename snippet */}
        <p className="font-mono text-xs text-cream-dim/75 truncate mb-3 pl-6">
          {file.filename}
        </p>

        {/* Content preview snippet */}
        <p className="text-xs text-cream-dim/60 line-clamp-3 mb-4 leading-relaxed pl-6 border-l border-line/50">
          {file.content.slice(0, 150)}
        </p>
      </div>

      {/* Card footer */}
      <div className="pt-3 border-t border-line/60 flex items-center justify-between text-xs text-cream-dim">
        <div className="flex items-center gap-1 flex-wrap">
          {file.tags.slice(0, 2).map((t) => (
            <span
              key={t}
              className="text-[10px] px-2 py-0.5 rounded-md bg-forest-dark border border-line text-cream-dim"
            >
              #{t}
            </span>
          ))}
          {file.tags.length > 2 && (
            <span className="text-[10px] text-cream-dim/60">+{file.tags.length - 2}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px]">
            {persistenceService.formatBytes(file.size)}
          </span>
          <button
            type="button"
            onClick={handleQuickCopy}
            className="p-1 text-cream-dim hover:text-orange rounded transition-colors"
            title="Copy prompt-ready"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
