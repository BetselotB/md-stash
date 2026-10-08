import React, { useState, useEffect } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useUIStore } from '../../store/uiStore';
import { useCollections } from '../../hooks/useDb';
import { filesRepo } from '../../db/files.repo';
import { extractTitle } from '../../domain/titleFromContent';

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
  const [collectionId, setCollectionId] = useState<string>('');
  const [tagsInput, setTagsInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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

      showToast(`Stashed "${filename}" successfully!`, 'success');
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
      title="Create / Stash Markdown File"
      description="Save markdown text directly into your local library"
      maxWidth="lg"
    >
      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-cream-dim mb-1">
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
            <label className="block text-xs font-semibold uppercase text-cream-dim mb-1">
              Collection
            </label>
            <select
              value={collectionId}
              onChange={(e) => setCollectionId(e.target.value)}
              className="w-full bg-forest text-cream border border-line rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-pink focus:ring-1 focus:ring-pink"
            >
              <option value="">(Unsorted)</option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-cream-dim mb-1">
            Tags (comma separated)
          </label>
          <Input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="e.g. claude, prompt, rules"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-cream-dim mb-1">
            Markdown Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="w-full bg-forest-dark text-cream font-mono text-sm border border-line rounded-lg p-3 focus:outline-none focus:border-pink focus:ring-1 focus:ring-pink resize-y"
            placeholder="# Stash your markdown here..."
            required
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-line">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSaving}>
            {isSaving ? 'Stashing...' : 'Save to Stash'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
