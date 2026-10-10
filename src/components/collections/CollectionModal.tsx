import React, { useState, useEffect } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
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
    if (confirm(`Delete collection "${collection.name}"? Files will be moved to Unsorted.`)) {
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
          <label className="block text-xs font-bold text-ink/80 mb-1">
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
          <label className="block text-xs font-bold text-ink/80 mb-2">
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
          <label className="block text-xs font-bold text-ink/80 mb-1.5">
            Mark preview
          </label>
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#D8D3BC] border border-[rgba(38,51,42,0.22)]">
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

        <div className="flex items-center justify-between pt-4 border-t border-[rgba(38,51,42,0.12)] mt-2">
          {collection ? (
            <Button
              type="button"
              variant="ghost"
              onClick={handleDelete}
              className="text-red-700 hover:text-red-800"
              icon={<Trash2 className="w-4 h-4" />}
            >
              Delete
            </Button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" onClick={onClose} className="text-ink/70 hover:text-ink">
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {collection ? 'Save changes' : 'Create collection'}
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  );
};
