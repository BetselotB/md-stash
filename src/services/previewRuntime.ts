import { transform } from 'sucrase';
import { ComponentMetadata, CodeBlob, ComponentProp, PreviewStatus } from '../domain/componentTypes';

// Pinned React 18 & common helper versions from esm.sh
export const PINNED_VERSIONS = {
  react: '18.3.1',
  'react-dom': '18.3.1',
  'lucide-react': '0.475.0',
  'clsx': '2.1.1',
  'tailwind-merge': '3.0.1',
  'class-variance-authority': '0.7.1',
  'framer-motion': '11.18.2',
};

export interface PreviewOptions {
  theme?: 'light' | 'dark';
  props?: Record<string, unknown>;
  viewportWidth?: number;
}

/**
 * 4-Iframe LRU Unmount Manager
 * Strictly enforces that no more than 4 sandbox iframes remain mounted in the DOM.
 */
class IframeLRUManager {
  private activeSlots = new Map<string, { onEvict: () => void; lastActive: number }>();
  private readonly MAX_CONCURRENT = 4;

  public requestSlot(id: string, onEvict: () => void): boolean {
    // If already active, refresh timestamp
    if (this.activeSlots.has(id)) {
      const existing = this.activeSlots.get(id)!;
      existing.lastActive = Date.now();
      return true;
    }

    // If at capacity, evict the least recently used
    if (this.activeSlots.size >= this.MAX_CONCURRENT) {
      let oldestId: string | null = null;
      let oldestTime = Infinity;

      for (const [slotId, slot] of this.activeSlots.entries()) {
        if (slot.lastActive < oldestTime) {
          oldestTime = slot.lastActive;
          oldestId = slotId;
        }
      }

      if (oldestId) {
        const evicted = this.activeSlots.get(oldestId);
        this.activeSlots.delete(oldestId);
        evicted?.onEvict();
      }
    }

    this.activeSlots.set(id, { onEvict, lastActive: Date.now() });
    return true;
  }

  public releaseSlot(id: string): void {
    this.activeSlots.delete(id);
  }

  public getActiveCount(): number {
    return this.activeSlots.size;
  }

  public isSlotActive(id: string): boolean {
    return this.activeSlots.has(id);
  }

  public clear(): void {
    for (const [, slot] of this.activeSlots.entries()) {
      slot.onEvict();
    }
    this.activeSlots.clear();
  }
}

export const iframeLRU = new IframeLRUManager();

/**
 * Extract external import specifiers from code
 */
export function extractImportSpecifiers(code: string): string[] {
  const specifiers = new Set<string>();
  const importRegex = /(?:import|export)\s+(?:[\s\S]*?from\s+)?['"]([^'"]+)['"]/g;
  let match: RegExpExecArray | null;

  while ((match = importRegex.exec(code)) !== null) {
    const spec = match[1].trim();
    if (
      !spec.startsWith('.') &&
      !spec.startsWith('/') &&
      !spec.startsWith('@/') &&
      !spec.startsWith('utils/')
    ) {
      specifiers.add(spec);
    }
  }

  return Array.from(specifiers);
}

/**
 * Builds the browser dynamic Import Map for sandboxed iframe
 */
