import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { useFile, useCollection } from '../hooks/useDb';
import { filesRepo } from '../db/files.repo';
import { formatFileForCopy } from '../domain/copyFormats';
import { setupDragOut } from '../services/dragOut';
import { persistenceService } from '../services/persistence';
import { useUIStore } from '../store/uiStore';
import { Button } from '../components/ui/Button';
import { confirm } from '../components/ui/ConfirmDialog';
import { EditFileModal } from '../components/file/EditFileModal';
import { VersionHistoryModal } from '../components/file/VersionHistoryModal';
import { CopyMode } from '../domain/types';
import {
  ArrowLeft,
  Copy,
  Download,
  GripVertical,
  Edit3,
  History,
  Trash2,
  Check,
  Eye,
  Code2,
  Pin,
  ChevronDown,
  FileQuestion,
  Folder,
} from 'lucide-react';

const COPY_OPTIONS: { value: CopyMode; label: string; hint: string }[] = [
  { value: 'prompt', label: 'Prompt-ready (with header)', hint: '### File' },
  { value: 'codeblock', label: 'Fenced code block', hint: '```' },
  { value: 'raw', label: 'Raw content', hint: 'plain' },
];

export const FileDetail: React.FC = () => {
  const { fileId } = useParams<{ fileId: string }>();
  const navigate = useNavigate();
  const file = useFile(fileId);
  const collection = useCollection(file?.collectionId || undefined);
  const { showToast } = useUIStore();

  const [activeTab, setActiveTab] = useState<'preview' | 'raw'>('preview');
  const [isCopied, setIsCopied] = useState(false);
  const [copyMode, setCopyMode] = useState<CopyMode>('prompt');
  const [showCopyMenu, setShowCopyMenu] = useState(false);
  const [activeOptionIndex, setActiveOptionIndex] = useState(0);
  const [menuCoords, setMenuCoords] = useState<{
    left: number;
    width: number;
    top?: number;
    bottom?: number;
    placement: 'up' | 'down';
  }>({ left: 0, width: 300, top: 0, placement: 'down' });

  const splitButtonRef = useRef<HTMLDivElement>(null);
  const chevronRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const updateMenuCoords = useCallback(() => {
    if (!splitButtonRef.current) return;
    const rect = splitButtonRef.current.getBoundingClientRect();
    const menuWidth = 300;

    // Right-aligned to button's right edge
    let left = rect.right - menuWidth;
    if (left < 12) left = 12;

    const gap = 8;
    const menuHeight = 142;
    const spaceBelow = window.innerHeight - (rect.bottom + gap);
    const shouldFlipUp = spaceBelow < menuHeight && rect.top > menuHeight;

    if (shouldFlipUp) {
      setMenuCoords({
        left,
        width: menuWidth,
        bottom: window.innerHeight - rect.top + gap,
        placement: 'up',
      });
    } else {
      setMenuCoords({
        left,
        width: menuWidth,
        top: rect.bottom + gap,
        placement: 'down',
      });
    }
  }, []);

  const openCopyMenu = () => {
    updateMenuCoords();
    const idx = COPY_OPTIONS.findIndex((opt) => opt.value === copyMode);
    setActiveOptionIndex(idx >= 0 ? idx : 0);
    setShowCopyMenu(true);
  };

  const closeCopyMenu = (returnFocus = true) => {
    setShowCopyMenu(false);
    if (returnFocus) {
      chevronRef.current?.focus();
    }
  };

  const handleSelectOption = (mode: CopyMode) => {
    setCopyMode(mode);
    handleCopy(mode);
    closeCopyMenu(true);
  };

  useEffect(() => {
    if (!showCopyMenu) return;
    updateMenuCoords();

    const handleWindowChange = () => updateMenuCoords();
    window.addEventListener('resize', handleWindowChange);
    window.addEventListener('scroll', handleWindowChange, true);
    return () => {
      window.removeEventListener('resize', handleWindowChange);
      window.removeEventListener('scroll', handleWindowChange, true);
    };
  }, [showCopyMenu, updateMenuCoords]);

  useEffect(() => {
    if (!showCopyMenu) return;

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (
        splitButtonRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      closeCopyMenu(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [showCopyMenu]);

  const handleChevronKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!showCopyMenu) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        openCopyMenu();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        setActiveOptionIndex((prev) => (prev + 1) % COPY_OPTIONS.length);
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        setActiveOptionIndex((prev) => (prev - 1 + COPY_OPTIONS.length) % COPY_OPTIONS.length);
        break;
      }
      case 'Enter':
      case ' ': {
        e.preventDefault();
        if (COPY_OPTIONS[activeOptionIndex]) {
          handleSelectOption(COPY_OPTIONS[activeOptionIndex].value);
        }
        break;
      }
      case 'Escape': {
        e.preventDefault();
        e.stopPropagation();
        closeCopyMenu(true);
        break;
      }
      case 'Tab': {
        closeCopyMenu(false);
        break;
      }
    }
  };

  // Friendly not found state if fileId is not present
  if (!file) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-forest border border-line flex items-center justify-center text-orange mx-auto">
          <FileQuestion className="w-8 h-8" />
        </div>
        <h2 className="font-display text-3xl tracking-normal text-cream">
          File Not Found
        </h2>
        <p className="text-xs text-cream-dim max-w-sm mx-auto">
          The requested markdown file could not be found in your local stash or may have been deleted.
        </p>
        <div className="pt-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/app')}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Return to Library
          </Button>
        </div>
      </div>
    );
  }

  const handleCopy = async (mode: CopyMode = copyMode) => {
    try {
      const text = formatFileForCopy(file.filename, file.content, mode);
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setShowCopyMenu(false);
      showToast(`Copied "${file.filename}" as ${mode}!`, 'success');
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      showToast('Clipboard copy failed', 'error');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([file.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded "${file.filename}"`, 'info');
  };

  const handleDragStart = (e: React.DragEvent) => {
    setupDragOut(e, file);
  };

  const handleTogglePin = async () => {
    const next = await filesRepo.togglePin(file.id);
    showToast(next ? `Pinned "${file.filename}"` : `Unpinned "${file.filename}"`, 'info');
  };

  const handleDelete = async () => {
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
      navigate('/app');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-fadeIn">
      {/* Top Breadcrumb & Back navigation */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs text-cream-dim hover:text-cream transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-cream-dim/70">
          <Link to="/app" className="hover:text-cream transition-colors">
            Library
          </Link>
          <span>/</span>
          {collection ? (
            <Link
              to={`/app/c/${collection.id}`}
              className="hover:text-cream transition-colors"
            >
              <span>{collection.name}</span>
            </Link>
          ) : (
            <Link to="/app/c/unsorted" className="hover:text-cream transition-colors">
              Unsorted
            </Link>
          )}
          <span>/</span>
          <span className="font-mono text-cream font-semibold">{file.filename}</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-forest border border-line rounded-2xl shadow-card overflow-hidden">
        {/* Header Bar */}
        <div className="px-6 py-5 border-b border-line bg-forest-dark/50 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-cream truncate">{file.title}</h1>
              <button
                type="button"
                onClick={handleTogglePin}
                className={`p-1.5 rounded-lg border border-line hover:bg-cream-faint transition-colors cursor-pointer ${
                  file.pinned ? 'text-orange border-orange' : 'text-cream-dim'
                }`}
                title={file.pinned ? 'Unpin' : 'Pin to top'}
              >
                <Pin className={`w-4 h-4 ${file.pinned ? 'fill-orange' : ''}`} />
              </button>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-cream-dim font-mono min-w-0">
              <span className="truncate">{file.filename}</span>
              <span className="shrink-0">•</span>
              <span className="shrink-0">{persistenceService.formatBytes(file.size)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap shrink-0">
            {/* Copy split button */}
            <div ref={splitButtonRef} className="relative inline-flex items-center">
              <div className="inline-flex items-stretch rounded-full bg-orange shadow-xs focus-within:ring-2 focus-within:ring-orange/80">
                <button
                  type="button"
                  onClick={() => handleCopy(copyMode)}
                  className="inline-flex items-center gap-1.5 pl-3.5 pr-2.5 py-1.5 text-xs font-display tracking-wide font-medium text-forest hover:bg-orange-deep rounded-l-full transition-colors cursor-pointer focus-visible:outline-none"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Copied!' : 'Copy prompt'}</span>
                </button>

                {/* Divider: 1px ink line at about 25% opacity, inset 8px top and bottom */}
                <div
                  className="w-[1px] my-2 bg-ink/25 self-stretch shrink-0"
                  aria-hidden="true"
                />

                <button
                  ref={chevronRef}
                  type="button"
                  id="copy-format-trigger"
                  role="combobox"
                  aria-haspopup="listbox"
                  aria-expanded={showCopyMenu}
                  aria-controls="copy-format-listbox"
                  aria-label="More copy options"
                  onClick={() => (showCopyMenu ? closeCopyMenu(true) : openCopyMenu())}
                  onKeyDown={handleChevronKeyDown}
                  className="px-[10px] py-1.5 text-forest hover:bg-orange-deep rounded-r-full transition-colors flex items-center justify-center cursor-pointer focus-visible:outline-none"
                >
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      showCopyMenu ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Portal Dropdown Menu */}
              {showCopyMenu &&
                createPortal(
                  <div
                    ref={menuRef}
                    id="copy-format-listbox"
                    role="listbox"
                    aria-label="Copy format options"
                    aria-activedescendant={`copy-opt-${activeOptionIndex}`}
                    tabIndex={-1}
                    style={{
                      position: 'fixed',
                      left: `${menuCoords.left}px`,
                      width: `${menuCoords.width}px`,
                      zIndex: 9999,
                      ...(menuCoords.placement === 'up'
                        ? { bottom: `${menuCoords.bottom}px` }
                        : { top: `${menuCoords.top}px` }),
                    }}
                    className={`bg-forest-dark text-cream border border-line rounded-[12px] shadow-[0_12px_28px_-4px_rgba(25,32,28,0.45)] p-[6px] overflow-hidden select-none ${
                      menuCoords.placement === 'up' ? 'animate-select-up' : 'animate-select-down'
                    }`}
                  >
                    {/* Paper grain overlay */}
                    <div
                      className="pointer-events-none absolute inset-0 bg-paper-grain rounded-[12px]"
                      aria-hidden="true"
                    />

                    <div className="relative z-10 flex flex-col gap-[2px]">
                      {COPY_OPTIONS.map((opt, idx) => {
                        const isSelected = opt.value === copyMode;
                        const isFocused = idx === activeOptionIndex;

                        return (
                          <div
                            key={opt.value}
                            id={`copy-opt-${idx}`}
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => handleSelectOption(opt.value)}
                            onMouseEnter={() => setActiveOptionIndex(idx)}
                            className={`h-[40px] px-3 flex items-center justify-between rounded-[8px] cursor-pointer transition-colors ${
                              isFocused
                                ? 'bg-forest-light text-cream'
                                : 'text-cream hover:bg-forest-light'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-display text-xs tracking-tight text-cream truncate">
                                {opt.label}
                              </span>
                              <span className="font-mono text-[11px] text-cream-dim/60 shrink-0">
                                {opt.hint}
                              </span>
                            </div>
                            {isSelected && (
                              <Check
                                className="w-4 h-4 text-orange shrink-0 ml-2"
                                strokeWidth={2.5}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>,
                  document.body
                )}
            </div>

            {/* Download */}
            <Button
              size="sm"
              variant="secondary"
              onClick={handleDownload}
              icon={<Download className="w-4 h-4" />}
            >
              Download
            </Button>

            {/* Drag me */}
            <div
              draggable
              onDragStart={handleDragStart}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-forest-dark border border-line text-xs font-bold text-cream-dim hover:text-cream cursor-grab active:cursor-grabbing hover:border-orange transition-colors"
              title="Drag file out to Desktop or IDE"
            >
              <GripVertical className="w-3.5 h-3.5 text-orange" />
              <span>Drag me</span>
            </div>

            {/* Edit */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditOpen(true)}
              icon={<Edit3 className="w-4 h-4" />}
            >
              Edit
            </Button>

            {/* History */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsHistoryOpen(true)}
              icon={<History className="w-4 h-4" />}
            >
              History
            </Button>

            {/* Delete */}
            <button
              type="button"
              onClick={handleDelete}
              className="p-1.5 text-cream-dim hover:text-red-400 rounded-lg hover:bg-cream-faint transition-colors cursor-pointer"
              title="Delete file"
              aria-label="Delete file"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-bar: Tabs and Tags */}
        <div className="px-6 py-3 border-b border-line bg-forest/80 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-1 p-1 bg-forest-dark border border-line rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-orange text-forest shadow-sm'
                  : 'text-cream-dim hover:text-cream'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('raw')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'raw'
                  ? 'bg-orange text-forest shadow-sm'
                  : 'text-cream-dim hover:text-cream'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Raw markdown</span>
            </button>
          </div>

          {file.tags.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-cream-dim/60 font-semibold  text-[10px]">Tags:</span>
              {file.tags.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-0.5 rounded-full bg-forest-dark border border-line text-cream-dim text-[11px]"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Content Box */}
        <div className="p-8 min-h-[420px] bg-forest/40">
          {activeTab === 'preview' ? (
            <div className="prose prose-invert max-w-none text-cream text-sm leading-relaxed space-y-4">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSanitize]}
                components={{
                  h1: ({ node, ...props }) => (
                    <h1 className="font-display text-3xl tracking-wide  text-cream pb-2 border-b border-line" {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 className="font-display text-2xl tracking-wide  text-cream pt-2" {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 className="font-bold text-lg text-cream" {...props} />
                  ),
                  code: ({ node, className, children, ...props }) => {
                    return (
                      <code
                        className="bg-forest-dark px-1.5 py-0.5 rounded border border-line text-orange font-mono text-xs"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  pre: ({ node, ...props }) => (
                    <pre className="p-4 rounded-xl bg-forest-dark border border-line font-mono text-xs overflow-x-auto text-cream my-3" {...props} />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote className="border-l-4 border-orange pl-4 italic text-cream-dim my-3" {...props} />
                  ),
                  table: ({ node, ...props }) => (
                    <div className="overflow-x-auto my-3">
                      <table className="w-full text-left border-collapse border border-line" {...props} />
                    </div>
                  ),
                  th: ({ node, ...props }) => (
                    <th className="border border-line bg-forest-dark px-3 py-2 font-bold text-cream text-xs " {...props} />
                  ),
                  td: ({ node, ...props }) => (
                    <td className="border border-line px-3 py-2 text-cream text-xs" {...props} />
                  ),
                  a: ({ node, ...props }) => (
                    <a className="text-orange hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
                  ),
                }}
              >
                {file.content}
              </ReactMarkdown>
            </div>
          ) : (
            <pre className="font-mono text-xs text-cream leading-relaxed whitespace-pre-wrap selection:bg-orange selection:text-forest">
              {file.content}
            </pre>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditOpen && (
        <EditFileModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          file={file}
        />
      )}

      {/* History Modal */}
      {isHistoryOpen && (
        <VersionHistoryModal
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          file={file}
        />
      )}
    </div>
  );
};
