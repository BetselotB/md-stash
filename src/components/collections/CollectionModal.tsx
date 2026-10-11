import React, { useState, useEffect } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { confirm } from '../ui/ConfirmDialog';
import { Input } from '../ui/Input';
import { Collection } from '../../domain/types';
import { collectionsRepo } from '../../db/collections.repo';
import { useUIStore } from '../../store/uiStore';
import { CrateGlyph } from '../ui/CrateGlyph';
import { Trash2 } from 'lucide-react';

interface CollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  collection?: Collection | null;
}

// Muted craft paper tones that sit calmly on sage: orange, mustard, clay, sage-green, slate blue, plum
export const PRESET_COLORS = [
  '#E28B38', // Orange
  '#D4A234', // Mustard
  '#C8745E', // Clay
  '#7D9671', // Sage-green
  '#6B8B9B', // Slate blue
  '#9B6F89', // Plum
];

export const CollectionModal: React.FC<CollectionModalProps> = ({
  isOpen,
  onClose,
  collection,
}) => {
  const { showToast } = useUIStore();
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (collection) {
      setName(collection.name);
      setColor(collection.color || PRESET_COLORS[0]);
    } else {
      setName('');
      setColor(PRESET_COLORS[0]);
    }
  }, [collection, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      if (collection) {
        await collectionsRepo.update(collection.id, { name, color, icon: 'folder' });
        showToast(`Updated collection "${name}"`, 'success');
      } else {
        await collectionsRepo.create({ name, color, icon: 'folder', order: 0 });
        showToast(`Created collection "${name}"`, 'success');
      }
      onClose();
    } catch (err) {
      console.error(err);
      showToast('Error saving collection', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!collection) return;
    const ok = await confirm({
      title: `Delete collection "${collection.name}"?`,
      body: 'Files in this collection will be moved to Unsorted. This action cannot be undone.',
      confirmLabel: 'Delete collection',
      cancelLabel: 'Cancel',
      tone: 'danger',
    });
    if (ok) {
      await collectionsRepo.delete(collection.id, true);
      showToast(`Deleted collection "${collection.name}"`, 'info');
      onClose();
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={collection ? 'Edit collection' : 'New collection'}
      description="Organize your markdown files by topic, tool, or project"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block font-display text-[13px] text-ink/80 mb-1.5">
            Collection name
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. AI Prompt Starters, Cursor Rules..."
            required
            autoFocus
          />
        </div>

        <div>
          <label className="block font-display text-[13px] text-ink/80 mb-1.5">
            Craft color
          </label>
          <div className="flex items-center gap-3 flex-wrap">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                  color === c ? 'border-ink scale-110 shadow-sm' : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: c }}
                aria-label={`Select color ${c}`}
              />
            ))}
          </div>
        </div>

        {/* Paper-feel silhouette preview */}
        <div>
          <label className="block font-display text-[13px] text-ink/80 mb-1.5">
            Mark preview
          </label>
          <div className="flex items-center gap-3 p-3 rounded-[10px] bg-[var(--field-bg)] border border-[var(--field-border)]">
            <CrateGlyph color={color} size={26} />
            <div className="min-w-0">
              <div className="text-sm font-bold font-display text-ink leading-tight truncate">
                {name.trim() || 'Collection preview'}
              </div>
              <div className="text-[11px] font-sans text-ink/70">
                Paper-craft index card silhouette
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[rgba(38,51,42,0.15)] mt-2">
          {collection ? (
            <button
              type="button"
              onClick={handleDelete}
              className="min-h-[40px] h-10 px-4 py-2 rounded-full bg-[var(--danger)] hover:bg-[#963024] text-cream font-display text-sm font-bold tracking-wide transition-colors cursor-pointer flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--danger)] focus:ring-offset-2 focus:ring-offset-[var(--dialog-bg)]"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[40px] h-10 px-4 py-2 rounded-full border border-[var(--field-border)] text-ink hover:bg-[rgba(38,51,42,0.06)] font-display text-sm tracking-wide transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-[40px] h-10 px-5 py-2 rounded-full bg-orange hover:bg-orange-deep text-ink font-display text-sm font-bold tracking-wide transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange shadow-sm disabled:opacity-50"
            >
              {collection ? 'Save changes' : 'Create collection'}
            </button>
          </div>
        </div>
      </form>
    </Dialog>
  );
};
