import { zipSync, strToU8 } from 'fflate';
import { ComponentMetadata, CodeBlob } from '../domain/componentTypes';
import { transpileToJs } from './previewRuntime';

export type PromptMode = 'implement' | 'adapt' | 'compose' | 'convert' | 'review' | 'test';
export type ModelPreset = 'claude' | 'gpt' | 'cursor' | 'v0';
export type PackageManager = 'pnpm' | 'npm' | 'yarn' | 'bun';

export interface CopyCodeOptions {
  lang?: 'tsx' | 'js';
  importAlias?: string;
  includeAttribution?: boolean;
}

export interface CopyWithDepsOptions {
  inlineCn?: boolean;
  importAlias?: string;
  multiFile?: boolean;
}

export interface CopyMarkdownOptions {
  docStyle?: boolean; // If true, removes frontmatter and presents as documentation
}

export interface CopyPromptOptions {
  modelPreset?: ModelPreset;
  importAlias?: string;
  brief?: string;
  targetFramework?: string;
}

export interface CopyInstallOptions {
  pkgManager?: PackageManager;
  registryUrl?: string;
}

/**
 * 1. Format Component Source Code (TSX or compiled JS, alias rewritten)
 */
export function formatCopyCode(
  component: ComponentMetadata,
  blob?: CodeBlob | null,
  options: CopyCodeOptions = {}
): string {
  const { lang = 'tsx', importAlias = '@/lib/utils', includeAttribution = true } = options;
  let code = blob?.code || '';

  // Apply import alias rewrite
  if (importAlias !== '@/lib/utils') {
    code = code.replace(/@\/lib\/utils/g, importAlias);
    code = code.replace(/utils\/cn/g, importAlias);
  }

  // If JavaScript requested, strip TypeScript types via Sucrase
  if (lang === 'js') {
    try {
      code = transpileToJs(code);
    } catch {
      // Keep original if transpile fails
    }
  }

  const header = includeAttribution
    ? `// Component: ${component.name} (${component.id})\n// Source: ${component.source} | License: ${component.license}\n// Attribution: ${component.attribution}\n\n`
    : '';

  return header + code.trim();
}

/**
 * 2. Format Code With Dependencies (Single-file bundle with inlined cn or multi-file fenced list)
 */
export function formatCopyWithDeps(
  component: ComponentMetadata,
  blob?: CodeBlob | null,
  options: CopyWithDepsOptions = {}
): string {
  const { inlineCn = false, importAlias = '@/lib/utils', multiFile = false } = options;
  const baseCode = formatCopyCode(component, blob, { importAlias, includeAttribution: true });

  if (multiFile) {
    const cnContent = `import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export default cn;`;

    return `### File: components/ui/${component.id}.tsx
\`\`\`tsx
${baseCode}
\`\`\`

### File: lib/utils.ts
\`\`\`ts
${cnContent}
\`\`\``;
  }

  if (inlineCn) {
    const inlinedCn = `import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`;
    // Remove external cn import from baseCode
    const cleanedCode = baseCode
      .replace(/import\s+\{\s*cn\s*\}\s+from\s+['"][^'"]+['"];?\n?/g, '')
      .replace(/import\s+cn\s+from\s+['"][^'"]+['"];?\n?/g, '');

    return inlinedCn + '\n' + cleanedCode;
  }

  return baseCode;
}

/**
 * 3. Format Component Markdown (Frontmatter or Doc-style)
 */
export function formatCopyMarkdown(
  component: ComponentMetadata,
  blob?: CodeBlob | null,
  options: CopyMarkdownOptions = {}
): string {
  const { docStyle = false } = options;

  if (docStyle) {
    return `# ${component.name}

> ${component.description || 'Component from MDstash library.'}

**Category:** ${component.category}  
**Styling:** ${component.styling}  
**License:** ${component.license} (${component.attribution})

## Code
\`\`\`tsx
${blob?.code?.trim() || ''}
\`\`\`
${blob?.usage ? `\n## Usage\n\`\`\`tsx\n${blob.usage.trim()}\n\`\`\`\n` : ''}`;
  }

  return `---
id: ${component.id}
name: "${component.name}"
category: ${component.category}
tags: ${JSON.stringify(component.tags)}
framework: ${component.framework}
styling: ${component.styling}
license: ${component.license}
attribution: "${component.attribution}"
source: "${component.source}"
deps: ${JSON.stringify(blob?.deps || [])}
---

# ${component.name}

${component.description || ''}

\`\`\`tsx
${blob?.code?.trim() || ''}
\`\`\`
${blob?.usage ? `\n## Usage\n\`\`\`tsx\n${blob.usage.trim()}\n\`\`\`\n` : ''}`;
}

