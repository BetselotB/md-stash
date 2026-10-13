import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useComponent } from '../hooks/useDb';
import { componentsRepo } from '../db/components.repo';
import { useUIStore } from '../../src/store/uiStore';
import { PreviewSandbox } from '../components/preview/PreviewSandbox';
import { CodeBlob, ComponentProp, PreviewStatus } from '../domain/componentTypes';
import { transpileToJs, getPreviewStatusInfo } from '../services/previewRuntime';
import {
  ArrowLeft,
  Pin,
  Copy,
  Sparkles,
  Download,
  Terminal,
  FileText,
  Sliders,
  Maximize2,
  Moon,
  Sun,
  RefreshCw,
  ExternalLink,
  Check,
  Plus,
  Box,
  Layers,
  Code as CodeIcon,
  HelpCircle,
  Clock,
  GitBranch,
} from 'lucide-react';

type TabKey =
  | 'preview'
  | 'code'
  | 'props'
  | 'prompt'
  | 'markdown'
  | 'install'
  | 'variants'
  | 'history';

type PromptMode = 'implement' | 'adapt' | 'compose' | 'convert' | 'review' | 'test';
type ModelPreset = 'claude' | 'gpt' | 'cursor' | 'v0';
type PackageManager = 'pnpm' | 'npm' | 'yarn' | 'bun';

