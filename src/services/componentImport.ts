import { ComponentMetadata, CodeBlob, ComponentStyling, Category } from '../domain/componentTypes';
import { extractImportSpecifiers } from './previewRuntime';
import matter from 'gray-matter';

export interface ParsedImportResult {
  id: string;
  name: string;
  category: Category;
  tags: string[];
  styling: ComponentStyling;
  framework: 'react';
  language: 'tsx';
  code: string;
  usage?: string;
  deps: string[];
  requires: string[];
  description: string;
  source: string;
  license: string;
  attribution: string;
}

export interface DedupeCheckResult {
  isDuplicate: boolean;
  matchType?: 'exact' | 'similar' | 'slug';
  matchedComponent?: ComponentMetadata;
  similarity?: number;
}

/**
 * Auto-detect styling system from code
 */
export function detectStyling(code: string): ComponentStyling {
  if (/\.module\.(css|scss|sass)/.test(code) || /from\s+['"][^'"]+\.module\.css['"]/.test(code)) {
    return 'css-modules';
  }
  if (
    /@emotion\/styled/.test(code) ||
    /styled-components/.test(code) ||
    /@mui\/material/.test(code) ||
    /@chakra-ui/.test(code)
  ) {
    return 'css-in-js';
  }
  if (
    code.includes('className="') ||
    code.includes("className='") ||
    code.includes('cn(') ||
    code.includes('twMerge(')
  ) {
    return 'tailwind';
  }
  if (/@radix-ui/.test(code) || /@react-aria/.test(code) || /@base-ui/.test(code)) {
    return 'unstyled';
  }
  return 'tailwind';
}

/**
 * Extract component display name from TSX/JSX code
 */
export function detectComponentName(code: string, fallback = 'Custom Component'): string {
  // Check: export default function Name
  const defaultFuncMatch = /export\s+default\s+function\s+([A-Z][a-zA-Z0-9_]*)/.exec(code);
  if (defaultFuncMatch) return formatDisplayName(defaultFuncMatch[1]);

  // Check: export const Name =
  const constMatch = /export\s+const\s+([A-Z][a-zA-Z0-9_]*)\s*=/.exec(code);
  if (constMatch) return formatDisplayName(constMatch[1]);

  // Check: function Name
  const funcMatch = /function\s+([A-Z][a-zA-Z0-9_]*)/.exec(code);
  if (funcMatch) return formatDisplayName(funcMatch[1]);

  return fallback;
}

/**
 * Formats PascalCase / camelCase to Title Case words
 */
export function formatDisplayName(identifier: string): string {
  return identifier
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]+/g, ' ')
    .trim();
}

/**
 * Creates clean URL-safe slug from title
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Guess category from code & name
 */
export function detectCategory(name: string, code: string): Category {
  const lower = (name + ' ' + code).toLowerCase();

  if (lower.includes('button') || lower.includes('shimmer') || lower.includes('ripple')) return 'buttons';
  if (lower.includes('input') || lower.includes('form') || lower.includes('checkbox') || lower.includes('switch')) return 'inputs-forms';
  if (lower.includes('dialog') || lower.includes('modal') || lower.includes('popover') || lower.includes('sheet') || lower.includes('drawer')) return 'overlays';
  if (lower.includes('toast') || lower.includes('alert') || lower.includes('banner') || lower.includes('badge')) return 'feedback';
  if (lower.includes('nav') || lower.includes('menu') || lower.includes('breadcrumb') || lower.includes('tab')) return 'navigation';
  if (lower.includes('table') || lower.includes('card') || lower.includes('avatar') || lower.includes('carousel')) return 'data-display';
  if (lower.includes('background') || lower.includes('particles') || lower.includes('stars')) return 'backgrounds';
  if (lower.includes('hero') || lower.includes('pricing') || lower.includes('feature')) return 'hero-and-marketing-sections';
  if (lower.includes('chat') || lower.includes('prompt') || lower.includes('message')) return 'ai-chat';
  if (lower.includes('chart') || lower.includes('graph')) return 'charts';

  return 'misc';
}

/**
 * 1. Parse from Raw Text or Paste
 */
