import { z } from 'zod';

export const CategorySchema = z.enum([
  'buttons',
  'inputs-forms',
  'selection',
  'navigation',
  'overlays',
  'feedback',
  'data-display',
  'charts',
  'layout',
  'text-effects',
  'backgrounds',
  'cursors-and-pointer',
  'scroll-and-parallax',
  '3d-and-canvas',
  'hero-and-marketing-sections',
  'ai-chat',
  'media',
  'icons-index',
  'hooks',
  'animation-primitives',
  'misc',
]);

export const ComponentKindSchema = z.enum([
  'component',
  'primitive',
  'block',
  'hook',
  'util',
  'style',
  'icon-index',
]);

export const ComponentStylingSchema = z.enum([
  'tailwind',
  'css',
  'css-modules',
  'css-in-js',
  'mixed',
  'unstyled',
]);

export const PreviewStatusSchema = z.enum([
  'ready',
  'needs-demo',
  'primitive',
  'unsupported',
]);

export const ComponentPropSchema = z.object({
  name: z.string(),
  type: z.string(),
  default: z.string().optional(),
  description: z.string().optional(),
  required: z.boolean().optional(),
});

export const ComponentPreviewSchema = z.object({
  status: PreviewStatusSchema,
  mode: z.enum(['usage', 'auto-props', 'demo']).optional(),
  demo: z.string().optional(),
  reason: z.string().optional(),
  thumb: z.string().optional(),
});

export const ComponentMetadataSchema = z.object({
  id: z.string(),
  name: z.string(),
  kind: ComponentKindSchema,
  category: CategorySchema,
  subcategory: z.string().optional(),
  tags: z.array(z.string()),
  framework: z.enum(['react', 'vue', 'svelte', 'solid']),
  styling: ComponentStylingSchema,
  requires: z.array(z.string()),
  source: z.string(),
  previewStatus: PreviewStatusSchema,
  thumb: z.string().optional(),
  license: z.string(),
  attribution: z.string(),
  favorite: z.boolean(),
  origin: z.enum(['harvested', 'user']),
  description: z.string(),
  depsCount: z.number(),
  updatedAt: z.number(),
  createdAt: z.number(),
});

export const ComponentRecordSchema = z.object({
  id: z.string(),
  aliases: z.array(z.string()).optional(),
  name: z.string(),
  kind: ComponentKindSchema,
  category: CategorySchema,
  subcategory: z.string().optional(),
  tags: z.array(z.string()),
  framework: z.enum(['react', 'vue', 'svelte', 'solid']),
  styling: ComponentStylingSchema,
  requires: z.array(z.string()),
  language: z.enum(['tsx', 'ts', 'jsx']),
  deps: z.array(z.string()),
  dependsOn: z.array(z.string()),
  shared: z.array(z.string()),
  code: z.string(),
  description: z.string(),
  usage: z.string().optional(),
  props: z.array(ComponentPropSchema),
  preview: ComponentPreviewSchema,
  license: z.string(),
  attribution: z.string(),
  sources: z.array(
    z.object({
      source: z.string(),
      url: z.string(),
      relation: z.string(),
    })
  ),
  variants: z
    .array(
      z.object({
        label: z.string(),
        diff: z.string(),
        source: z.string(),
      })
    )
    .optional(),
  hashes: z.object({
    content: z.string(),
    ast: z.string(),
  }),
  origin: z.enum(['harvested', 'user']),
  favorite: z.boolean(),
  notes: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
  version: z.number(),
});