/**
 * 4. AI Prompt Builder (6 modes, 4 model presets, token estimate)
 */
export function formatCopyPrompt(
  component: ComponentMetadata,
  blob?: CodeBlob | null,
  mode: PromptMode = 'implement',
  options: CopyPromptOptions = {}
): string {
  const {
    modelPreset = 'claude',
    importAlias = '@/lib/utils',
    brief = '',
    targetFramework = 'Vue',
  } = options;

  const code = blob?.code?.trim() || '';
  const deps = component.requires.concat(blob?.deps || []).join(', ') || 'none';

  if (modelPreset === 'claude') {
    switch (mode) {
      case 'implement':
        return `<task>
Add the "${component.name}" component to my ${component.framework} project.
</task>

<component id="${component.id}">
Category: ${component.category}
Styling: ${component.styling}
License: ${component.license} (${component.attribution})
Dependencies: ${deps}

Source Code:
\`\`\`tsx
${code}
\`\`\`
</component>

<implementation_rules>
1. Preserve existing Tailwind classes and props.
2. Use import alias "${importAlias}" for utilities.
3. Wire this component into my active view cleanly.
</implementation_rules>`;

      case 'adapt':
        return `<task>
Adapt the "${component.name}" component to match my project's semantic design system tokens.
</task>

<component id="${component.id}">
${code}
</component>

<instructions>
1. Replace generic colors with semantic tokens (e.g. bg-background, text-foreground, border-border).
2. Ensure full dark mode compatibility and high contrast.
3. Keep all props and exported signatures identical.
</instructions>`;

      case 'compose':
        return `<task>
Compose the "${component.name}" component to implement the following user feature:
${brief || 'Build a unified interactive card section.'}
</task>

<component id="${component.id}">
${code}
</component>`;

      case 'convert':
        return `<task>
Convert the "${component.name}" component from React/TSX to ${targetFramework}.
</task>

<component id="${component.id}">
${code}
</component>

<instructions>
1. Re-implement in idiomatic ${targetFramework} with equivalent reactivity and props.
2. Maintain identical visual styling classes.
</instructions>`;

      case 'review':
        return `<task>
Perform an accessibility (a11y) and performance review of the "${component.name}" component.
</task>

<component id="${component.id}">
${code}
</component>

<review_checklist>
- ARIA roles, states, and keyboard navigation.
- Color contrast ratio against background.
- React render memoization and re-render efficiency.
</review_checklist>`;

      case 'test':
        return `<task>
Write comprehensive unit tests for the "${component.name}" component using Vitest and React Testing Library.
</task>

<component id="${component.id}">
${code}
</component>

<test_requirements>
1. Test default render with synthesized props.
2. Test user interactions (clicks, keyboard focus).
3. Test edge cases (disabled state, empty children).
</test_requirements>`;
    }
  }

  // Standard Markdown Preset (GPT, Cursor, v0)
  return `### Task: ${mode.toUpperCase()} - ${component.name}

${brief ? `Brief: ${brief}\n\n` : ''}**Category:** ${component.category} | **Styling:** ${component.styling}
**Attribution:** ${component.attribution}

\`\`\`tsx
${code}
\`\`\`

Please complete the task maintaining existing styling and props.`;
}

/**
 * 5. Format Installation Commands (Shadcn CLI + Dependency install)
 */
