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
      title="Edit markdown file"
      description="Make changes and save. A version snapshot will be saved automatically."
      maxWidth="2xl"
    >
      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-display text-[13px] text-ink/80 mb-1.5">
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
            <label className="block font-display text-[13px] text-ink/80 mb-1.5">
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
          <label className="block font-display text-[13px] text-ink/80 mb-1.5">
            Tags, comma separated
          </label>
          <Input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="e.g. agents, prompt, guide"
          />
        </div>

        <div>
          <label className="block font-display text-[13px] text-ink/80 mb-1.5">
            Markdown content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={14}
            className="w-full bg-[var(--field-bg)] text-ink font-mono text-sm border border-[var(--field-border)] rounded-[10px] p-3 focus:outline-none focus:border-orange focus:ring-2 focus:ring-orange/40 resize-y placeholder:text-ink/60"
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
            {isSaving ? 'Saving...' : 'Save & snapshot'}
          </button>
        </div>
      </form>
    </Dialog>
  );
};
