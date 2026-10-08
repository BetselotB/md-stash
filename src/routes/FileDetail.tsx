import React, { useState } from 'react';
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

export const FileDetail: React.FC = () => {
  const { fileId } = useParams<{ fileId: string }>();
  const navigate = useNavigate();
  const file = useFile(fileId);
  const collection = useCollection(file?.collectionId || undefined);
  const { showToast } = useUIStore();

  const [activeTab, setActiveTab] = useState<'preview' | 'raw'>('preview');
  const [isCopied, setIsCopied] = useState(false);
  const [showCopyMenu, setShowCopyMenu] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Friendly not found state if fileId is not present
  if (!file) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-forest border border-line flex items-center justify-center text-pink mx-auto">
          <FileQuestion className="w-8 h-8" />
        </div>
        <h2 className="font-display text-3xl uppercase tracking-wider text-cream">
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
    if (confirm(`Delete "${file.filename}"? This action cannot be undone.`)) {
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
              className="hover:text-cream transition-colors flex items-center gap-1"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: collection.color }}
              />
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
        <div className="px-6 py-5 border-b border-line bg-forest-dark/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-cream truncate">{file.title}</h1>
              <button
                type="button"
                onClick={handleTogglePin}
                className={`p-1.5 rounded-lg border border-line hover:bg-cream-faint transition-colors cursor-pointer ${
                  file.pinned ? 'text-pink border-pink' : 'text-cream-dim'
                }`}
                title={file.pinned ? 'Unpin' : 'Pin to top'}
              >
                <Pin className={`w-4 h-4 ${file.pinned ? 'fill-pink' : ''}`} />
              </button>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-cream-dim font-mono flex-wrap">
              <span>{file.filename}</span>
              <span>•</span>
              <span>{persistenceService.formatBytes(file.size)}</span>
              <span>•</span>
              <span>Updated {new Date(file.updatedAt).toLocaleString()}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
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

            {/* Drag Me */}
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

        {/* Sub-bar: Tabs and Tags */}
        <div className="px-6 py-3 border-b border-line bg-forest/80 flex items-center justify-between gap-4 flex-wrap">
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
              <span>Raw Markdown</span>
            </button>
          </div>

          {file.tags.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-cream-dim/60 font-semibold uppercase text-[10px]">Tags:</span>
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
                    <h1 className="font-display text-3xl tracking-wide uppercase text-cream pb-2 border-b border-line" {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 className="font-display text-2xl tracking-wide uppercase text-cream pt-2" {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 className="font-bold text-lg text-cream" {...props} />
                  ),
                  code: ({ node, className, children, ...props }) => {
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
