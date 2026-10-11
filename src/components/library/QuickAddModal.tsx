import React, { useState, useEffect } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useUIStore } from '../../store/uiStore';
import { useCollections } from '../../hooks/useDb';
import { filesRepo } from '../../db/files.repo';
import { extractTitle } from '../../domain/titleFromContent';
import { getTargetCollectionFromRoute, getRouteCollectionId } from '../../services/fileImport';
import { Select, SelectOption } from '../ui/Select';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialContent?: string;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  initialContent = '',
}) => {
  const collections = useCollections();
  const { showToast } = useUIStore();

  const [filename, setFilename] = useState('new-note.md');
  const [content, setContent] = useState('');
  const [collectionId, setCollectionId] = useState<string>(() => {
    const rawId = getRouteCollectionId();
    return rawId || '';
  });
  const [tagsInput, setTagsInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const rawId = getRouteCollectionId();
      if (rawId && collections.some((c) => c.id === rawId)) {
        setCollectionId(rawId);
      } else if (!rawId) {
        setCollectionId('');
      } else {
        getTargetCollectionFromRoute().then((target) => {
          setCollectionId(target.collectionId || '');
        });
      }
    }
  }, [isOpen, collections]);

  useEffect(() => {
    if (initialContent) {
      setContent(initialContent);
      const title = extractTitle(initialContent, 'pasted-snippet');
      const safeName = `${title.toLowerCase().replace(/[^a-z0-9_-]/g, '-').slice(0, 30)}.md`;
      setFilename(safeName || 'pasted-note.md');
    } else {
      setContent('');
      setFilename('new-note.md');
    }
  }, [initialContent, isOpen]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      showToast('File content cannot be empty', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const title = extractTitle(content, filename);

      await filesRepo.create({
        title,
        filename: filename.endsWith('.md') ? filename : `${filename}.md`,
        content,
        collectionId: collectionId || null,
        tags,
        pinned: false,
        size: new Blob([content]).size,
      });

      const targetCol = collections.find((c) => c.id === collectionId);
      if (targetCol) {
        showToast(`Stashed "${filename}" to ${targetCol.name}!`, 'success');
      } else {
        showToast(`Stashed "${filename}" successfully!`, 'success');
      }
      onClose();
    } catch (err) {
      console.error(err);
      showToast('Failed to create file', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Create or stash markdown file"
      description="Save markdown text directly into your local library"
      maxWidth="lg"
    >
      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-display text-[13px] text-ink/80 mb-1.5">
              Filename
            </label>
            <Input
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="e.g. CLAUDE.md"
              required
            />
          </div>

          <div>
            <label className="block font-display text-[13px] text-ink/80 mb-1.5">
              Collection
            </label>
            <Select
              value={collectionId}
              onChange={(val) => setCollectionId(val)}
              options={[
                { value: '', label: '(Unsorted)' },
                ...collections.map((c) => ({ value: c.id, label: c.name })),
              ]}
              label="Collection"
              variant="field"
              placement="down"
              className="w-full"
            />
          </div>
        </div>

        <div>
          <label className="block font-display text-[13px] text-ink/80 mb-1.5">
            Tags, comma separated
          </label>
          <Input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="e.g. claude, prompt, rules"
          />
        </div>

        <div>
          <label className="block font-display text-[13px] text-ink/80 mb-1.5">
            Markdown content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="w-full bg-[var(--field-bg)] text-ink font-mono text-sm border border-[var(--field-border)] rounded-[10px] p-3 focus:outline-none focus:border-orange focus:ring-2 focus:ring-orange/40 resize-y placeholder:text-ink/60"
            placeholder="# Stash your markdown here..."
            required
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[rgba(38,51,42,0.15)]">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] h-10 px-4 py-2 rounded-full border border-[var(--field-border)] text-ink hover:bg-[rgba(38,51,42,0.06)] font-display text-sm tracking-wide transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="min-h-[40px] h-10 px-5 py-2 rounded-full bg-orange hover:bg-orange-deep text-ink font-display text-sm font-bold tracking-wide transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange shadow-sm disabled:opacity-50"
          >
            {isSaving ? 'Stashing...' : 'Save to stash'}
          </button>
        </div>
      </form>
    </Dialog>
  );
};