export const ComponentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast, selectedComponentIds, toggleSelectComponent } = useUIStore();

  const component = useComponent(id);
  const isSelectedInKit = Boolean(component && selectedComponentIds.includes(component.id));
  const [blob, setBlob] = useState<CodeBlob | null>(null);
  const [loadingBlob, setLoadingBlob] = useState(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState<TabKey>('preview');

  // Preview Sandbox controls
  const [previewTheme, setPreviewTheme] = useState<'light' | 'dark'>('light');
  const [viewportWidth, setViewportWidth] = useState<'100%' | '390px' | '768px'>('100%');
  const [customProps, setCustomProps] = useState<Record<string, unknown>>({});

  // Code Tab controls
  const [codeLang, setCodeLang] = useState<'tsx' | 'js'>('tsx');
  const [importAlias, setImportAlias] = useState('@/lib/utils');

  // Prompt Builder controls
  const [promptMode, setPromptMode] = useState<PromptMode>('implement');
  const [modelPreset, setModelPreset] = useState<ModelPreset>('claude');
  const [projectBrief, setProjectBrief] = useState('');

  // Install Tab controls
  const [pkgManager, setPkgManager] = useState<PackageManager>('pnpm');

  // Copy feedback state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Load code blob from Dexie or fetch from registry
  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
      if (!id) return;
      try {
        setLoadingBlob(true);
        let data = await componentsRepo.getCodeBlob(id);

        if (!data) {
          const res = await fetch(`/r/${id}.json`);
          if (res.ok) {
            const item = await res.json();
            data = {
              id,
              code: item.files?.[0]?.content || '',
              props: [],
              deps: item.dependencies || [],
              dependsOn: item.registryDependencies || [],
              shared: ['utils/cn'],
            };
            await componentsRepo.putCodeBlob(data);
          }
        }

        if (!isCancelled) {
          setBlob(data || null);
          setLoadingBlob(false);
        }
      } catch (err) {
        console.error(err);
        if (!isCancelled) setLoadingBlob(false);
      }
    }

    loadData();
    return () => {
      isCancelled = true;
    };
  }, [id]);

  // Copy Helper with visual feedback
  const handleCopy = async (text: string, key: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      showToast(`Copied ${label}`, 'success');
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      showToast(`Failed to copy ${label}`, 'error');
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = async () => {
    if (!component) return;
    try {
      await componentsRepo.setFavorite(component.id, !component.favorite);
      showToast(
        component.favorite ? `Unpinned ${component.name}` : `Pinned ${component.name}`,
        'info'
      );
    } catch {
      showToast('Failed to update favorite', 'error');
    }
  };

  // Computed display code (TSX or compiled JS)
  const displayCode = useMemo(() => {
    if (!blob?.code) return '';
    let code = blob.code;

    // Apply import alias rewrite
    if (importAlias !== '@/lib/utils') {
      code = code.replace(/@\/lib\/utils/g, importAlias);
      code = code.replace(/utils\/cn/g, importAlias);
    }

    if (codeLang === 'js') {
      try {
        return transpileToJs(code);
      } catch {
        return code;
      }
    }

    return code;
  }, [blob?.code, codeLang, importAlias]);

  // Generated AI Prompt Text
  const promptOutput = useMemo(() => {
    if (!component) return '';
    const compName = component.name;
    const compId = component.id;
    const framework = component.framework;
    const styling = component.styling;

    if (modelPreset === 'claude') {
      switch (promptMode) {
        case 'implement':
          return `<task>
Add the "${compName}" component to my ${framework} project.
</task>

<component id="${compId}">
Category: ${component.category}
Styling: ${styling}
License: ${component.license} (${component.attribution})
Dependencies: ${component.requires.concat(blob?.deps || []).join(', ') || 'none'}

Source Code:
\`\`\`tsx
${blob?.code || ''}
\`\`\`
</component>

<implementation_rules>
1. Preserve existing Tailwind classes and props.
2. Use import alias "${importAlias}" for utilities.
3. Wire this component into my active view cleanly.
</implementation_rules>`;

        case 'adapt':
          return `<task>
Adapt the "${compName}" component to match my design system tokens.
</task>

<component id="${compId}">
${blob?.code || ''}
</component>

<instructions>
1. Replace generic Tailwind colors with project semantic tokens (e.g. bg-background, text-foreground, border-border).
2. Ensure full dark mode and accessibility (ARIA roles).
</instructions>`;

        case 'review':
          return `<task>
Perform an accessibility (a11y) and performance review of the "${compName}" component.
</task>

<component id="${compId}">
${blob?.code || ''}
</component>

<checklist>
- Keyboard navigation & focus visible rings
- Screen reader ARIA attributes
- React rendering performance and memoization
</checklist>`;

        case 'test':
          return `<task>
Write comprehensive Vitest and Testing Library unit tests for the "${compName}" component.
</task>

<component id="${compId}">
${blob?.code || ''}
</component>`;

        default:
          return `Please implement the "${compName}" component into my project:\n\n\`\`\`tsx\n${blob?.code || ''}\n\`\`\``;
      }
    } else {
      // Standard Markdown preset (GPT, Cursor, v0)
      return `### Task: Implement ${compName}\n\nPlease add this ${framework} component to my project using ${styling}.\n\n\`\`\`tsx\n${blob?.code || ''}\n\`\`\`\n\nAttribution: ${component.attribution}`;
    }
  }, [component, blob?.code, promptMode, modelPreset, importAlias]);

  // Estimated tokens
  const estimatedTokens = Math.round(promptOutput.length / 4);

  // Dynamic origin for CLI & Agent URLs
  const apiOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8787';

  // Prevent flash of Component Not Found while Dexie query resolves
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setHasLoadedOnce(true), 300);
    return () => clearTimeout(timer);
  }, [id]);

  if (!component && !hasLoadedOnce) {
    return (
      <div className="py-24 text-center space-y-3 animate-fadeIn">
        <div className="w-8 h-8 mx-auto rounded-full border-2 border-orange/20 border-t-orange animate-spin" />
        <p className="text-xs text-cream/70 font-sans">Opening component crate...</p>
      </div>
    );
  }

  if (!component) {
    return (
      <div className="py-24 text-center space-y-4">
        <h2 className="font-display text-2xl text-cream font-bold">Component Not Found</h2>
        <p className="text-xs text-cream/70 font-sans">
          The requested component "{id}" does not exist in the stash.
        </p>
        <Link
          to="/app"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange text-forest font-display text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Gallery</span>
        </Link>
      </div>
    );
  }

  const statusInfo = getPreviewStatusInfo(component.previewStatus);

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-16">
      {/* Top Navigation Breadcrumbs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/app')}
            className="p-2 rounded-xl bg-[var(--dialog-bg)] border border-[rgba(38,51,42,0.18)] hover:border-orange text-ink transition-colors cursor-pointer shadow-xs"
            title="Back to gallery"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 text-xs font-display">
            <Link to="/app" className="text-cream/70 hover:text-orange transition-colors">
              Gallery
            </Link>
            <span className="text-cream/40">/</span>
            <Link
              to={`/app?cat=${component.category}`}
              className="text-cream/70 hover:text-orange transition-colors capitalize"
            >
              {component.category.replace(/-/g, ' ')}
            </Link>
            <span className="text-cream/40">/</span>
            <span className="text-cream font-bold">{component.name.trim()}</span>
          </div>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold border backdrop-blur-md ${statusInfo.badgeClass}`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                component.previewStatus === 'ready'
                  ? 'bg-emerald-400'
                  : component.previewStatus === 'needs-demo'
                  ? 'bg-amber-400'
                  : component.previewStatus === 'primitive'
                  ? 'bg-sky-400'
                  : 'bg-rose-400'
              }`}
            />
            <span>{statusInfo.label}</span>
          </span>
        </div>
      </div>

      {/* Main Grid: Left 2/3 Main View, Right 1/3 Sticky Rail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2/3 Main View */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tabs Navigation Strip */}
          <div className="flex items-center gap-1 overflow-x-auto p-1.5 rounded-2xl bg-[var(--dialog-bg)] border border-[rgba(38,51,42,0.18)] shadow-xs scrollbar-none">
            {(
              [
                { key: 'preview', label: 'Preview', icon: Maximize2 },
                { key: 'code', label: 'Code', icon: CodeIcon },
                { key: 'props', label: 'Props', icon: Sliders },
                { key: 'prompt', label: 'Prompt', icon: Sparkles },
                { key: 'markdown', label: 'Markdown', icon: FileText },
                { key: 'install', label: 'Install', icon: Terminal },
                { key: 'variants', label: 'Variants', icon: GitBranch },
                { key: 'history', label: 'History', icon: Clock },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 xl:px-3.5 py-1.5 rounded-xl font-display text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-forest text-cream shadow-xs ring-1 ring-forest/20'
                      : 'text-ink/75 hover:bg-[rgba(38,51,42,0.08)] hover:text-ink'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: PREVIEW */}
          {activeTab === 'preview' && (
            <div className="space-y-4">
              {/* Preview Well Card */}
              <div className="p-4 rounded-3xl bg-[var(--dialog-bg)] border border-[rgba(38,51,42,0.18)] shadow-xs space-y-4">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[rgba(38,51,42,0.12)]">
                  {/* Viewport size buttons */}
                  <div className="flex items-center gap-1 bg-[rgba(38,51,42,0.06)] p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setViewportWidth('390px')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-display transition-all cursor-pointer ${
                        viewportWidth === '390px'
                          ? 'bg-forest text-cream font-bold shadow-xs'
                          : 'text-ink/70 hover:text-ink'
                      }`}
                    >
                      Mobile (390)
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewportWidth('768px')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-display transition-all cursor-pointer ${
                        viewportWidth === '768px'
                          ? 'bg-forest text-cream font-bold shadow-xs'
                          : 'text-ink/70 hover:text-ink'
                      }`}
                    >
                      Tablet (768)
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewportWidth('100%')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-display transition-all cursor-pointer ${
                        viewportWidth === '100%'
                          ? 'bg-forest text-cream font-bold shadow-xs'
                          : 'text-ink/70 hover:text-ink'
                      }`}
                    >
                      Desktop (100%)
                    </button>
                  </div>

                  {/* Theme toggle & Reload */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewTheme(previewTheme === 'light' ? 'dark' : 'light')}
                      className="p-1.5 rounded-xl border border-[rgba(38,51,42,0.18)] bg-[rgba(248,247,230,0.5)] hover:border-orange text-ink transition-colors cursor-pointer"
                      title="Toggle light/dark sandbox theme"
                    >
                      {previewTheme === 'light' ? (
                        <Moon className="w-4 h-4 text-forest" />
                      ) : (
                        <Sun className="w-4 h-4 text-amber-500" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        showToast('Reloaded sandbox runtime', 'info');
                      }}
                      className="p-1.5 rounded-xl border border-[rgba(38,51,42,0.18)] bg-[rgba(248,247,230,0.5)] hover:border-orange text-ink transition-colors cursor-pointer"
                      title="Reload sandbox"
                    >
                      <RefreshCw className="w-4 h-4 text-forest" />
                    </button>
                  </div>
                </div>

                {/* Recessed Sandbox Well */}
                <div className="w-full min-h-[380px] bg-forest-dark rounded-2xl p-4 flex items-center justify-center overflow-auto shadow-inner">
                  <PreviewSandbox
                    component={component}
                    theme={previewTheme}
                    customProps={customProps}
                    viewportWidth={viewportWidth}
                    isActive={true}
                  />
                </div>
              </div>

              {/* Props Playground (if props defined) */}
              {blob?.props && blob.props.length > 0 && (
                <div className="p-4 rounded-3xl bg-[var(--dialog-bg)] border border-[rgba(38,51,42,0.18)] shadow-xs space-y-3">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-orange" />
                    <h3 className="font-display text-sm font-bold text-ink">Props Playground</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {blob.props.map((p) => {
                      const val = customProps[p.name];
                      const isBool = p.type.toLowerCase().includes('boolean');
                      return (
                        <div
                          key={p.name}
                          className="p-3 rounded-xl bg-[rgba(248,247,230,0.45)] border border-[rgba(38,51,42,0.12)] space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono font-bold text-ink">{p.name}</span>
                            <span className="text-[10px] font-mono text-ink/60">{p.type}</span>
                          </div>

                          {isBool ? (
                            <label className="flex items-center gap-2 cursor-pointer text-xs font-sans text-ink">
                              <input
                                type="checkbox"
                                checked={Boolean(val)}
                                onChange={(e) =>
                                  setCustomProps((prev) => ({
                                    ...prev,
                                    [p.name]: e.target.checked,
                                  }))
                                }
                                className="rounded text-orange focus:ring-orange"
                              />
                              <span>Enabled</span>
                            </label>
                          ) : (
                            <input
                              type="text"
                              value={String(val || '')}
                              placeholder={p.default || 'value'}
                              onChange={(e) =>
                                setCustomProps((prev) => ({
                                  ...prev,
                                  [p.name]: e.target.value,
                                }))
                              }
                              className="w-full px-2.5 py-1.5 rounded-lg border border-[rgba(38,51,42,0.18)] text-xs font-sans text-ink bg-white/70 focus:outline-none focus:border-orange"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CODE */}
          {activeTab === 'code' && (
            <div className="p-4 rounded-3xl bg-[var(--dialog-bg)] border border-[rgba(38,51,42,0.18)] shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[rgba(38,51,42,0.12)]">
                <div className="flex items-center gap-2">
                  {/* TSX / JS Toggle */}
                  <div className="flex items-center gap-1 bg-[rgba(38,51,42,0.06)] p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setCodeLang('tsx')}
                      className={`px-3 py-1 rounded-lg text-xs font-display transition-all cursor-pointer ${
                        codeLang === 'tsx' ? 'bg-forest text-cream font-bold' : 'text-ink/70'
                      }`}
                    >
                      TypeScript (TSX)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCodeLang('js')}
                      className={`px-3 py-1 rounded-lg text-xs font-display transition-all cursor-pointer ${
                        codeLang === 'js' ? 'bg-forest text-cream font-bold' : 'text-ink/70'
                      }`}
                    >
                      JavaScript (JSX)
                    </button>
                  </div>

                  {/* Import alias input */}
                  <div className="flex items-center gap-1.5 text-xs font-sans text-ink/75">
                    <span className="font-mono text-[11px]">Alias:</span>
                    <input
                      type="text"
                      value={importAlias}
                      onChange={(e) => setImportAlias(e.target.value)}
                      className="px-2 py-1 rounded-lg border border-[rgba(38,51,42,0.18)] bg-[rgba(248,247,230,0.5)] font-mono text-[11px] w-28 focus:outline-none focus:border-orange"
                    />
                  </div>
                </div>

                {/* Copy button */}
                <button
                  type="button"
                  onClick={() => handleCopy(displayCode, 'code_tab', 'code')}
                  className="px-3.5 py-1.5 rounded-xl bg-orange hover:bg-orange-deep text-forest font-display text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  {copiedKey === 'code_tab' ? (
                    <Check className="w-3.5 h-3.5 text-forest" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedKey === 'code_tab' ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>

              {/* Code Pre Block */}
              <div className="relative rounded-2xl bg-forest-dark p-4 overflow-x-auto shadow-inner text-cream">
                <pre className="font-mono text-xs leading-relaxed">
                  <code>{displayCode || '// Loading component code...'}</code>
                </pre>
              </div>

              {/* Dependency Closure View */}
              {blob && (
                <div className="p-3.5 rounded-2xl bg-[rgba(38,51,42,0.06)] border border-[rgba(38,51,42,0.1)] space-y-2">
                  <h4 className="text-xs font-display font-bold text-ink">Dependency Closure</h4>
                  <div className="flex flex-wrap gap-2 text-xs font-mono">
                    <span className="px-2 py-0.5 rounded bg-cream border border-forest/15 text-forest">
                      npm: {blob.deps.join(', ') || 'none'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-cream border border-forest/15 text-forest">
                      shared: {blob.shared.join(', ') || 'none'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROPS */}
          {activeTab === 'props' && (
            <div className="p-4 rounded-3xl bg-[var(--dialog-bg)] border border-[rgba(38,51,42,0.18)] shadow-xs space-y-4">
              <h3 className="font-display text-sm font-bold text-ink">Extracted TypeScript Props</h3>
              {blob?.props && blob.props.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead>
                      <tr className="border-b border-[rgba(38,51,42,0.18)] font-display text-ink/70">
                        <th className="pb-2">Prop</th>
                        <th className="pb-2">Type</th>
                        <th className="pb-2">Default</th>
                        <th className="pb-2">Required</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(38,51,42,0.08)]">
                      {blob.props.map((p) => (
                        <tr key={p.name} className="hover:bg-[rgba(38,51,42,0.04)]">
                          <td className="py-2.5 font-mono font-bold text-ink">{p.name}</td>
                          <td className="py-2.5 font-mono text-forest">{p.type}</td>
                          <td className="py-2.5 font-mono text-ink/75">{p.default || '—'}</td>
                          <td className="py-2.5">
                            {p.required ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-rose-500/10 text-rose-700 font-bold">
                                Required
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono text-ink/50">Optional</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-ink/60 font-sans italic">
                  No explicit TypeScript props interface found for this component.
                </p>
              )}
            </div>
          )}

          {/* TAB 4: PROMPT BUILDER */}
          {activeTab === 'prompt' && (
            <div className="p-4 rounded-3xl bg-[var(--dialog-bg)] border border-[rgba(38,51,42,0.18)] shadow-xs space-y-4">
              {/* Task Mode Selector */}
              <div className="flex flex-wrap items-center gap-1.5 pb-3 border-b border-[rgba(38,51,42,0.12)]">
                {(
                  [
                    { key: 'implement', label: '1. Implement' },
                    { key: 'adapt', label: '2. Adapt Tokens' },
                    { key: 'review', label: '3. A11y / Review' },
                    { key: 'test', label: '4. Unit Tests' },
                  ] as const
                ).map((mode) => (
                  <button
                    key={mode.key}
                    type="button"
                    onClick={() => setPromptMode(mode.key)}
                    className={`px-3 py-1.5 rounded-xl font-display text-xs transition-all cursor-pointer ${
                      promptMode === mode.key
                        ? 'bg-forest text-cream font-bold'
                        : 'bg-[rgba(38,51,42,0.06)] text-ink/75 hover:bg-[rgba(38,51,42,0.12)]'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              {/* Model Preset and Token Estimate */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-display text-ink font-semibold">Format:</span>
                  <select
                    value={modelPreset}
                    onChange={(e) => setModelPreset(e.target.value as ModelPreset)}
                    className="px-2.5 py-1 rounded-lg border border-[rgba(38,51,42,0.18)] bg-[rgba(248,247,230,0.5)] font-display text-xs cursor-pointer focus:outline-none focus:border-orange"
                  >
                    <option value="claude">Claude (XML tags)</option>
                    <option value="gpt">GPT / Markdown</option>
                    <option value="cursor">Cursor rules</option>
                    <option value="v0">v0 generator</option>
                  </select>
                </div>

                <div className="font-mono text-[11px] text-ink/70">
                  Estimated tokens: ~{estimatedTokens.toLocaleString()}
                </div>
              </div>

              {/* Prompt Output Code Box */}
              <div className="relative rounded-2xl bg-forest-dark p-4 overflow-x-auto shadow-inner text-cream">
                <pre className="font-mono text-xs leading-relaxed whitespace-pre-wrap">
                  <code>{promptOutput}</code>
                </pre>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => handleCopy(promptOutput, 'prompt_tab', 'AI prompt')}
                  className="px-4 py-2 rounded-xl bg-orange hover:bg-orange-deep text-forest font-display text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  {copiedKey === 'prompt_tab' ? (
                    <Check className="w-4 h-4 text-forest" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>{copiedKey === 'prompt_tab' ? 'Copied Prompt!' : 'Copy AI Prompt'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: MARKDOWN */}
          {activeTab === 'markdown' && (
            <div className="p-4 rounded-3xl bg-[var(--dialog-bg)] border border-[rgba(38,51,42,0.18)] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-bold text-ink">Raw Component Markdown</h3>
                <button
                  type="button"
                  onClick={() => handleCopy(blob?.code || '', 'md_tab', 'markdown')}
                  className="px-3 py-1.5 rounded-xl border border-[rgba(38,51,42,0.18)] text-ink font-display text-xs flex items-center gap-1.5 hover:border-orange cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Markdown</span>
                </button>
              </div>
              <div className="p-4 rounded-2xl bg-forest-dark text-cream font-mono text-xs overflow-x-auto">
                <pre>
                  <code>{`---
id: ${component.id}
name: ${component.name}
category: ${component.category}
styling: ${component.styling}
license: ${component.license}
---

# ${component.name}

${component.description}

\`\`\`tsx
${blob?.code || ''}
\`\`\``}</code>
                </pre>
              </div>
            </div>
          )}

          {/* TAB 6: INSTALL */}
          {activeTab === 'install' && (
            <div className="p-4 rounded-3xl bg-[var(--dialog-bg)] border border-[rgba(38,51,42,0.18)] shadow-xs space-y-4">
              <h3 className="font-display text-sm font-bold text-ink">Installation Commands</h3>

              {/* Package Manager Selector */}
              <div className="flex items-center gap-1 bg-[rgba(38,51,42,0.06)] p-1 rounded-xl w-fit">
                {(['pnpm', 'npm', 'yarn', 'bun'] as const).map((pm) => (
                  <button
                    key={pm}
                    type="button"
                    onClick={() => setPkgManager(pm)}
                    className={`px-3 py-1 rounded-lg text-xs font-display transition-all cursor-pointer ${
                      pkgManager === pm ? 'bg-forest text-cream font-bold' : 'text-ink/70'
                    }`}
                  >
                    {pm}
                  </button>
                ))}
              </div>

              {/* Shadcn CLI Command */}
              <div className="space-y-1.5">
                <span className="text-xs font-display text-ink/75 font-semibold">
                  Via Shadcn Registry CLI:
                </span>
                <div className="flex items-center justify-between p-3 rounded-xl bg-forest-dark text-cream font-mono text-xs">
                  <span>
                    npx shadcn@latest add {apiOrigin}/r/{component.id}.json
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        `npx shadcn@latest add ${apiOrigin}/r/${component.id}.json`,
                        'shadcn_cli',
                        'command'
                      )
                    }
                    className="p-1 text-cream/70 hover:text-orange cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* NPM Deps command */}
              {blob && blob.deps.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-display text-ink/75 font-semibold">
                    Direct NPM Dependencies:
                  </span>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-forest-dark text-cream font-mono text-xs">
                    <span>
                      {pkgManager === 'npm'
                        ? `npm i ${blob.deps.join(' ')}`
                        : `${pkgManager} add ${blob.deps.join(' ')}`}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          pkgManager === 'npm'
                            ? `npm i ${blob.deps.join(' ')}`
                            : `${pkgManager} add ${blob.deps.join(' ')}`,
                          'npm_deps',
                          'dependencies'
                        )
                      }
                      className="p-1 text-cream/70 hover:text-orange cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: VARIANTS */}
          {activeTab === 'variants' && (
            <div className="p-4 rounded-3xl bg-[var(--dialog-bg)] border border-[rgba(38,51,42,0.18)] shadow-xs space-y-3">
              <h3 className="font-display text-sm font-bold text-ink">Corpus Variants</h3>
              <p className="text-xs text-ink/70 font-sans">
                This is the primary canonical implementation from{' '}
                <strong className="text-ink">{component.source}</strong>. No divergent variants
                detected.
              </p>
            </div>
          )}

          {/* TAB 8: HISTORY */}
          {activeTab === 'history' && (
            <div className="p-4 rounded-3xl bg-[var(--dialog-bg)] border border-[rgba(38,51,42,0.18)] shadow-xs space-y-3">
              <h3 className="font-display text-sm font-bold text-ink">Version History</h3>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[rgba(38,51,42,0.06)] text-xs font-sans">
                <div>
                  <span className="font-bold text-ink">v1.0 (Harvested)</span>
                  <p className="text-[11px] text-ink/60">
                    Compiled into catalog on {new Date(component.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-forest/15 text-forest font-bold">
                  Active
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right 1/3 Sticky Rail */}
        <div className="space-y-4 sticky top-6">
          {/* Quick Copy Action Stack Card */}
          <div className="p-4 rounded-3xl bg-[var(--dialog-bg)] border border-[rgba(38,51,42,0.18)] shadow-xs space-y-3">
            <h3 className="font-display text-sm font-bold text-ink">Quick Actions</h3>

            {/* Big Primary Copy Code Button */}
            <button
              type="button"
              onClick={() => handleCopy(displayCode, 'primary_copy', 'code')}
              className="w-full py-3 px-4 rounded-2xl bg-orange hover:bg-orange-deep text-forest font-display text-sm font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {copiedKey === 'primary_copy' ? (
                <Check className="w-4 h-4 text-forest stroke-[2.5]" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              <span>{copiedKey === 'primary_copy' ? 'Copied Code!' : 'Copy Code'}</span>
            </button>

            {/* Secondary Copy Stack */}
            <div className="space-y-1.5 pt-1">
              <button
                type="button"
                onClick={() => handleCopy(promptOutput, 'rail_prompt', 'AI prompt')}
                className="w-full py-2 px-3 rounded-xl border border-[rgba(38,51,42,0.18)] hover:border-orange bg-[rgba(248,247,230,0.4)] text-ink font-display text-xs flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Copy AI Prompt</span>
                </div>
                {copiedKey === 'rail_prompt' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
              </button>

              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    `${apiOrigin}/c/${component.id}.md`,
                    'rail_agent_link',
                    'Agent link'
                  )
                }
                className="w-full py-2 px-3 rounded-xl border border-[rgba(38,51,42,0.18)] hover:border-orange bg-[rgba(248,247,230,0.4)] text-ink font-display text-xs flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-3.5 h-3.5 text-forest" />
                  <span>Copy Agent Link</span>
                </div>
                {copiedKey === 'rail_agent_link' && (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    `${apiOrigin}/r/${component.id}.json`,
                    'rail_shadcn',
                    'Shadcn registry URL'
                  )
                }
                className="w-full py-2 px-3 rounded-xl border border-[rgba(38,51,42,0.18)] hover:border-orange bg-[rgba(248,247,230,0.4)] text-ink font-display text-xs flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-forest" />
                  <span>Copy Shadcn URL</span>
                </div>
                {copiedKey === 'rail_shadcn' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
              </button>
            </div>

            {/* Pin and Add to Kit Buttons */}
            <div className="flex items-center gap-2 pt-2 border-t border-[rgba(38,51,42,0.12)]">
              <button
                type="button"
                onClick={handleToggleFavorite}
                className={`flex-1 py-2 px-3 rounded-xl border font-display text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  component.favorite
                    ? 'bg-orange border-orange text-forest font-bold shadow-xs'
                    : 'border-[rgba(38,51,42,0.2)] text-ink hover:border-orange'
                }`}
              >
                <Pin className={`w-3.5 h-3.5 ${component.favorite ? 'fill-forest' : ''}`} />
                <span>{component.favorite ? 'Pinned' : 'Pin to Favs'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  toggleSelectComponent(component.id);
                  showToast(
                    isSelectedInKit
                      ? `Removed ${component.name} from kit`
                      : `Added ${component.name} to kit tray`,
                    'info'
                  );
                }}
                className={`flex-1 py-2 px-3 rounded-xl border font-display text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isSelectedInKit
                    ? 'bg-orange border-orange text-forest font-bold shadow-xs'
                    : 'border-[rgba(38,51,42,0.2)] hover:border-orange text-ink'
                }`}
              >
                {isSelectedInKit ? (
                  <Check className="w-3.5 h-3.5 text-forest" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                <span>{isSelectedInKit ? 'In Kit' : 'Add to Kit'}</span>
              </button>
            </div>
          </div>

          {/* Component Metadata Card */}
          <div className="p-4 rounded-3xl bg-[var(--dialog-bg)] border border-[rgba(38,51,42,0.18)] shadow-xs space-y-3 text-xs text-ink">
            <h3 className="font-display font-bold text-ink">Metadata & Licensing</h3>

            <div className="space-y-2 divide-y divide-[rgba(38,51,42,0.08)]">
              <div className="flex items-center justify-between pt-1">
                <span className="text-ink/65 font-sans">Source</span>
                <span className="font-semibold text-ink">{component.source}</span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-ink/65 font-sans">License</span>
                <span className="font-mono font-bold text-forest">{component.license}</span>
              </div>

              <div className="flex flex-col pt-2 gap-1">
                <span className="text-ink/65 font-sans">Attribution</span>
                <span className="font-sans text-[11px] text-ink/80 leading-relaxed bg-[rgba(38,51,42,0.06)] p-2 rounded-xl">
                  {component.attribution}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-ink/65 font-sans">Styling</span>
                <span className="font-mono text-[11px] text-ink">{component.styling}</span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-ink/65 font-sans">Framework</span>
                <span className="font-mono text-[11px] text-ink">{component.framework}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
