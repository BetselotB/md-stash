import React, { useState, useEffect } from 'react';
import { StashFile, Collection } from '../../domain/types';
import { useUIStore } from '../../store/uiStore';
import { filesRepo } from '../../db/files.repo';
import { setupDragOut } from '../../services/dragOut';
import { formatFileForCopy } from '../../domain/copyFormats';
import { persistenceService } from '../../services/persistence';
import { cleanMarkdownPreview } from '../../utils/markdownPreview';
import { CrateGlyph } from '../ui/CrateGlyph';
import { confirm } from '../ui/ConfirmDialog';
import {
  Pin,
  GripVertical,
  Copy,
  Trash2,
  Check,
} from 'lucide-react';

interface FileCardProps {
  file: StashFile;
  collection?: Collection;
  onOpen: (file: StashFile) => void;
  viewMode?: 'grid' | 'list';
  index?: number;
  isPinnedWall?: boolean;
}

let hasAnimatedLibraryMount = false;

export const FileCard: React.FC<FileCardProps> = ({
  file,
  collection,
  onOpen,
  viewMode = 'grid',
  index = 0,
  isPinnedWall = false,
}) => {
  const { selectedFileIds, toggleSelectFile, showToast, setIsDraggingCard } = useUIStore();
  const isSelected = selectedFileIds.includes(file.id);
  const isAnySelected = selectedFileIds.length > 0;
  const [isCopied, setIsCopied] = useState(false);
  const [isAnimatingMount, setIsAnimatingMount] = useState(!hasAnimatedLibraryMount);

  useEffect(() => {
    if (!hasAnimatedLibraryMount) {
      const t = setTimeout(() => {
        setIsAnimatingMount(false);
        hasAnimatedLibraryMount = true;
      }, 900);
      return () => clearTimeout(t);
    }
  }, []);

  const handleTogglePin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = await filesRepo.togglePin(file.id);
    showToast(next ? `Pinned "${file.filename}"` : `Unpinned "${file.filename}"`, 'info');
  };

  const handleQuickCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const text = formatFileForCopy(file.filename, file.content, 'prompt');
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      }
      setIsCopied(true);
      showToast(`Copied "${file.filename}"`, 'success');
      setTimeout(() => setIsCopied(false), 1200);
    } catch {
      setIsCopied(true);
      showToast(`Copied "${file.filename}"`, 'success');
      setTimeout(() => setIsCopied(false), 1200);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const ok = await confirm({
      title: `Delete ${file.filename}?`,
      body: "This removes the file and its version history from this device. This can't be undone.",
      filenameChip: file.filename,
      confirmLabel: 'Delete file',
      cancelLabel: 'Cancel',
      tone: 'danger',
    });
    if (ok) {
      await filesRepo.delete(file.id);
      showToast(`Deleted "${file.filename}"`, 'info');
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    setIsDraggingCard(true);
    setupDragOut(e, file);
    try {
      e.dataTransfer.setData('application/x-mdstash-file', file.id);
    } catch {
      // ignore
    }
  };

  const handleDragEnd = () => {
    setIsDraggingCard(false);
  };

  const previewSnippet = cleanMarkdownPreview(file.content);
  const collectionLabel = collection?.name || 'Unsorted';
  const collectionColor = collection?.color || '#7D9671';

  // Stagger animation timing capped at first 12 cards
  const staggerDelay = isAnimatingMount ? `${Math.min(index, 12) * 40}ms` : '0ms';

  // Pinned wall cards alternate subtle craft tilt (-1.2deg / 1.0deg)
  const wallTiltClass = isPinnedWall
    ? index % 2 === 0
      ? '-rotate-[1.2deg]'
      : 'rotate-[1deg]'
    : '';

  // LIST VIEW: Warm oat paper strip styling
  if (viewMode === 'list') {
    return (
      <div
        data-testid={`file-card-${file.id}`}
        onClick={() => onOpen(file)}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        style={{ animationDelay: staggerDelay }}
        className={`group relative flex items-center justify-between px-4 py-3 bg-[#D8D3BC] text-ink rounded-[14px] border border-[rgba(38,51,42,0.22)] shadow-[0_2px_6px_-1px_rgba(38,51,42,0.1)] transition-all duration-200 cursor-pointer hover:-translate-y-[2px] ${
          isAnimatingMount ? 'animate-card-rise' : ''
        } ${
          isSelected
            ? 'outline outline-2 outline-orange ring-1 ring-orange/40 shadow-[0_0_12px_rgba(238,178,87,0.35)]'
            : 'hover:border-[rgba(38,51,42,0.36)]'
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
            className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
              isSelected
                ? 'bg-orange border-orange text-forest'
                : 'border-[rgba(38,51,42,0.35)] hover:border-orange bg-[#CBC5AC]'
            }`}
            aria-label="Select file"
          >
            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
          </button>

          {/* Drag handle */}
          <div
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClick={(e) => e.stopPropagation()}
            className="text-ink/40 hover:text-ink cursor-grab active:cursor-grabbing p-1 rounded hover:bg-[rgba(38,51,42,0.08)]"
            title="Drag out to Desktop or IDE"
          >
            <GripVertical className="w-4 h-4" />
          </div>

          {/* Plain collection text label with small craft icon (no pill, no coloured bg) */}
          <div className="flex items-center gap-1.5 shrink-0 text-ink/65">
            <CrateGlyph color={collectionColor} size={15} />
            <span className="font-display text-[11px] tracking-tight truncate max-w-[120px]">
              {collectionLabel}
            </span>
          </div>

          {/* Title & filename */}
          <div className="min-w-0 flex-1 flex items-baseline gap-2">
            <span className="font-display text-ink text-base tracking-tight truncate group-hover:text-forest transition-colors">
              {file.title}
            </span>
            <span className="font-mono text-xs text-ink/80 truncate bg-[#CBC5AC] border border-[rgba(38,51,42,0.18)] px-1.5 py-0.5 rounded font-medium">
              {file.filename}
            </span>
          </div>

          {/* Tags */}
          <div className="hidden lg:flex items-center gap-1.5 shrink-0">
            {file.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[11px] px-2 py-0.5 rounded border border-[rgba(38,51,42,0.18)] bg-[rgba(38,51,42,0.08)] text-ink/85 font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Size in mono */}
          <span className="text-xs text-ink/65 font-mono shrink-0 hidden sm:inline-block">
            {persistenceService.formatBytes(file.size)}
          </span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5 shrink-0 ml-3">
          {/* Quick copy with Copied stamp */}
          <button
            type="button"
            onClick={handleQuickCopy}
            className="p-1.5 rounded-lg text-ink/65 hover:text-orange hover:bg-[rgba(38,51,42,0.08)] transition-colors cursor-pointer"
            title="Copy prompt-ready"
            aria-label="Copy prompt-ready"
          >
            {isCopied ? (
              <span className="font-display text-[10px] text-orange-deep bg-orange/20 border border-orange-deep/50 rounded px-1.5 py-0.5 -rotate-2 select-none leading-none inline-block">
                Copied
              </span>
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>

          {/* Pin toggle with original Lucide diagonal pin glyph */}
          <button
            type="button"
            onClick={handleTogglePin}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              file.pinned ? 'text-ink bg-ink/10 hover:bg-ink/15' : 'text-ink/45 hover:text-ink hover:bg-[rgba(38,51,42,0.08)]'
            }`}
            title={file.pinned ? 'Unpin' : 'Pin'}
            aria-label={file.pinned ? 'Unpin file' : 'Pin file'}
          >
            <Pin
              className={`w-4 h-4 stroke-[1.75] ${
                file.pinned ? 'fill-ink text-ink animate-pushpin-thunk' : 'fill-none text-current'
              }`}
            />
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={handleDelete}
            className="p-1.5 text-ink/40 hover:text-red-700 rounded-lg hover:bg-[rgba(38,51,42,0.08)] transition-colors cursor-pointer"
            title="Delete file"
            aria-label="Delete file"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // GRID VIEW CARD: Warm Oat Paper Index Card (#D8D3BC)
  return (
    <div
      data-testid={`file-card-${file.id}`}
      onClick={() => onOpen(file)}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={{ animationDelay: staggerDelay }}
      className={`group relative flex flex-col justify-between p-4 bg-[#D8D3BC] text-ink rounded-[14px] border border-[rgba(38,51,42,0.22)] shadow-[0_2px_8px_-2px_rgba(38,51,42,0.12),0_1px_3px_rgba(38,51,42,0.06)] transition-all duration-200 cursor-pointer hover:-translate-y-[3px] hover:rotate-[0.4deg] select-none ${wallTiltClass} ${
        isAnimatingMount ? 'animate-card-rise' : ''
      } ${
        isSelected
          ? 'outline outline-2 outline-orange ring-1 ring-orange/40 shadow-[0_0_12px_rgba(238,178,87,0.35)]'
          : 'hover:border-[rgba(38,51,42,0.36)] hover:shadow-md'
      }`}
    >
      {/* Top Header Row: Selection Checkbox on top-left, Pin & Drag Handle on top-right */}
      <div className="flex items-center justify-between gap-2 mb-2">
        {/* Selection Checkbox (visible on hover, or when selected, or when selecting) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleSelectFile(file.id);
          }}
          className={`w-4 h-4 rounded border flex items-center justify-center transition-all cursor-pointer ${
            isSelected
              ? 'bg-orange border-orange text-forest opacity-100'
              : isAnySelected
              ? 'border-[rgba(38,51,42,0.4)] hover:border-orange bg-[#CBC5AC] opacity-100'
              : 'border-[rgba(38,51,42,0.4)] hover:border-orange bg-[#CBC5AC] opacity-0 group-hover:opacity-100 focus:opacity-100'
          }`}
          aria-label="Select file"
        >
          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
        </button>

        {/* Quick actions top-right: Pin toggle + Drag handle */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleTogglePin}
            className={`p-1 rounded-md transition-all cursor-pointer ${
              file.pinned
                ? 'text-ink bg-ink/10 hover:bg-ink/15'
                : 'text-ink/45 hover:text-ink hover:bg-[rgba(38,51,42,0.08)]'
            }`}
            title={file.pinned ? 'Unpin' : 'Pin'}
            aria-label={file.pinned ? 'Unpin file' : 'Pin file'}
          >
            <Pin
              className={`w-3.5 h-3.5 stroke-[1.75] ${
                file.pinned ? 'fill-ink text-ink animate-pushpin-thunk' : 'fill-none text-current'
              }`}
            />
          </button>

          <div
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClick={(e) => e.stopPropagation()}
            className="text-ink/40 hover:text-ink cursor-grab active:cursor-grabbing p-1 rounded hover:bg-[rgba(38,51,42,0.08)]"
            title="Drag file out to Desktop or IDE"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Card Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Plain collection text label inside the card above title, with small paper icon */}
        <div className="flex items-center gap-1.5 mb-1 text-ink/65">
          <CrateGlyph color={collectionColor} size={14} />
          <span className="font-display text-[11px] tracking-tight truncate max-w-[180px]">
            {collectionLabel}
          </span>
        </div>

        {/* Title in display font (full ink) */}
        <h2 className="font-display text-lg text-ink leading-snug line-clamp-2 tracking-tight group-hover:text-forest transition-colors mb-1.5">
          {file.title}
        </h2>

        {/* Filename on a visible typed-label strip in mono (#CBC5AC) with ink text */}
        <div className="mb-2.5">
          <span className="inline-block font-mono text-[11px] bg-[#CBC5AC] border border-[rgba(38,51,42,0.2)] px-2 py-0.5 rounded text-ink font-semibold tracking-tight truncate max-w-full">
            {file.filename}
          </span>
        </div>

        {/* 3-line preview in body font (80% ink) with fade ending at card background */}
        <div className="relative overflow-hidden max-h-[4.4em] mb-3">
          <p className="font-sans text-xs text-ink/80 leading-relaxed line-clamp-3">
            {previewSnippet || 'Empty file content.'}
          </p>
          <div className="absolute bottom-0 inset-x-0 h-4 bg-gradient-to-t from-[#D8D3BC] to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Card Footer: Tags, Size (65% ink), Copy Stamp Button */}
      <div className="pt-2.5 border-t border-[rgba(38,51,42,0.18)] flex items-center justify-between text-xs text-ink/65">
        {/* Tags as stamped chips */}
        <div className="flex items-center gap-1 flex-wrap min-w-0 mr-2">
          {file.tags.slice(0, 2).map((t) => (
            <span
              key={t}
              className="text-[10.5px] px-1.5 py-0.5 rounded border border-[rgba(38,51,42,0.18)] bg-[rgba(38,51,42,0.08)] text-ink/85 font-medium tracking-tight truncate max-w-[80px]"
            >
              #{t}
            </span>
          ))}
          {file.tags.length > 2 && (
            <span className="text-[10px] text-ink/65 font-mono font-semibold">
              +{file.tags.length - 2}
            </span>
          )}
        </div>

        {/* Size in mono (65% ink) & Copy Button */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono text-[11px] text-ink/65 font-medium">
            {persistenceService.formatBytes(file.size)}
          </span>

          <button
            type="button"
            onClick={handleQuickCopy}
            className="p-1 rounded text-ink/70 hover:text-orange transition-colors cursor-pointer"
            title="Copy prompt-ready"
            aria-label="Copy prompt-ready"
          >
            {isCopied ? (
              <span className="font-display text-[10px] text-orange-deep bg-orange/20 border border-orange-deep/50 rounded px-1.5 py-0.5 -rotate-2 select-none inline-block">
                Copied
              </span>
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