export function parseFromPaste(text: string, fallbackName = 'New Component'): ParsedImportResult {
  let cleanedCode = text.trim();
  let name = fallbackName;
  let category: Category = 'misc';
  let tags: string[] = [];
  let description = 'User imported component.';
  let source = 'user';
  let license = 'MIT';
  let attribution = 'Custom user component (MIT)';
  let usage: string | undefined;

  // Check if text is Markdown with YAML frontmatter
  if (cleanedCode.startsWith('---')) {
    try {
      const parsedMatter = matter(cleanedCode);
      const data = parsedMatter.data || {};
      if (data.name) name = String(data.name);
      if (data.category) category = data.category as Category;
      if (Array.isArray(data.tags)) tags = data.tags.map(String);
      if (data.license) license = String(data.license);
      if (data.attribution) attribution = String(data.attribution);
      if (data.source) source = String(data.source);

      // Extract code from markdown body
      const codeBlockMatch = /```(?:tsx|jsx|ts|js)?\n([\s\S]*?)```/.exec(parsedMatter.content);
      if (codeBlockMatch) {
        cleanedCode = codeBlockMatch[1].trim();
      } else {
        cleanedCode = parsedMatter.content.trim();
      }
    } catch {
      // Fallback to regex
    }
  } else {
    // Check if plain code has fenced block
    const fenceMatch = /```(?:tsx|jsx|ts|js)?\n([\s\S]*?)```/.exec(cleanedCode);
    if (fenceMatch) {
      cleanedCode = fenceMatch[1].trim();
    }
  }

  name = detectComponentName(cleanedCode, name);
  const styling = detectStyling(cleanedCode);
  category = category !== 'misc' ? category : detectCategory(name, cleanedCode);
  const allDeps = extractImportSpecifiers(cleanedCode);
  const requires = allDeps.filter((d) => d.startsWith('@mantine') || d.startsWith('@mui'));
  const deps = allDeps.filter((d) => !requires.includes(d));

  return {
    id: slugify(name),
    name,
    category,
    tags: tags.length > 0 ? tags : [styling, category],
    styling,
    framework: 'react',
    language: 'tsx',
    code: cleanedCode,
    usage,
    deps,
    requires,
    description,
    source,
    license,
    attribution,
  };
}

/**
 * 2. Parse from Dropped File
 */
export async function parseFromDrop(file: File): Promise<ParsedImportResult> {
  const content = await file.text();
  const fileBasename = file.name.replace(/\.[^/.]+$/, '');
  const suggestedName = formatDisplayName(fileBasename);
  return parseFromPaste(content, suggestedName);
}

/**
 * 3. Fetch from Shadcn Registry JSON URL
 */
export async function fetchFromRegistryUrl(url: string): Promise<ParsedImportResult> {
  let targetUrl = url.trim();
  if (targetUrl.includes('ui.shadcn.com') && !targetUrl.endsWith('.json')) {
    const slug = targetUrl.split('/').filter(Boolean).pop();
    targetUrl = `https://ui.shadcn.com/r/${slug}.json`;
  }

  const response = await fetch(targetUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch registry from ${targetUrl}: ${response.statusText}`);
  }

  const data = await response.json();
  const mainFile = data.files?.[0];
  const code = mainFile?.content || '';
  const name = formatDisplayName(data.name || 'Registry Component');
  const styling = detectStyling(code);
  const category = detectCategory(name, code);

  return {
    id: slugify(name),
    name,
    category,
    tags: [styling, category, 'shadcn-registry'],
    styling,
    framework: 'react',
    language: 'tsx',
    code,
    deps: data.dependencies || extractImportSpecifiers(code),
    requires: [],
    description: data.description || `Imported from ${url}`,
    source: 'registry',
    license: data.meta?.license || 'MIT',
    attribution: data.meta?.attribution || `shadcn registry (${targetUrl})`,
  };
}

/**
 * 4. Fetch from GitHub File URL
 */
export async function fetchFromGithubUrl(url: string): Promise<ParsedImportResult> {
  let rawUrl = url.trim();

  // Convert github.com/.../blob/... to raw.githubusercontent.com/...
  if (rawUrl.includes('github.com') && rawUrl.includes('/blob/')) {
    rawUrl = rawUrl
      .replace('github.com', 'raw.githubusercontent.com')
      .replace('/blob/', '/');
  }

  const response = await fetch(rawUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch code from GitHub URL: ${response.statusText}`);
  }

  const code = await response.text();
  const fileName = rawUrl.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'github-component';
  return parseFromPaste(code, formatDisplayName(fileName));
}

/**
 * Deduplication check against existing components
 */
export function checkDeduplication(
  code: string,
  slug: string,
  existingList: ComponentMetadata[],
  blobsMap: Map<string, string> // id -> code
): DedupeCheckResult {
  const normalizedIncoming = code.replace(/\s+/g, ' ').trim();

  // 1. Exact slug match
  const slugMatch = existingList.find((c) => c.id === slug);
  if (slugMatch) {
    return {
      isDuplicate: true,
      matchType: 'slug',
      matchedComponent: slugMatch,
      similarity: 1.0,
    };
  }

  // 2. Exact code match
  for (const existing of existingList) {
    const existingCode = blobsMap.get(existing.id);
    if (!existingCode) continue;

    const normalizedExisting = existingCode.replace(/\s+/g, ' ').trim();
    if (normalizedIncoming === normalizedExisting) {
      return {
        isDuplicate: true,
        matchType: 'exact',
        matchedComponent: existing,
        similarity: 1.0,
      };
    }
  }

  return { isDuplicate: false };
}
