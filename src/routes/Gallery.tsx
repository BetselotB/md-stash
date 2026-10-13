import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useComponents, useFavoriteComponents } from '../hooks/useDb';
import { searchService } from '../services/search';
import { catalogImportService, ImportProgress } from '../services/catalogImport';
import { ComponentCard } from '../components/library/ComponentCard';
import { ComponentMetadata, Category, ComponentStyling, PreviewStatus } from '../domain/componentTypes';
import { Pin, Search, Filter, Layers, Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';

const CATEGORIES: { id: Category | 'all'; label: string }[] = [
  { id: 'all', label: 'All Components' },
  { id: 'buttons', label: 'Buttons' },
  { id: 'inputs-forms', label: 'Inputs & Forms' },
  { id: 'navigation', label: 'Navigation' },
  { id: 'overlays', label: 'Overlays' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'data-display', label: 'Data Display' },
  { id: 'layout', label: 'Layout' },
  { id: 'text-effects', label: 'Text Effects' },
  { id: 'backgrounds', label: 'Backgrounds' },
  { id: 'hero-and-marketing-sections', label: 'Hero Sections' },
  { id: 'ai-chat', label: 'AI & Chat' },
  { id: 'media', label: 'Media' },
  { id: 'animation-primitives', label: 'Animations' },
  { id: 'hooks', label: 'Hooks' },
  { id: 'misc', label: 'Misc' },
];

export const Gallery: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = (searchParams.get('cat') as Category | 'all') || 'all';
  const filterStyling = searchParams.get('styling') || 'all';
  const filterStatus = searchParams.get('status') || 'all';
  const filterKind = searchParams.get('kind') || 'all';

  const [searchQuery, setSearchQuery] = useState('');
  const [importProgress, setImportProgress] = useState<ImportProgress>(() =>
    catalogImportService.getProgress()
  );

  const allComponents = useComponents();
  const favorites = useFavoriteComponents();

  // Listen to catalog import progress
  useEffect(() => {
    return catalogImportService.subscribe((progress) => {
      setImportProgress(progress);
    });
  }, []);

  // Sync MiniSearch when components change
  useEffect(() => {
    if (allComponents && allComponents.length > 0) {
      searchService.syncComponents(allComponents);
    }
  }, [allComponents]);

  // Handle URL category update
  const handleSelectCategory = (cat: Category | 'all') => {
    const next = new URLSearchParams(searchParams);
    if (cat === 'all') {
      next.delete('cat');
    } else {
      next.set('cat', cat);
    }
    setSearchParams(next);
  };

  // Filter components
  const filteredComponents = useMemo(() => {
    let list: ComponentMetadata[] = allComponents || [];

    // Category filter
    if (activeCategory !== 'all') {
      list = list.filter((c) => c.category === activeCategory);
    }

    // Styling filter
    if (filterStyling !== 'all') {
      list = list.filter((c) => c.styling === filterStyling);
    }

    // Status filter
    if (filterStatus !== 'all') {
      list = list.filter((c) => c.previewStatus === filterStatus);
    }

    // Kind filter
    if (filterKind !== 'all') {
      list = list.filter((c) => c.kind === filterKind);
    }

    // Search query parsing (supports free text + cat: tag: styling: etc.)
    const query = searchQuery.trim();
    if (query.length > 0) {
      let textQuery = query;

      // Extract inline query chips if present
      const catMatch = query.match(/cat:([a-zA-Z0-9_-]+)/);
      if (catMatch) {
        list = list.filter((c) => c.category.toLowerCase().includes(catMatch[1].toLowerCase()));
        textQuery = textQuery.replace(catMatch[0], '').trim();
      }

      const stylingMatch = query.match(/styling:([a-zA-Z0-9_-]+)/);
      if (stylingMatch) {
        list = list.filter((c) => c.styling.toLowerCase().includes(stylingMatch[1].toLowerCase()));
        textQuery = textQuery.replace(stylingMatch[0], '').trim();
      }

      const srcMatch = query.match(/src:([a-zA-Z0-9_-]+)/);
      if (srcMatch) {
        list = list.filter((c) => c.source.toLowerCase().includes(srcMatch[1].toLowerCase()));
        textQuery = textQuery.replace(srcMatch[0], '').trim();
      }

      if (textQuery.length > 0) {
        const matchIds = new Set(searchService.searchComponents(textQuery).map((r) => r.id));
        list = list.filter((c) => matchIds.has(c.id));
      }
    }

    return list;
  }, [allComponents, activeCategory, filterStyling, filterStatus, filterKind, searchQuery]);

  // Responsive Virtualization Grid Setup
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1200);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Compute number of columns based on width (min card width ~320px)
  const columns = useMemo(() => {
    return Math.max(1, Math.floor(containerWidth / 340));
  }, [containerWidth]);

  // Group items into virtual rows
  const rows = useMemo(() => {
    const result: ComponentMetadata[][] = [];
    for (let i = 0; i < filteredComponents.length; i += columns) {
      result.push(filteredComponents.slice(i, i + columns));
    }
    return result;
  }, [filteredComponents, columns]);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => containerRef.current?.closest('main') || null,
    estimateSize: () => 350,
    overscan: 3,
    scrollMargin: containerRef.current?.offsetTop ?? 0,
  });

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-12">
      {/* Top Banner: Catalog Import Progress if still stocking */}
      {importProgress.status === 'importing' && (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--dialog-bg)] border border-orange/40 text-ink shadow-xs">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-4 h-4 text-orange animate-spin shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-ink">Stocking crates: </span>
              <span className="text-ink/80">
                Imported {importProgress.imported.toLocaleString()} / {importProgress.total.toLocaleString()} components ({importProgress.percentage}%)
              </span>
            </div>
          </div>
          <div className="w-32 bg-forest/20 rounded-full h-2 overflow-hidden border border-forest/10">
            <div
              className="bg-orange h-full transition-all duration-300"
              style={{ width: `${importProgress.percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Search & Filter Header Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--dialog-bg)] border border-[rgba(38,51,42,0.18)] shadow-xs">
        {/* Search input with icons and chip hints */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 8,000+ components (or try 'cat:buttons', 'styling:tailwind', 'modal')..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[rgba(248,247,230,0.45)] border border-[rgba(38,51,42,0.18)] text-ink placeholder:text-ink/45 text-xs font-sans focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange transition-all"
          />
        </div>

        {/* Dropdown Filters: Styling & Status */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Styling selector */}
          <select
            value={filterStyling}
            onChange={(e) => {
              const next = new URLSearchParams(searchParams);
              if (e.target.value === 'all') next.delete('styling');
              else next.set('styling', e.target.value);
              setSearchParams(next);
            }}
            className="px-3 py-2 rounded-xl bg-[rgba(248,247,230,0.45)] border border-[rgba(38,51,42,0.18)] text-ink text-xs font-display focus:outline-none focus:border-orange cursor-pointer"
          >
            <option value="all">All Styling</option>
            <option value="tailwind">Tailwind</option>
            <option value="unstyled">Unstyled (Radix/Aria)</option>
            <option value="css-modules">CSS Modules</option>
            <option value="css-in-js">CSS-in-JS</option>
            <option value="mixed">Mixed</option>
          </select>

          {/* Preview status selector */}
          <select
            value={filterStatus}
            onChange={(e) => {
              const next = new URLSearchParams(searchParams);
              if (e.target.value === 'all') next.delete('status');
              else next.set('status', e.target.value);
              setSearchParams(next);
            }}
            className="px-3 py-2 rounded-xl bg-[rgba(248,247,230,0.45)] border border-[rgba(38,51,42,0.18)] text-ink text-xs font-display focus:outline-none focus:border-orange cursor-pointer"
          >
            <option value="all">All Previews</option>
            <option value="ready">Ready (Live Sandbox)</option>
            <option value="needs-demo">Needs Demo</option>
            <option value="primitive">Primitive Sub-part</option>
            <option value="unsupported">Unsupported</option>
          </select>

          {/* Result counter badge */}
          <div className="px-3 py-2 rounded-xl bg-forest/10 border border-forest/15 text-forest font-mono text-xs font-bold shrink-0">
            {filteredComponents.length.toLocaleString()} items
          </div>
        </div>
      </div>

      {/* Category Tabs Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleSelectCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-display tracking-tight transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                isActive
                  ? 'bg-cream text-ink font-bold shadow-sm ring-1 ring-[rgba(38,51,42,0.15)]'
                  : 'bg-[rgba(248,247,230,0.15)] text-cream hover:bg-[rgba(248,247,230,0.25)] hover:text-cream'
              }`}
            >
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Pinned Favorites Row (if any favorited) */}
      {favorites.length > 0 && !searchQuery.trim() && activeCategory === 'all' && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <Pin className="w-4 h-4 fill-orange text-orange stroke-[1.5]" />
            <h2 className="font-display text-lg text-cream tracking-tight">Pinned Favorites</h2>
            <span className="font-sans text-xs text-cream/70 font-semibold">({favorites.length})</span>
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
            {favorites.slice(0, 4).map((comp, idx) => (
              <ComponentCard key={`fav-${comp.id}`} component={comp} index={idx} />
            ))}
          </div>
        </div>
      )}

      {/* Main Virtualized Grid Container */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cream/80" />
            <h2 className="font-display text-lg text-cream tracking-tight">
              {activeCategory === 'all' ? 'All Components' : CATEGORIES.find((c) => c.id === activeCategory)?.label}
            </h2>
            <span className="font-sans text-xs text-cream/70 font-semibold">
              ({filteredComponents.length})
            </span>
          </div>
        </div>

        {/* Empty Search Results State */}
        {filteredComponents.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center p-8 bg-[var(--dialog-bg)] rounded-3xl border border-[rgba(38,51,42,0.18)]">
            <Layers className="w-12 h-12 text-ink/30 mb-3" />
            <h3 className="font-display text-xl text-ink font-bold mb-1">No components found</h3>
            <p className="text-xs text-ink/70 font-sans max-w-sm mb-4">
              Try broadening your search query or selecting a different category or styling filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSearchParams({});
              }}
              className="px-4 py-2 rounded-xl bg-orange hover:bg-orange-deep text-forest text-xs font-display cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Virtualized Rows List */}
        {filteredComponents.length > 0 && (
          <div
            ref={containerRef}
            className="w-full relative min-h-[600px] overflow-visible"
          >
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const rowItems = rows[virtualRow.index] || [];
                return (
                  <div
                    key={virtualRow.key}
                    data-index={virtualRow.index}
                    ref={rowVirtualizer.measureElement}
                    className="absolute top-0 left-0 w-full grid gap-4 pb-4"
                    style={{
                      transform: `translateY(${virtualRow.start}px)`,
                      gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                    }}
                  >
                    {rowItems.map((comp, idx) => (
                      <ComponentCard
                        key={comp.id}
                        component={comp}
                        index={virtualRow.index * columns + idx}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