export function buildImportMap(extraDeps: string[] = []): Record<string, string> {
  const imports: Record<string, string> = {
    react: `https://esm.sh/react@${PINNED_VERSIONS.react}`,
    'react-dom': `https://esm.sh/react-dom@${PINNED_VERSIONS['react-dom']}`,
    'react-dom/client': `https://esm.sh/react-dom@${PINNED_VERSIONS['react-dom']}/client`,
    'react/jsx-runtime': `https://esm.sh/react@${PINNED_VERSIONS.react}/jsx-runtime`,
    'clsx': `https://esm.sh/clsx@${PINNED_VERSIONS.clsx}`,
    'tailwind-merge': `https://esm.sh/tailwind-merge@${PINNED_VERSIONS['tailwind-merge']}`,
    'class-variance-authority': `https://esm.sh/class-variance-authority@${PINNED_VERSIONS['class-variance-authority']}`,
    'lucide-react': `https://esm.sh/lucide-react@${PINNED_VERSIONS['lucide-react']}?external=react`,
    'framer-motion': `https://esm.sh/framer-motion@${PINNED_VERSIONS['framer-motion']}?external=react,react-dom`,
  };

  // cn helper module data URL
  const cnModule = `
import { clsx } from "https://esm.sh/clsx@${PINNED_VERSIONS.clsx}";
import { twMerge } from "https://esm.sh/tailwind-merge@${PINNED_VERSIONS['tailwind-merge']}";
export function cn(...inputs) { return twMerge(clsx(inputs)); }
export default cn;
  `.trim();

  const cnDataUrl = `data:text/javascript;charset=utf-8,${encodeURIComponent(cnModule)}`;
  imports['@/lib/utils'] = cnDataUrl;
  imports['utils/cn'] = cnDataUrl;
  imports['@/utils'] = cnDataUrl;

  // Add any extra dependencies with pinned or external react mapping
  for (const dep of extraDeps) {
    if (!imports[dep]) {
      imports[dep] = `https://esm.sh/${dep}?external=react,react-dom`;
    }
  }

  return imports;
}

/**
 * Synthesizes default props from Prop[] definitions
 */
