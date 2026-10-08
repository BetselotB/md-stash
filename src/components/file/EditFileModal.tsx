import React, { useState } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { StashFile } from '../../domain/types';
import { filesRepo } from '../../db/files.repo';
import { versionsRepo } from '../../db/versions.repo';
import { useUIStore } from '../../store/uiStore';
import { extractTitle } from '../../domain/titleFromContent';

interface EditFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: StashFile;
}

export const EditFileModal: React.FC<EditFileModalProps> = ({
  isOpen,
  onClose,
  file,
}) => {
  const { showToast } = useUIStore();
  const [title, setTitle] = useState(file.title);
  const [filename, setFilename] = useState(file.filename);
  const [tagsInput, setTagsInput] = useState(file.tags.join(', '));
  const [content, setContent] = useState(file.content);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // 1. Take a version snapshot of previous content if changed
      if (content !== file.content) {
        await versionsRepo.add(file.id, file.content);
      }

      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      await filesRepo.update(file.id, {
        title: title.trim() || extractTitle(content, filename),
        filename: filename.trim(),
        content,
        tags,
        size: new Blob([content]).size,
      });

      showToast(`Saved changes to "${filename}"`, 'success');
      onClose();
    } catch (err) {
      console.error(err);
      showToast('Failed to save file edits', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Markdown File"
      description="Make changes and save. A version snapshot will be saved automatically."
      maxWidth="2xl"
    >
      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-cream-dim mb-1">
              Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Display title"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-cream-dim mb-1">
              Filename
            </label>
            <Input
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="e.g. README.md"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-cream-dim mb-1">
            Tags (comma separated)
          </label>
          <Input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="e.g. agents, prompt, guide"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-cream-dim mb-1">
            Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={14}
            className="w-full bg-forest-dark text-cream font-mono text-xs border border-line rounded-lg p-3 focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange resize-y"
            required
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save & Snapshot'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
