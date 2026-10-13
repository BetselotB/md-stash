import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { componentsRepo } from '../db/components.repo';
import { wishlistRepo } from '../db/wishlist.repo';
import { useComponents } from '../hooks/useDb';
import { useUIStore } from '../store/uiStore';
import { PreviewSandbox } from '../components/preview/PreviewSandbox';
import {
  parseFromPaste,
  parseFromDrop,
  fetchFromRegistryUrl,
  fetchFromGithubUrl,
  checkDeduplication,
  slugify,
  ParsedImportResult,
  DedupeCheckResult,
} from '../services/componentImport';
import { Category, ComponentMetadata, CodeBlob } from '../domain/componentTypes';
import {
  ArrowLeft,
  Plus,
  Clipboard,
  Upload,
  Globe,
  GitBranch,
  AlertTriangle,
  Check,
  Sparkles,
  Layers,
  FileCode,
} from 'lucide-react';

const CATEGORY_OPTIONS: { id: Category; label: string }[] = [
  { id: 'buttons', label: 'Buttons' },
  { id: 'inputs-forms', label: 'Inputs & Forms' },
  { id: 'selection', label: 'Selection' },
  { id: 'navigation', label: 'Navigation' },
  { id: 'overlays', label: 'Overlays' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'data-display', label: 'Data Display' },
  { id: 'charts', label: 'Charts' },
  { id: 'layout', label: 'Layout' },
  { id: 'text-effects', label: 'Text Effects' },
  { id: 'backgrounds', label: 'Backgrounds' },
  { id: 'cursors-and-pointer', label: 'Cursors & Pointer' },
  { id: 'scroll-and-parallax', label: 'Scroll & Parallax' },
  { id: '3d-and-canvas', label: '3D & Canvas' },
  { id: 'hero-and-marketing-sections', label: 'Hero Sections' },
  { id: 'ai-chat', label: 'AI & Chat' },
  { id: 'media', label: 'Media' },
  { id: 'animation-primitives', label: 'Animation Primitives' },
  { id: 'hooks', label: 'Hooks' },
  { id: 'misc', label: 'Misc' },
];

type ImportTab = 'paste' | 'drop' | 'registry' | 'github';

