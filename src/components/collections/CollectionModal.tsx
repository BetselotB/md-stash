import React, { useState, useEffect } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Collection } from '../../domain/types';
import { collectionsRepo } from '../../db/collections.repo';
import { useUIStore } from '../../store/uiStore';
import { Folder, Bookmark, Code, Terminal, Sparkles, Compass, Tag, Trash2 } from 'lucide-react';

interface CollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  collection?: Collection | null;
}

const PRESET_COLORS = [
  '#F2A33A', // Orange
  '#D98821', // Orange Deep
  '#8A9A78', // Sunny Sage
  '#76866A', // Sage Deep
  '#E6AF2E', // Retro Gold
  '#3D84A8', // Slate Ocean
  '#D76F6F', // Retro Terra
  '#A084E8', // Lavender
];

const PRESET_ICONS = [
  { key: 'folder', icon: Folder, label: 'Folder' },
  { key: 'bookmark', icon: Bookmark, label: 'Bookmark' },
  { key: 'code', icon: Code, label: 'Code' },
  { key: 'terminal', icon: Terminal, label: 'Terminal' },
  { key: 'sparkles', icon: Sparkles, label: 'Sparkles' },
  { key: 'compass', icon: Compass, label: 'Compass' },
  { key: 'tag', icon: Tag, label: 'Tag' },
];

export const CollectionModal: React.FC<CollectionModalProps> = ({
  isOpen,
  onClose,
  collection,
}) => {
  const { showToast } = useUIStore();
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [icon, setIcon] = useState('folder');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (collection) {
      setName(collection.name);
      setColor(collection.color || PRESET_COLORS[0]);
      setIcon(collection.icon || 'folder');
    } else {
      setName('');
      setColor(PRESET_COLORS[0]);
      setIcon('folder');
    }
  }, [collection, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      if (collection) {
        await collectionsRepo.update(collection.id, { name, color, icon });
        showToast(`Updated collection "${name}"`, 'success');
      } else {
        await collectionsRepo.create({ name, color, icon, order: 0 });
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
      title={collection ? 'Edit Collection' : 'New Collection'}
      description="Organize your markdown files by topic, tool, or project"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block text-xs font-semibold text-cream-dim mb-1">
            Collection Name
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
          <label className="block text-xs font-semibold text-cream-dim mb-2">
            Badge Color
          </label>
          <div className="flex items-center gap-3 flex-wrap">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                  color === c ? 'border-cream scale-110 shadow-glow' : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: c }}
                aria-label={`Select color ${c}`}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-cream-dim mb-2">
            Icon
          </label>
          <div className="grid grid-cols-7 gap-2">
            {PRESET_ICONS.map((item) => {
              const IconComp = item.icon;
              const isSelected = icon === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setIcon(item.key)}
                  className={`p-2.5 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
                    isSelected
                      ? 'border-orange bg-orange/20 text-orange'
                      : 'border-line bg-forest hover:bg-forest-light text-cream-dim'
                  }`}
                  aria-label={item.label}
                >
                  <IconComp className="w-5 h-5" />
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-line mt-2">
          {collection ? (
            <Button
              type="button"
              variant="ghost"
              onClick={handleDelete}
              className="text-rose-400 hover:text-rose-300"
              icon={<Trash2 className="w-4 h-4" />}
            >
              Delete
            </Button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {collection ? 'Save Changes' : 'Create Collection'}
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  );
};
