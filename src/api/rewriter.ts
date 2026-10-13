export interface InstallProject {
  framework?: 'next-app' | 'next-pages' | 'vite' | 'remix' | 'astro' | 'other';
  tailwind?: '3' | '4';
  alias?: string;
  uiDir?: string;
  utilsPath?: string;
  pm?: 'pnpm' | 'npm' | 'yarn' | 'bun';
}

export interface InstallPlanOutput {
  commands: string[];
  registry: string[];
  files: Array<{
    path: string;
    content: string;
    ifMissing?: boolean;
  }>;
  css: Array<{
    target: string;
    append: string;
  }>;
  warnings: string[];
  attribution: string[];
}

/**
 * Rewrites import statements according to target project alias & directory structure.
 */
export function rewriteImports(
  code: string,
  options: {
    alias?: string;
    uiDir?: string;
    utilsPath?: string;
    framework?: string;
  } = {}
): string {
  const {
    alias = '@/',
    uiDir = 'components/ui',
    utilsPath = 'lib/utils.ts',
  } = options;

  const normalizedUtils = `${alias}${utilsPath.replace(/\.(ts|js|tsx|jsx)$/, '')}`;
  const normalizedUi = `${alias}${uiDir}`;

  let rewritten = code;

  // 1. Rewrite utils/cn or @/lib/utils
  rewritten = rewritten.replace(
    /from\s+['"](?:\.\.\/|\.\/)*utils\/cn['"]/g,
    `from '${normalizedUtils}'`
  );
  rewritten = rewritten.replace(
    /from\s+['"]@\/lib\/utils['"]/g,
    `from '${normalizedUtils}'`
  );

  // 2. Rewrite internal component imports
  rewritten = rewritten.replace(
    /from\s+['"]@\/components\/ui\/([^'"]+)['"]/g,
    `from '${normalizedUi}/$1'`
  );

  // 3. Rewrite framer-motion to motion if modern motion
  rewritten = rewritten.replace(
    /from\s+['"]framer-motion['"]/g,
    `from 'motion/react'`
  );

  return rewritten;
}

/**
 * Generates an end-to-end install plan for requested component IDs.
 */
export function generateInstallPlan(
  components: Array<{
    id: string;
    name: string;
    code: string;
    deps: string[];
    attribution: string;
    styling: string;
  }>,
  project: InstallProject = {},
  host = 'localhost:4777'
): InstallPlanOutput {
  const {
    framework = 'next-app',
    tailwind = '4',
    alias = '@/',
    uiDir = 'components/ui',
    utilsPath = 'lib/utils.ts',
    pm = 'pnpm',
  } = project;

  const allDeps = new Set<string>();
  const files: InstallPlanOutput['files'] = [];
  const attributions: string[] = [];
  const registryCommands: string[] = [];

  // Default shared helpers needed
  allDeps.add('clsx');
  allDeps.add('tailwind-merge');

  // Utility file content if missing
  files.push({
    path: utilsPath,
    content: `import { clsx, type ClassValue } from 'clsx';\nimport { twMerge } from 'tailwind-merge';\n\nexport function cn(...inputs: ClassValue[]) {\n  return twMerge(clsx(inputs));\n}\n`,
    ifMissing: true,
  });

  for (const comp of components) {
    for (const d of comp.deps) allDeps.add(d);
    if (comp.attribution) attributions.push(comp.attribution);

    const rewrittenCode = rewriteImports(comp.code, {
      alias,
      uiDir,
      utilsPath,
      framework,
    });

    files.push({
      path: `${uiDir}/${comp.id}.tsx`,
      content: rewrittenCode,
    });

    const pmDl = pm === 'pnpm' ? 'pnpm dlx' : pm === 'bun' ? 'bunx' : 'npx';
    registryCommands.push(
      `${pmDl} shadcn@latest add https://${host}/r/${comp.id}.json`
    );
  }

  const installVerb = pm === 'pnpm' ? 'add' : pm === 'yarn' ? 'add' : 'install';
  const depArray = Array.from(allDeps).filter(
    (d) => !['react', 'react-dom'].includes(d)
  );
  const commands = [
    `${pm} ${installVerb} ${depArray.join(' ')}`,
  ];

  const css: InstallPlanOutput['css'] = [];
  if (tailwind === '4') {
    css.push({
      target: framework === 'next-app' ? 'app/globals.css' : 'src/index.css',
      append: `@theme {\n  --font-display: "Chelsea Market", sans-serif;\n}`,
    });
  }

  return {
    commands,
    registry: registryCommands,
    files,
    css,
    warnings: [],
    attribution: attributions,
  };
}