export function synthesizeDefaultProps(props: ComponentProp[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const prop of props) {
    if (prop.default !== undefined) {
      try {
        // Attempt basic parsing if boolean/number/string
        if (prop.default === 'true') result[prop.name] = true;
        else if (prop.default === 'false') result[prop.name] = false;
        else if (!isNaN(Number(prop.default))) result[prop.name] = Number(prop.default);
        else result[prop.name] = prop.default.replace(/^['"]|['"]$/g, '');
        continue;
      } catch {
        // Fallback to type synthesis
      }
    }

    const t = (prop.type || '').toLowerCase();
    if (t.includes('[]') || t.includes('array')) {
      result[prop.name] = ['Item 1', 'Item 2', 'Item 3'];
    } else if (t.includes('boolean')) {
      result[prop.name] = false;
    } else if (t.includes('number')) {
      result[prop.name] = 0;
    } else if (t.includes('string')) {
      if (
        prop.name.toLowerCase().includes('text') ||
        prop.name.toLowerCase().includes('label') ||
        prop.name.toLowerCase().includes('title')
      ) {
        result[prop.name] = prop.name.charAt(0).toUpperCase() + prop.name.slice(1);
      } else {
        result[prop.name] = 'Sample';
      }
    } else if (t.includes('func') || t.includes('=>')) {
      result[prop.name] = () => {};
    }
  }

  return result;
}

/**
 * Neutral shadcn token stylesheet + Tailwind browser config
 */
export const NEUTRAL_SHADCN_TOKENS_CSS = `
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  --primary-foreground: 0 0% 98%;
  --secondary: 240 4.8% 95.9%;
  --secondary-foreground: 240 5.9% 10%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  --accent: 240 4.8% 95.9%;
  --accent-foreground: 240 5.9% 10%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 5.9% 90%;
  --input: 240 5.9% 90%;
  --ring: 240 5.9% 10%;
  --radius: 0.5rem;
}

.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --card: 240 10% 3.9%;
  --card-foreground: 0 0% 98%;
  --popover: 240 10% 3.9%;
  --popover-foreground: 0 0% 98%;
  --primary: 0 0% 98%;
  --primary-foreground: 240 5.9% 10%;
  --secondary: 240 3.7% 15.9%;
  --secondary-foreground: 0 0% 98%;
  --muted: 240 3.7% 15.9%;
  --muted-foreground: 240 5% 64.9%;
  --accent: 240 3.7% 15.9%;
  --accent-foreground: 0 0% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 3.7% 15.9%;
  --input: 240 3.7% 15.9%;
  --ring: 240 4.9% 83.9%;
}

* {
  border-color: hsl(var(--border));
}

body {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  margin: 0;
  padding: 1.5rem;
  min-height: 100vh;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}
`;

/**
 * Transpiles TSX/JSX code to pure ES module JS with Sucrase
 */
export function transpileToJs(code: string): string {
  try {
    const res = transform(code, {
      transforms: ['typescript', 'jsx'],
      jsxRuntime: 'classic', // Generates React.createElement
      production: true,
    });
    return res.code;
  } catch (err) {
    console.error('Sucrase transpilation error:', err);
    throw err;
  }
}

/**
 * Generates the full sandboxed HTML document string ready for iframe srcDoc
 */
export function generateSandboxHtml(
  component: ComponentMetadata,
  blob: CodeBlob,
  options: PreviewOptions = {}
): string {
  const theme = options.theme || 'light';
  const customProps = options.props || {};

  // Extract all imported specifiers from component and usage
  const specifiers = [
    ...extractImportSpecifiers(blob.code),
    ...(blob.usage ? extractImportSpecifiers(blob.usage) : []),
    ...(blob.deps || []),
  ];

  const importMap = buildImportMap(specifiers);
  const transpiledComponent = transpileToJs(blob.code);

  // Encode component as inline JS data URI module
  const componentModuleDataUrl = `data:text/javascript;charset=utf-8,${encodeURIComponent(
    transpiledComponent
  )}`;

  // Determine rendering entry script
  let entryScript: string;

  if (blob.usage && blob.usage.trim().length > 0) {
    // Transpile usage example
    let cleanedUsage = blob.usage;
    // Replace relative import of component with component module data URL
    cleanedUsage = cleanedUsage.replace(
      /from\s+['"]\.\/.*?['"]/g,
      `from "${componentModuleDataUrl}"`
    );
    cleanedUsage = cleanedUsage.replace(
      /from\s+['"]@\/components\/.*?['"]/g,
      `from "${componentModuleDataUrl}"`
    );

    const transpiledUsage = transpileToJs(cleanedUsage);

    entryScript = `
import React from 'react';
import ReactDOM from 'react-dom/client';
window.React = React;

${transpiledUsage}

// Check for default or exported component in usage
const DemoComponent = typeof App !== 'undefined' ? App :
                      typeof Demo !== 'undefined' ? Demo :
                      typeof Example !== 'undefined' ? Example :
                      null;

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  if (DemoComponent) {
    root.render(React.createElement(DemoComponent));
    window.__PREVIEW_MOUNTED__ = true;
    window.parent.postMessage({ type: 'PREVIEW_READY' }, '*');
  } else {
    // If usage had inline JSX render statement or top-level expression
    window.__PREVIEW_MOUNTED__ = true;
    window.parent.postMessage({ type: 'PREVIEW_READY' }, '*');
  }
}
    `;
  } else {
    // Auto-props synthesis
    const defaultProps = {
      ...synthesizeDefaultProps(blob.props || []),
      ...customProps,
    };

    entryScript = `
import React from 'react';
import ReactDOM from 'react-dom/client';
import * as CompModule from "${componentModuleDataUrl}";
window.React = React;

// Find exported component
const Target = CompModule.default || 
  Object.values(CompModule).find(val => typeof val === 'function' && /^[A-Z]/.test(val.name || ''));

const rootEl = document.getElementById('root');
if (rootEl && Target) {
  const root = ReactDOM.createRoot(rootEl);
  const props = ${JSON.stringify(defaultProps)};
  
  // Render with synthesized props
  root.render(
    React.createElement(Target, props, props.children || "${component.name}")
  );
  window.__PREVIEW_MOUNTED__ = true;
  window.parent.postMessage({ type: 'PREVIEW_READY' }, '*');
} else if (rootEl) {
  rootEl.innerHTML = '<div style="color: #888; font-size: 13px;">No exported React component found.</div>';
  window.parent.postMessage({ type: 'PREVIEW_ERROR', error: 'No exported component' }, '*');
}
    `;
  }

  return `<!DOCTYPE html>
<html lang="en" class="${theme}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${component.name} Preview</title>
  
  <!-- Neutral Shadcn Design Tokens -->
  <style>${NEUTRAL_SHADCN_TOKENS_CSS}</style>

  <!-- Tailwind CSS browser runtime -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            border: 'hsl(var(--border))',
            input: 'hsl(var(--input))',
            ring: 'hsl(var(--ring))',
            background: 'hsl(var(--background))',
            foreground: 'hsl(var(--foreground))',
            primary: {
              DEFAULT: 'hsl(var(--primary))',
              foreground: 'hsl(var(--primary-foreground))'
            },
            secondary: {
              DEFAULT: 'hsl(var(--secondary))',
              foreground: 'hsl(var(--secondary-foreground))'
            },
            destructive: {
              DEFAULT: 'hsl(var(--destructive))',
              foreground: 'hsl(var(--destructive-foreground))'
            },
            muted: {
              DEFAULT: 'hsl(var(--muted))',
              foreground: 'hsl(var(--muted-foreground))'
            },
            accent: {
              DEFAULT: 'hsl(var(--accent))',
              foreground: 'hsl(var(--accent-foreground))'
            },
            popover: {
              DEFAULT: 'hsl(var(--popover))',
              foreground: 'hsl(var(--popover-foreground))'
            },
            card: {
              DEFAULT: 'hsl(var(--card))',
              foreground: 'hsl(var(--card-foreground))'
            }
          },
          borderRadius: {
            lg: 'var(--radius)',
            md: 'calc(var(--radius) - 2px)',
            sm: 'calc(var(--radius) - 4px)'
          }
        }
      }
    };
  </script>

  <!-- Dynamic Import Map -->
  <script type="importmap">
    ${JSON.stringify({ imports: importMap }, null, 2)}
  </script>

  <!-- Error & Timeout Watcher -->
  <script>
    window.onerror = function(msg, url, line, col, err) {
      window.parent.postMessage({ type: 'PREVIEW_ERROR', error: String(msg) }, '*');
      var root = document.getElementById('root');
      if (root) {
        root.innerHTML = '<div style="color: #ef4444; font-family: monospace; font-size: 11px; padding: 12px; background: rgba(239,68,68,0.1); border-radius: 8px;">' +
          '<strong>Runtime Error:</strong><br>' + msg + '</div>';
      }
    };
    window.addEventListener('unhandledrejection', function(event) {
      window.parent.postMessage({ type: 'PREVIEW_ERROR', error: String(event.reason) }, '*');
    });
    setTimeout(function() {
      if (!window.__PREVIEW_MOUNTED__) {
        window.parent.postMessage({ type: 'PREVIEW_TIMEOUT' }, '*');
      }
    }, 5000);
  </script>
</head>
<body>
  <div id="root"></div>

  <!-- Entry Execution Script -->
  <script type="module">
    ${entryScript}
  </script>
</body>
</html>`;
}

/**
 * Honest description and badge info for non-ready preview statuses
 */
export function getPreviewStatusInfo(status: PreviewStatus): {
  label: string;
  badgeClass: string;
  description: string;
  promptAction?: string;
} {
  switch (status) {
    case 'ready':
      return {
        label: 'Ready',
        badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        description: 'Live interactive sandbox preview available.',
      };
    case 'needs-demo':
      return {
        label: 'Needs Demo',
        badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        description: 'Component compiles cleanly but requires container context or parent wrapper.',
        promptAction: 'Generate demo wrapper with AI',
      };
    case 'primitive':
      return {
        label: 'Primitive',
        badgeClass: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
        description: 'Non-visual or foundational sub-primitive designed to be composed within parent elements.',
      };
    case 'unsupported':
      return {
        label: 'Unsupported',
        badgeClass: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
        description: 'Requires external framework runtime or complex provider context (e.g. MUI ThemeProvider, SSR).',
      };
  }
}
