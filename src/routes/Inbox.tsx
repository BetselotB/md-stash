import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { wishlistRepo } from '../db/wishlist.repo';
import { componentsRepo } from '../db/components.repo';
import { useComponents } from '../hooks/useDb';
import { useUIStore } from '../store/uiStore';
import { WishlistItem, ComponentMetadata } from '../domain/componentTypes';
import {
  Inbox as InboxIcon,
  Plus,
  CheckCircle2,
  XCircle,
  Link as LinkIcon,
  Sparkles,
  Clock,
  Layers,
  Search,
} from 'lucide-react';

export const Inbox: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useUIStore();
  const allComponents = useComponents();

  const [items, setItems] = useState<WishlistItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<'pending' | 'completed' | 'dismissed' | 'all'>('pending');
  const [linkingItem, setLinkingItem] = useState<WishlistItem | null>(null);
  const [componentSearch, setComponentSearch] = useState('');

  const loadItems = async () => {
    try {
      const all = await wishlistRepo.getAll();
      setItems(all);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const filteredItems = items.filter((item) => {
    if (filterStatus === 'all') return true;
    return item.status === filterStatus;
  });

  const handleUpdateStatus = async (
    id: string,
    status: 'pending' | 'completed' | 'dismissed'
  ) => {
    try {
      await wishlistRepo.updateStatus(id, status);
      await loadItems();
      showToast(`Marked request as ${status}`, 'success');
    } catch {
      showToast('Failed to update request status', 'error');
    }
  };

  // Link query to existing component
  const handleLinkToComponent = async (component: ComponentMetadata) => {
    if (!linkingItem) return;

    try {
      // Add query to component tags so future agent searches hit it
      const updatedTags = Array.from(new Set([...component.tags, linkingItem.query.toLowerCase()]));
      await componentsRepo.putBatch([{ ...component, tags: updatedTags, updatedAt: Date.now() }]);

      // Mark request as completed
      await wishlistRepo.updateStatus(linkingItem.id, 'completed');
      await loadItems();
      setLinkingItem(null);
      showToast(`Linked request to "${component.name}"!`, 'success');
    } catch {
      showToast('Failed to link component', 'error');
    }
  };

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange/20 border border-orange/40 flex items-center justify-center text-orange-deep">
            <InboxIcon className="w-5 h-5 text-orange" />
          </div>
          <div>
            <h2 className="font-display text-xl text-cream font-bold tracking-tight">
              Wishlist & Agent Requests Inbox
            </h2>
            <p className="text-xs text-cream/70 font-sans">
              Missing components requested by AI agents during coding sessions.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[var(--dialog-bg)] border border-[rgba(38,51,42,0.18)] shadow-xs w-fit">
        {(
          [
            { id: 'pending', label: 'Pending Requests' },
            { id: 'completed', label: 'Completed' },
            { id: 'dismissed', label: 'Dismissed' },
            { id: 'all', label: 'All Requests' },
          ] as const
        ).map((tab) => {
          const isActive = filterStatus === tab.id;
          const count = items.filter((i) => tab.id === 'all' || i.status === tab.id).length;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterStatus(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-display text-xs transition-all cursor-pointer ${
                isActive
                  ? 'bg-forest text-cream font-bold shadow-xs'
                  : 'text-ink/75 hover:bg-[rgba(38,51,42,0.08)] hover:text-ink'
              }`}
            >
              <span>{tab.label}</span>
              <span className="px-1.5 py-0.2 rounded-full font-mono text-[10px] bg-black/10">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Request Cards List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center p-8 bg-[var(--dialog-bg)] rounded-3xl border border-[rgba(38,51,42,0.18)]">
            <CheckCircle2 className="w-12 h-12 text-emerald-500/40 mb-3" />
            <h3 className="font-display text-lg text-ink font-bold mb-1">
              {filterStatus === 'pending' ? 'Inbox Zero!' : 'No requests in this view'}
            </h3>
            <p className="text-xs text-ink/70 font-sans max-w-sm">
              {filterStatus === 'pending'
                ? 'Agents haven’t reported any missing components recently.'
                : 'Switch filters to see other request statuses.'}
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-3xl bg-[var(--dialog-bg)] border border-[rgba(38,51,42,0.18)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
            >
              {/* Request Info */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="font-display text-base font-bold text-ink">
                    "{item.query}"
                  </span>
                  <span className="px-2 py-0.5 rounded-full font-mono text-[11px] font-bold bg-orange/20 text-orange-deep border border-orange/30">
                    Requested {item.count}×
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-mono text-[10px] uppercase font-bold ${
                      item.status === 'completed'
                        ? 'bg-emerald-500/15 text-emerald-700'
                        : item.status === 'dismissed'
                        ? 'bg-ink/10 text-ink/60'
                        : 'bg-amber-500/15 text-amber-700'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                {item.description && (
                  <p className="text-xs text-ink/75 font-sans">{item.description}</p>
                )}

                <div className="flex items-center gap-3 text-[11px] font-sans text-ink/55 pt-0.5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>First: {new Date(item.firstSeen).toLocaleDateString()}</span>
                  </span>
                  <span>•</span>
                  <span>Last: {new Date(item.lastSeen).toLocaleTimeString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {item.status === 'pending' && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/app/add?query=${encodeURIComponent(item.query)}&wishlistId=${item.id}`
                        )
                      }
                      className="px-3.5 py-1.5 rounded-xl bg-orange hover:bg-orange-deep text-forest font-display text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Add Component</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLinkingItem(item)}
                      className="px-3 py-1.5 rounded-xl border border-[rgba(38,51,42,0.2)] hover:border-orange text-ink font-display text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                      title="Link to existing component in library"
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>Link Existing</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(item.id, 'dismissed')}
                      className="p-1.5 rounded-xl text-ink/50 hover:text-ink/80 hover:bg-ink/5 transition-colors cursor-pointer"
                      title="Dismiss request"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </>
                )}

                {item.status !== 'pending' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(item.id, 'pending')}
                    className="px-3 py-1.5 rounded-xl border border-[rgba(38,51,42,0.2)] text-ink font-display text-xs hover:border-orange cursor-pointer"
                  >
                    Reopen Request
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Link to Existing Component Modal Dialog */}
      {linkingItem && (
        <div className="fixed inset-0 z-50 bg-forest-dark/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[var(--dialog-bg)] border border-[rgba(38,51,42,0.22)] rounded-3xl p-6 max-w-lg w-full shadow-2xl text-ink space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-ink">
                Link "{linkingItem.query}" to Existing Component
              </h3>
              <button
                type="button"
                onClick={() => setLinkingItem(null)}
                className="p-1 rounded-lg text-ink/60 hover:text-ink cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-ink/75 font-sans leading-relaxed">
              Select an existing component from your stash. This will tag it with "{linkingItem.query.toLowerCase()}" so agents searching for this query in the future will automatically find it.
            </p>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/50" />
              <input
                type="text"
                value={componentSearch}
                onChange={(e) => setComponentSearch(e.target.value)}
                placeholder="Search components to link..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[rgba(38,51,42,0.18)] bg-white/70 text-xs font-sans text-ink focus:outline-none focus:border-orange"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1.5">
              {allComponents
                .filter(
                  (c) =>
                    !componentSearch ||
                    c.name.toLowerCase().includes(componentSearch.toLowerCase()) ||
                    c.category.toLowerCase().includes(componentSearch.toLowerCase())
                )
                .slice(0, 10)
                .map((comp) => (
                  <button
                    key={comp.id}
                    type="button"
                    onClick={() => handleLinkToComponent(comp)}
                    className="w-full p-2.5 rounded-xl border border-[rgba(38,51,42,0.1)] hover:border-orange hover:bg-white/80 text-left flex items-center justify-between text-xs font-sans transition-all cursor-pointer"
                  >
                    <div>
                      <span className="font-bold text-ink font-display">{comp.name}</span>
                      <span className="text-[10px] text-ink/60 font-mono ml-2">({comp.category})</span>
                    </div>
                    <LinkIcon className="w-3.5 h-3.5 text-orange" />
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