export const AddComponent: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefillQuery = searchParams.get('query') || '';
  const wishlistId = searchParams.get('wishlistId');

  const { showToast } = useUIStore();
  const allComponents = useComponents();

  const [activeTab, setActiveTab] = useState<ImportTab>('paste');
  const [inputText, setInputText] = useState(
    prefillQuery
      ? `// ${prefillQuery}\nexport default function ${prefillQuery
          .replace(/[^a-zA-Z0-9]/g, '')
          .replace(/^[a-z]/, (c) => c.toUpperCase())}() {\n  return (\n    <div className="p-4 rounded-xl bg-muted text-foreground">\n      <h3>${prefillQuery}</h3>\n    </div>\n  );\n}`
      : ''
  );
  const [inputUrl, setInputUrl] = useState('');
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);

  // Form State
  const [parsed, setParsed] = useState<ParsedImportResult | null>(null);
  const [dedupeResult, setDedupeResult] = useState<DedupeCheckResult | null>(null);
  const [blobsMap, setBlobsMap] = useState<Map<string, string>>(new Map());

  // Load existing blobs for dedupe checking
  useEffect(() => {
    let cancelled = false;
    async function loadAllBlobs() {
      const map = new Map<string, string>();
      for (const comp of allComponents.slice(0, 300)) {
        const b = await componentsRepo.getCodeBlob(comp.id);
        if (b?.code) map.set(comp.id, b.code);
      }
      if (!cancelled) setBlobsMap(map);
    }
    loadAllBlobs();
    return () => {
      cancelled = true;
    };
  }, [allComponents.length]);

  // Parse input whenever text changes
  useEffect(() => {
    if (inputText.trim().length > 10) {
      try {
        const result = parseFromPaste(inputText, prefillQuery || 'New Component');
        setParsed(result);

        // Check deduplication
        const dedupe = checkDeduplication(result.code, result.id, allComponents, blobsMap);
        setDedupeResult(dedupe);
      } catch (err) {
        console.error(err);
      }
    } else {
      setParsed(null);
      setDedupeResult(null);
    }
  }, [inputText, prefillQuery, allComponents, blobsMap]);

  // Handle URL Fetch
  const handleFetchUrl = async () => {
    if (!inputUrl.trim()) return;
    try {
      setIsLoadingUrl(true);
      let res: ParsedImportResult;
      if (activeTab === 'registry') {
        res = await fetchFromRegistryUrl(inputUrl);
      } else {
        res = await fetchFromGithubUrl(inputUrl);
      }

      setInputText(res.code);
      setParsed(res);
      const dedupe = checkDeduplication(res.code, res.id, allComponents, blobsMap);
      setDedupeResult(dedupe);
      showToast(`Fetched and parsed "${res.name}" successfully!`, 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to fetch from URL', 'error');
    } finally {
      setIsLoadingUrl(false);
    }
  };

  // Handle File Drop
  const handleDropFile = async (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      try {
        const res = await parseFromDrop(file);
        setInputText(res.code);
        setParsed(res);
        const dedupe = checkDeduplication(res.code, res.id, allComponents, blobsMap);
        setDedupeResult(dedupe);
        showToast(`Imported ${file.name} cleanly!`, 'success');
      } catch {
        showToast('Failed to parse dropped file', 'error');
      }
    }
  };

  // Save Component
  const handleSaveComponent = async () => {
    if (!parsed) return;

    try {
      const now = Date.now();
      const meta: ComponentMetadata = {
        id: parsed.id,
        name: parsed.name,
        kind: 'component',
        category: parsed.category,
        tags: parsed.tags,
        framework: parsed.framework,
        styling: parsed.styling,
        requires: parsed.requires,
        source: parsed.source,
        previewStatus: 'ready',
        license: parsed.license,
        attribution: parsed.attribution,
        favorite: false,
        origin: 'user',
        description: parsed.description,
        depsCount: parsed.deps.length,
        createdAt: now,
        updatedAt: now,
      };

      const blob: CodeBlob = {
        id: parsed.id,
        code: parsed.code,
        usage: parsed.usage,
        props: [],
        deps: parsed.deps,
        dependsOn: [],
        shared: ['utils/cn'],
      };

      await componentsRepo.putBatch([meta]);
      await componentsRepo.putCodeBlob(blob);

      // If completing a wishlist item
      if (wishlistId) {
        await wishlistRepo.updateStatus(wishlistId, 'completed');
      }

      showToast(`Saved component "${meta.name}" to stash!`, 'success');
      navigate(`/app/c/${meta.id}`);
    } catch (err) {
      showToast('Failed to save component to stash', 'error');
    }
  };

  // Preview component wrapper
  const previewMeta: ComponentMetadata = parsed
    ? {
        id: parsed.id,
        name: parsed.name,
        kind: 'component',
        category: parsed.category,
        tags: parsed.tags,
        framework: parsed.framework,
        styling: parsed.styling,
        requires: parsed.requires,
        source: parsed.source,
        previewStatus: 'ready',
        license: parsed.license,
        attribution: parsed.attribution,
        favorite: false,
        origin: 'user',
        description: parsed.description,
        depsCount: parsed.deps.length,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
    : {
        id: 'new-component',
        name: 'Preview Component',
        kind: 'component',
        category: 'misc',
        tags: [],
        framework: 'react',
        styling: 'tailwind',
        requires: [],
        source: 'user',
        previewStatus: 'ready',
        license: 'MIT',
        attribution: 'User component',
        favorite: false,
        origin: 'user',
        description: '',
        depsCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/app')}
            className="p-2 rounded-xl bg-[var(--dialog-bg)] border border-[rgba(38,51,42,0.18)] hover:border-orange text-ink transition-colors cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="font-display text-xl text-cream font-bold tracking-tight">
              Add Component to Stash
            </h2>
            <p className="text-xs text-cream/70 font-sans">
              Import from raw TSX/JSX, dropped files, shadcn registry URLs, or GitHub.
            </p>
          </div>
        </div>
      </div>

      {/* Import Source Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[var(--dialog-bg)] border border-[rgba(38,51,42,0.18)] shadow-xs w-fit">
        {(
          [
            { id: 'paste', label: 'Paste Code', icon: Clipboard },
            { id: 'drop', label: 'File Drop', icon: Upload },
            { id: 'registry', label: 'Registry URL', icon: Globe },
            { id: 'github', label: 'GitHub URL', icon: GitBranch },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-display text-xs transition-all cursor-pointer ${
                isActive
                  ? 'bg-forest text-cream font-bold shadow-xs'
                  : 'text-ink/75 hover:bg-[rgba(38,51,42,0.08)] hover:text-ink'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* URL Fetch Bar (if registry or github tab active) */}
      {(activeTab === 'registry' || activeTab === 'github') && (
        <div className="flex items-center gap-3 p-4 rounded-3xl bg-[var(--dialog-bg)] border border-[rgba(38,51,42,0.18)] shadow-xs">
          <input
            type="url"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder={
              activeTab === 'registry'
                ? 'https://ui.shadcn.com/r/button.json or local registry URL...'
                : 'https://github.com/user/repo/blob/main/components/ui/button.tsx...'
            }
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-[rgba(38,51,42,0.18)] text-xs font-sans text-ink bg-white/70 focus:outline-none focus:border-orange"
          />
          <button
            type="button"
            onClick={handleFetchUrl}
            disabled={isLoadingUrl || !inputUrl.trim()}
            className="px-4 py-2.5 rounded-xl bg-orange hover:bg-orange-deep text-forest font-display text-xs font-bold disabled:opacity-50 cursor-pointer shadow-xs transition-all"
          >
            {isLoadingUrl ? 'Fetching...' : 'Fetch & Parse'}
          </button>
        </div>
      )}

      {/* File Drop Surface (if drop tab active) */}
      {activeTab === 'drop' && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDropFile}
          className="p-8 border-2 border-dashed border-[rgba(38,51,42,0.3)] hover:border-orange rounded-3xl bg-[var(--dialog-bg)] text-center cursor-pointer transition-all"
        >
          <Upload className="w-8 h-8 text-orange mx-auto mb-2" />
          <h4 className="font-display text-sm font-bold text-ink">
            Drag and drop a `.tsx`, `.jsx`, or `.md` file here
          </h4>
          <p className="text-xs text-ink/70 font-sans mt-1">
            Auto-extracts name, dependencies, and styling.
          </p>
        </div>
      )}

      {/* Deduplication Alert Dialog Banner */}
      {dedupeResult?.isDuplicate && dedupeResult.matchedComponent && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-ink shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs font-display">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>
              {dedupeResult.matchType === 'exact'
                ? 'Exact duplicate code found!'
                : 'Duplicate slug match found!'}
            </span>
          </div>
          <p className="text-xs text-ink/80 font-sans">
            This component matches existing item{' '}
            <strong>"{dedupeResult.matchedComponent.name}"</strong> (
            <code>{dedupeResult.matchedComponent.id}</code>).
          </p>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                if (parsed) {
                  setParsed({ ...parsed, id: `${parsed.id}-user` });
                  setDedupeResult(null);
                }
              }}
              className="px-3 py-1 rounded-lg bg-orange text-forest text-xs font-display font-bold cursor-pointer"
            >
              Use Suffix Slug (-user)
            </button>
            <button
              type="button"
              onClick={() => setDedupeResult(null)}
              className="px-3 py-1 rounded-lg border border-ink/20 text-xs font-display cursor-pointer"
            >
              Overwrite Existing
            </button>
          </div>
        </div>
      )}

      {/* Split Pane: Left Code Editor, Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left: Code Input */}
        <div className="p-4 rounded-3xl bg-[var(--dialog-bg)] border border-[rgba(38,51,42,0.18)] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-display text-xs font-bold text-ink flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-orange" />
              <span>Component Source Code (TSX/JSX)</span>
            </span>
            {parsed && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-forest/10 text-forest font-bold">
                {parsed.styling} • {parsed.deps.length} deps
              </span>
            )}
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your React component source code here..."
            rows={18}
            className="w-full p-3.5 rounded-2xl bg-forest-dark text-cream font-mono text-xs leading-relaxed border border-forest/20 focus:outline-none focus:border-orange shadow-inner resize-y"
          />
        </div>

        {/* Right: Live Preview Sandbox */}
        <div className="p-4 rounded-3xl bg-[var(--dialog-bg)] border border-[rgba(38,51,42,0.18)] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-display text-xs font-bold text-ink flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Live Sandbox Preview</span>
            </span>
          </div>

          <div className="w-full min-h-[380px] bg-forest-dark rounded-2xl p-4 flex items-center justify-center overflow-auto shadow-inner">
            {parsed ? (
              <PreviewSandbox
                component={previewMeta}
                theme="light"
                isActive={true}
                showFallbackOnEvict={false}
              />
            ) : (
              <div className="text-center text-cream/40 text-xs font-sans">
                Paste or fetch component code on the left to see live preview.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metadata Form Underneath */}
      {parsed && (
        <div className="p-6 rounded-3xl bg-[var(--dialog-bg)] border border-[rgba(38,51,42,0.18)] shadow-xs space-y-4">
          <h3 className="font-display text-sm font-bold text-ink">Component Metadata</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-sans">
            {/* Display Name */}
            <div className="space-y-1">
              <label className="font-semibold text-ink/75 font-display">Display Name</label>
              <input
                type="text"
                value={parsed.name}
                onChange={(e) => {
                  const val = e.target.value;
                  setParsed({ ...parsed, name: val, id: slugify(val) });
                }}
                className="w-full px-3 py-2 rounded-xl border border-[rgba(38,51,42,0.18)] bg-white/70 focus:outline-none focus:border-orange font-bold text-ink"
              />
            </div>

            {/* Slug */}
            <div className="space-y-1">
              <label className="font-semibold text-ink/75 font-display">Slug ID</label>
              <input
                type="text"
                value={parsed.id}
                onChange={(e) => setParsed({ ...parsed, id: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[rgba(38,51,42,0.18)] bg-white/70 focus:outline-none focus:border-orange font-mono text-[11px] text-ink"
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="font-semibold text-ink/75 font-display">Category</label>
              <select
                value={parsed.category}
                onChange={(e) => setParsed({ ...parsed, category: e.target.value as Category })}
                className="w-full px-3 py-2 rounded-xl border border-[rgba(38,51,42,0.18)] bg-white/70 focus:outline-none focus:border-orange cursor-pointer text-ink font-display"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Styling */}
            <div className="space-y-1">
              <label className="font-semibold text-ink/75 font-display">Styling System</label>
              <select
                value={parsed.styling}
                onChange={(e) =>
                  setParsed({ ...parsed, styling: e.target.value as ParsedImportResult['styling'] })
                }
                className="w-full px-3 py-2 rounded-xl border border-[rgba(38,51,42,0.18)] bg-white/70 focus:outline-none focus:border-orange cursor-pointer text-ink font-mono text-xs"
              >
                <option value="tailwind">Tailwind</option>
                <option value="unstyled">Unstyled (Radix/Aria)</option>
                <option value="css-modules">CSS Modules</option>
                <option value="css-in-js">CSS-in-JS</option>
              </select>
            </div>
          </div>

          {/* License & Attribution */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans pt-2 border-t border-[rgba(38,51,42,0.08)]">
            <div className="space-y-1">
              <label className="font-semibold text-ink/75 font-display">License (SPDX)</label>
              <input
                type="text"
                value={parsed.license}
                onChange={(e) => setParsed({ ...parsed, license: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[rgba(38,51,42,0.18)] bg-white/70 font-mono text-xs focus:outline-none focus:border-orange text-ink"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-ink/75 font-display">Attribution Line</label>
              <input
                type="text"
                value={parsed.attribution}
                onChange={(e) => setParsed({ ...parsed, attribution: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[rgba(38,51,42,0.18)] bg-white/70 text-xs focus:outline-none focus:border-orange text-ink"
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[rgba(38,51,42,0.12)]">
            <button
              type="button"
              onClick={() => navigate('/app')}
              className="px-4 py-2 rounded-xl border border-[rgba(38,51,42,0.2)] text-ink font-display text-xs hover:border-orange cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSaveComponent}
              className="px-5 py-2.5 rounded-xl bg-orange hover:bg-orange-deep text-forest font-display text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Save Component to Library</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
