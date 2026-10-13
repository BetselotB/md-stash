export type Category =
  | 'buttons'
  | 'inputs-forms'
  | 'selection'
  | 'navigation'
  | 'overlays'
  | 'feedback'
  | 'data-display'
  | 'charts'
  | 'layout'
  | 'text-effects'
  | 'backgrounds'
  | 'cursors-and-pointer'
  | 'scroll-and-parallax'
  | '3d-and-canvas'
  | 'hero-and-marketing-sections'
  | 'ai-chat'
  | 'media'
  | 'icons-index'
  | 'hooks'
  | 'animation-primitives'
  | 'misc';

export type ComponentKind =
  | 'component'
  | 'primitive'
  | 'block'
  | 'hook'
  | 'util'
  | 'style'
  | 'icon-index';

export type ComponentStyling =
  | 'tailwind'
  | 'css'
  | 'css-modules'
  | 'css-in-js'
  | 'mixed'
  | 'unstyled';

export type PreviewStatus = 'ready' | 'needs-demo' | 'primitive' | 'unsupported';

export type PreviewMode = 'usage' | 'auto-props' | 'demo';

export interface ComponentProp {
  name: string;
  type: string;
  default?: string;
  description?: string;
  required?: boolean;
}

export interface ComponentPreview {
  status: PreviewStatus;
  mode?: PreviewMode;
  demo?: string;
  reason?: string;
  thumb?: string; // Relative path or URL to WebP thumbnail
}

export interface ComponentSource {
  source: string;
  url: string;
  relation: string; // 'canonical' | 'duplicate' | 'variant'
}

export interface ComponentVariant {
  label: string;
  diff: string;
  source: string;
}

export interface ComponentHashes {
  content: string; // sha256:...
  ast: string;     // sha256:...
}

/**
 * Full component record
 */
export interface Component {
  id: string;                    // Stable slug (e.g. "shimmer-button")
  aliases?: string[];            // Historical or duplicate slugs for redirection
  name: string;                  // Title-cased display name
  kind: ComponentKind;
  category: Category;
  subcategory?: string;
  tags: string[];
  framework: 'react' | 'vue' | 'svelte' | 'solid';
  styling: ComponentStyling;
  requires: string[];            // UI packages needed beyond React (e.g. ['@mantine/core'])
  language: 'tsx' | 'ts' | 'jsx';
  deps: string[];                // npm packages with semver range
  dependsOn: string[];           // IDs of sibling components in the library
  shared: string[];              // Shared helpers (e.g. ['utils/cn'])
  code: string;                  // Canonical source code
  description: string;
  usage?: string;                // Sample JSX usage example
  props: ComponentProp[];
  preview: ComponentPreview;
  license: string;               // SPDX identifier (e.g. 'MIT')
  attribution: string;           // Mandatory copyright & upstream URL line
  sources: ComponentSource[];
  variants?: ComponentVariant[];
  hashes: ComponentHashes;
  origin: 'harvested' | 'user';  // 'user' for owner-added or modified components
  favorite: boolean;             // Amber pushpin status
  notes?: string;                // Owner's private scratch notes
  createdAt: number;
  updatedAt: number;
  version: number;
}

/**
 * Lightweight metadata stored in Dexie `components` table for instant indexing (< 0.5 KB each).
 */
export interface ComponentMetadata {
  id: string;
  name: string;
  kind: ComponentKind;
  category: Category;
  subcategory?: string;
  tags: string[];
  framework: 'react' | 'vue' | 'svelte' | 'solid';
  styling: ComponentStyling;
  requires: string[];
  source: string;                // Primary source e.g. "magic-ui"
  previewStatus: PreviewStatus;
  thumb?: string;
  license: string;
  attribution: string;
  favorite: boolean;
  origin: 'harvested' | 'user';
  description: string;
  depsCount: number;
  updatedAt: number;
  createdAt: number;
}

/**
 * Full code & execution blob stored in Dexie `codeBlobs` table and lazy-loaded on demand.
 */
export interface CodeBlob {
  id: string;                    // Component ID
  code: string;
  usage?: string;
  props: ComponentProp[];
  demo?: string;
  deps: string[];
  dependsOn: string[];
  shared: string[];
  variants?: ComponentVariant[];
}

/**
 * Kit membership mapping item
 */
export interface KitItem {
  kitId: string;
  id: string;                    // Component ID
  order: number;
}

/**
 * Component version history snapshot for user edits
 */
export interface CompVersion {
  id: string;
  componentId: string;
  code: string;
  description?: string;
  createdAt: number;
}

/**
 * Agent request wishlist item
 */
export interface WishlistItem {
  id: string;
  query: string;
  description?: string;
  count: number;
  status: 'pending' | 'completed' | 'dismissed';
  firstSeen: number;
  lastSeen: number;
}
