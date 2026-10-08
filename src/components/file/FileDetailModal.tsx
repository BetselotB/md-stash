import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { StashFile, Collection, CopyMode } from '../../domain/types';
import { formatFileForCopy } from '../../domain/copyFormats';
import { setupDragOut } from '../../services/dragOut';
import { persistenceService } from '../../services/persistence';
import { useUIStore } from '../../store/uiStore';
import { filesRepo } from '../../db/files.repo';
import { Button } from '../ui/Button';
import { EditFileModal } from './EditFileModal';
import { VersionHistoryModal } from './VersionHistoryModal';
import {
  X,
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
} from 'lucide-react';

interface FileDetailModalProps {
  file: StashFile | null;
  collection?: Collection;
  onClose: () => void;
}

export const FileDetailModal: React.FC<FileDetailModalProps> = ({
  file,
  collection,
  onClose,
}) => {
  const { showToast } = useUIStore();
  const [activeTab, setActiveTab] = useState<'preview' | 'raw'>('preview');
  const [isCopied, setIsCopied] = useState(false);
  const [showCopyMenu, setShowCopyMenu] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  if (!file) return null;

  const handleCopy = async (mode: CopyMode) => {
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
    if (confirm(`Delete "${file.filename}"? This cannot be undone.`)) {
      await filesRepo.delete(file.id);
      showToast(`Deleted "${file.filename}"`, 'info');
      onClose();
    }
  };

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-forest-dark/85 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      >
        <div
          className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-forest border border-line rounded-2xl shadow-card overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-line bg-forest-dark/60">
            <div className="flex items-center gap-3 min-w-0">
              {collection && (
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: collection.color }}
                  title={collection.name}
                />
              )}
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-bold text-cream truncate">
                  {file.title}
                </h2>
                <div className="flex items-center gap-2 text-xs text-cream-dim font-mono">
                  <span>{file.filename}</span>
                  <span>•</span>
                  <span>{persistenceService.formatBytes(file.size)}</span>
                  <span>•</span>
                  <span>Updated {new Date(file.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleTogglePin}
                className={`p-2 rounded-lg border border-line hover:bg-cream-faint transition-colors cursor-pointer ${
                  file.pinned ? 'text-pink border-pink' : 'text-cream-dim'
                }`}
                title={file.pinned ? 'Unpin' : 'Pin to top'}
              >
                <Pin className={`w-4 h-4 ${file.pinned ? 'fill-pink' : ''}`} />
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-lg text-cream-dim hover:text-cream hover:bg-cream-faint border border-line transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Action Bar (Sticky / Prominent) */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 border-b border-line bg-forest/90">
            {/* View Mode Tabs */}
            <div className="flex items-center gap-1 p-1 bg-forest-dark border border-line rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-pink text-forest shadow-sm'
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
                    ? 'bg-pink text-forest shadow-sm'
                    : 'text-cream-dim hover:text-cream'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Raw</span>
              </button>
            </div>

            {/* Core Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Copy dropdown */}
              <div className="relative">
                <div className="inline-flex rounded-full shadow-sm">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleCopy('prompt')}
                    icon={isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  >
                    {isCopied ? 'Copied!' : 'Copy Prompt'}
                  </Button>
                  <button
                    type="button"
                    onClick={() => setShowCopyMenu(!showCopyMenu)}
                    className="bg-pink text-forest hover:bg-pink-deep px-2 rounded-r-full border-l border-forest/20 flex items-center justify-center cursor-pointer -ml-2"
                    aria-label="More copy options"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {showCopyMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-forest-dark border border-line rounded-xl shadow-card py-1.5 z-50 text-xs animate-fadeIn">
                    <button
                      type="button"
                      onClick={() => handleCopy('prompt')}
                      className="w-full text-left px-3 py-2 text-cream hover:bg-forest-light hover:text-pink transition-colors"
                    >
                      Prompt-ready (with header)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy('codeblock')}
                      className="w-full text-left px-3 py-2 text-cream hover:bg-forest-light hover:text-pink transition-colors"
                    >
                      Fenced Code Block
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy('raw')}
                      className="w-full text-left px-3 py-2 text-cream hover:bg-forest-light hover:text-pink transition-colors"
                    >
                      Raw Content
                    </button>
                  </div>
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

              {/* Drag Me handle */}
              <div
                draggable
                onDragStart={handleDragStart}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-forest-dark border border-line text-xs font-bold text-cream-dim hover:text-cream cursor-grab active:cursor-grabbing hover:border-pink transition-colors"
                title="Drag file out to Desktop or IDE"
              >
                <GripVertical className="w-3.5 h-3.5 text-pink" />
                <span>Drag Me</span>
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
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tags list if any */}
          {file.tags.length > 0 && (
            <div className="flex items-center gap-1.5 px-6 py-2 bg-forest-dark/30 border-b border-line/40 text-xs">
              <span className="text-cream-dim/60 font-semibold uppercase text-[10px]">Tags:</span>
              {file.tags.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded-full bg-forest border border-line text-cream-dim text-[11px]"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Main Content View (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-6 bg-forest/40">
            {activeTab === 'preview' ? (
              <div className="prose prose-invert max-w-none text-cream text-sm leading-relaxed space-y-4">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeSanitize]}
                  components={{
                    h1: ({ node, ...props }) => (
                      <h1 className="font-display text-3xl tracking-wide uppercase text-cream pb-2 border-b border-line" {...props} />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2 className="font-display text-2xl tracking-wide uppercase text-cream pt-2" {...props} />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3 className="font-bold text-lg text-cream" {...props} />
                    ),
                    code: ({ node, className, children, ...props }) => {
                      const match = /language-(\w+)/.exec(className || '');
                      return (
                        <code
                          className="bg-forest-dark px-1.5 py-0.5 rounded border border-line text-pink font-mono text-xs"
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
                      <blockquote className="border-l-4 border-pink pl-4 italic text-cream-dim my-3" {...props} />
                    ),
                    table: ({ node, ...props }) => (
                      <div className="overflow-x-auto my-3">
                        <table className="w-full text-left border-collapse border border-line" {...props} />
                      </div>
                    ),
                    th: ({ node, ...props }) => (
                      <th className="border border-line bg-forest-dark px-3 py-2 font-bold text-cream text-xs uppercase" {...props} />
                    ),
                    td: ({ node, ...props }) => (
                      <td className="border border-line px-3 py-2 text-cream text-xs" {...props} />
                    ),
                    a: ({ node, ...props }) => (
                      <a className="text-pink hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
                    ),
                  }}
                >
                  {file.content}
                </ReactMarkdown>
              </div>
            ) : (
              <pre className="font-mono text-xs text-cream leading-relaxed whitespace-pre-wrap selection:bg-pink selection:text-forest">
                {file.content}
              </pre>
            )}
          </div>
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
    </>
  );
};