export function formatCopyInstall(
  component: ComponentMetadata,
  blob?: CodeBlob | null,
  options: CopyInstallOptions = {}
): {
  shadcnCommand: string;
  depsCommand: string;
  fullScript: string;
} {
  const { pkgManager = 'pnpm', registryUrl = 'http://localhost:8787' } = options;
  const deps = blob?.deps || [];

  let shadcnCommand = `npx shadcn@latest add ${registryUrl}/r/${component.id}.json`;
  if (pkgManager === 'pnpm') shadcnCommand = `pnpm dlx shadcn@latest add ${registryUrl}/r/${component.id}.json`;
  else if (pkgManager === 'bun') shadcnCommand = `bunx --bun shadcn@latest add ${registryUrl}/r/${component.id}.json`;
  else if (pkgManager === 'yarn') shadcnCommand = `npx shadcn@latest add ${registryUrl}/r/${component.id}.json`;

  let depsCommand = '';
  if (deps.length > 0) {
    if (pkgManager === 'npm') depsCommand = `npm install ${deps.join(' ')}`;
    else if (pkgManager === 'yarn') depsCommand = `yarn add ${deps.join(' ')}`;
    else if (pkgManager === 'bun') depsCommand = `bun add ${deps.join(' ')}`;
    else depsCommand = `pnpm add ${deps.join(' ')}`;
  }

  const fullScript = [
    `# Install ${component.name} via shadcn registry:`,
    shadcnCommand,
    depsCommand ? `\n# Install required dependencies:\n${depsCommand}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return { shadcnCommand, depsCommand, fullScript };
}

/**
 * 6. Format Agent Link (/c/<id>.md)
 */
export function formatCopyAgentLink(component: ComponentMetadata, host = 'localhost:8787'): string {
  const protocol = host.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${host}/c/${component.id}.md`;
}

/**
 * 7. Format MCP Call JSON string
 */
export function formatCopyMcpCall(component: ComponentMetadata): string {
  return JSON.stringify(
    {
      tool: 'get_component',
      arguments: {
        id: component.id,
        include: ['code', 'props', 'requires'],
      },
    },
    null,
    2
  );
}

/**
 * 8. Format Kit Prompt Bundle (Ordered components with Table of Contents)
 */
export function formatCopyKitPrompt(
  components: ComponentMetadata[],
  blobs: Map<string, CodeBlob>,
  kitName = 'Custom Kit',
  options: { taskBrief?: string; modelPreset?: ModelPreset } = {}
): string {
  const { taskBrief = '', modelPreset = 'claude' } = options;

  const toc = components
    .map((c, i) => `${i + 1}. **${c.name}** (\`${c.id}\`) — *${c.category}* (${c.styling})`)
    .join('\n');

  const allDeps = new Set<string>();
  components.forEach((c) => {
    c.requires.forEach((r) => allDeps.add(r));
    const b = blobs.get(c.id);
    b?.deps.forEach((d) => allDeps.add(d));
  });

  const sections = components.map((c, i) => {
    const b = blobs.get(c.id);
    return `### [${i + 1}/${components.length}] Component: ${c.name} (\`${c.id}\`)
- **Category:** ${c.category}
- **Source:** ${c.source} | **License:** ${c.license} (${c.attribution})

\`\`\`tsx
${b?.code?.trim() || '// Code not found'}
\`\`\``;
  });

  if (modelPreset === 'claude') {
    return `<kit name="${kitName}">
<description>
Ordered component bundle from MDstash containing ${components.length} components.
${taskBrief ? `User Goal: ${taskBrief}\n` : ''}
</description>

<table_of_contents>
${toc}
</table_of_contents>

<dependencies>
${Array.from(allDeps).join(', ') || 'none'}
</dependencies>

<components>
${sections.join('\n\n')}
</components>
</kit>`;
  }

  return `# Kit: ${kitName}

${taskBrief ? `**Goal:** ${taskBrief}\n\n` : ''}## Table of Contents
${toc}

## Shared Dependencies
${Array.from(allDeps).join(', ') || 'none'}

---

${sections.join('\n\n---\n\n')}`;
}

/**
 * 9. Create Zip Archive Buffer using fflate (components + shared utils + package.json + README)
 */
export function createComponentZipBuffer(
  components: ComponentMetadata[],
  blobs: Map<string, CodeBlob>,
  kitName = 'mdstash-components'
): Uint8Array {
  const zipData: Record<string, Uint8Array> = {};

  const allDeps: Record<string, string> = {
    react: '^18.3.1',
    'react-dom': '^18.3.1',
    clsx: '^2.1.1',
    'tailwind-merge': '^3.0.1',
  };

  // Add individual component files
  for (const comp of components) {
    const b = blobs.get(comp.id);
    const code = b?.code || '';
    zipData[`src/components/ui/${comp.id}.tsx`] = strToU8(code);

    b?.deps.forEach((d) => {
      allDeps[d] = 'latest';
    });
  }

  // Add standard cn helper
  const cnUtil = `import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export default cn;
`;
  zipData['src/lib/utils.ts'] = strToU8(cnUtil);

  // Add package.json
  const pkgJson = {
    name: kitName.toLowerCase().replace(/[^a-z0-9_-]/g, '-'),
    version: '1.0.0',
    private: true,
    dependencies: allDeps,
  };
  zipData['package.json'] = strToU8(JSON.stringify(pkgJson, null, 2));

  // Add README.md with mandatory licensing & attributions
  const readme = `# ${kitName}

Packaged from MDstash Component Library Platform.

## Components Included (${components.length})
${components
  .map((c) => `- **${c.name}** (\`${c.id}\`) — License: ${c.license} (${c.attribution})`)
  .join('\n')}

## Setup Instructions
1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
2. Import components from \`./src/components/ui/<component>\`.
`;
  zipData['README.md'] = strToU8(readme);

  return zipSync(zipData);
}
