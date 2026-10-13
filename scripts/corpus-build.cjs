const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const corpusDir = path.join(__dirname, '../corpus');
const publicDir = path.join(__dirname, '../public');
const registryDir = path.join(publicDir, 'r');
const packsDir = path.join(publicDir, 'packs');
const thumbsDir = path.join(publicDir, 'thumbs');

[publicDir, registryDir, packsDir, thumbsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Load normalized catalog and pilot catalog
const catalogPath = path.join(publicDir, 'catalog.json');
const pilotCatalogPath = path.join(publicDir, 'pilot-catalog.json');

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const pilotCatalog = JSON.parse(fs.readFileSync(pilotCatalogPath, 'utf8'));

console.log(`Starting corpus:build for Pilot Set (${pilotCatalog.length} items)...`);

// Index catalog by ID
const catalogMap = new Map(catalog.map((c) => [c.id, c]));

// Find markdown file for a component
function findComponentFile(id) {
  // Search in all categories under corpus/components
  const compsDir = path.join(corpusDir, 'components');
  const catDirs = fs.readdirSync(compsDir);
  for (const cat of catDirs) {
    const candidate = path.join(compsDir, cat, `${id}.md`);
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

// Parse markdown into code, usage, props
function parseComponentMarkdown(content) {
  const parsed = matter(content);
  const body = parsed.content;

  // Extract Code block
  const codeMatch = body.match(/## Code\s*```(?:tsx|jsx|ts|js)?\r?\n([\s\S]*?)```/);
  const code = codeMatch ? codeMatch[1].trim() : '';

  // Extract Usage block
  const usageMatch = body.match(/## Usage\s*```(?:tsx|jsx|ts|js)?\r?\n([\s\S]*?)```/);
  const usage = usageMatch ? usageMatch[1].trim() : undefined;

  // Extract Props from markdown table
  const props = [];
  const propsTableMatch = body.match(/## Props\s*\|([^\r\n]+)\|\r?\n\|[-| ]+\|\r?\n([\s\S]*?)(?=\r?\n##|$)/);
  if (propsTableMatch) {
    const rows = propsTableMatch[2].trim().split(/\r?\n/);
    for (const row of rows) {
      const cols = row.split('|').map((s) => s.trim()).filter(Boolean);
      if (cols.length >= 2) {
        props.push({
          name: cols[0].replace(/[`]/g, ''),
          type: cols[1].replace(/[`]/g, ''),
          default: cols[2] ? cols[2].replace(/[`]/g, '') : undefined,
          description: cols[3] || undefined,
        });
      }
    }
  }

  return {
    frontmatter: parsed.data,
    code,
    usage,
    props,
  };
}

// Map kind to shadcn registry type
function mapKindToRegistryType(kind) {
  switch (kind) {
    case 'hook':
      return 'registry:hook';
    case 'block':
      return 'registry:block';
    case 'util':
      return 'registry:lib';
    case 'style':
      return 'registry:theme';
    case 'component':
    case 'primitive':
    default:
      return 'registry:ui';
  }
}

const registryIndex = [];
const categoryPacks = {};
const d1Inserts = [];

let builtCount = 0;
let missingFilesCount = 0;

for (const meta of pilotCatalog) {
  const filePath = findComponentFile(meta.id);
  let code = `export function ${meta.name.replace(/[^a-zA-Z0-9]/g, '')}() {\n  return <div>${meta.name}</div>;\n}`;
  let usage = `<${meta.name.replace(/[^a-zA-Z0-9]/g, '')} />`;
  let props = [];

  if (filePath) {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const parsed = parseComponentMarkdown(fileContent);
      if (parsed.code) code = parsed.code;
      if (parsed.usage) usage = parsed.usage;
      if (parsed.props.length > 0) props = parsed.props;
    } catch (err) {
      console.warn(`Failed to parse ${filePath}:`, err.message);
    }
  } else {
    missingFilesCount++;
  }

  const regType = mapKindToRegistryType(meta.kind);
  const targetPath = regType === 'registry:hook'
    ? `hooks/${meta.id}.ts`
    : `components/ui/${meta.id}.tsx`;

  // 1. Generate shadcn registry item
  const registryItem = {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    name: meta.id,
    type: regType,
    title: meta.name,
    description: meta.description,
    dependencies: meta.requires.concat(meta.styling === 'tailwind' ? ['clsx', 'tailwind-merge'] : []),
    registryDependencies: [],
    files: [
      {
        path: targetPath,
        content: code,
        type: regType,
      },
    ],
    tailwind: {
      config: {
        theme: {
          extend: {},
        },
      },
    },
    cssVars: {},
    meta: {
      license: meta.license,
      attribution: meta.attribution,
      source: meta.source,
      styling: meta.styling,
      category: meta.category,
      previewStatus: meta.previewStatus,
    },
  };

  fs.writeFileSync(
    path.join(registryDir, `${meta.id}.json`),
    JSON.stringify(registryItem, null, 2)
  );

  // 2. Add to registry index
  registryIndex.push({
    name: meta.id,
    type: regType,
    title: meta.name,
    description: meta.description,
    dependencies: registryItem.dependencies,
    registryDependencies: registryItem.registryDependencies,
  });

  // 3. Add to category code packs
  if (!categoryPacks[meta.category]) categoryPacks[meta.category] = [];
  categoryPacks[meta.category].push({
    id: meta.id,
    code,
    usage,
    props,
    deps: registryItem.dependencies,
    dependsOn: [],
    shared: ['utils/cn'],
  });

  // 4. Generate D1 SQL insert
  const esc = (s) => (s ? `'${String(s).replace(/'/g, "''")}'` : 'NULL');
  const d1Row = `INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    ${esc(meta.id)},
    ${esc(meta.name)},
    ${esc(meta.kind)},
    ${esc(meta.category)},
    ${esc(JSON.stringify(meta.tags))},
    'react',
    ${esc(meta.styling)},
    ${esc(JSON.stringify(meta.requires))},
    ${esc(JSON.stringify(registryItem.dependencies))},
    '[]',
    '["utils/cn"]',
    ${esc(meta.description)},
    ${esc(meta.license)},
    0,
    'harvested',
    ${esc(meta.previewStatus)},
    ${esc(`thumbs/${meta.id}.webp`)},
    ${esc(`r/${meta.id}.json`)},
    ${esc(`hash-${meta.id}`)},
    ${Date.now()},
    1
  );`;
  d1Inserts.push(d1Row);

  builtCount++;
}

// Write registry/index.json and registry.json
fs.writeFileSync(path.join(registryDir, 'index.json'), JSON.stringify(registryIndex, null, 2));
fs.writeFileSync(path.join(publicDir, 'registry.json'), JSON.stringify(registryIndex, null, 2));

// Write category packs
for (const [cat, packItems] of Object.entries(categoryPacks)) {
  fs.writeFileSync(path.join(packsDir, `${cat}.json`), JSON.stringify(packItems, null, 2));
}

// Write D1 seed SQL
const d1SchemaSql = `CREATE TABLE IF NOT EXISTS components (
  id TEXT PRIMARY KEY,
  name TEXT,
  kind TEXT,
  category TEXT,
  subcategory TEXT,
  tags TEXT,
  framework TEXT,
  styling TEXT,
  requires TEXT,
  deps TEXT,
  depends_on TEXT,
  shared TEXT,
  description TEXT,
  license TEXT,
  favorite INTEGER,
  origin TEXT,
  preview_status TEXT,
  thumb_key TEXT,
  body_key TEXT,
  content_hash TEXT,
  updated_at INTEGER,
  version INTEGER
);

CREATE VIRTUAL TABLE IF NOT EXISTS components_fts USING fts5(
  id,
  name,
  tags,
  category,
  description,
  requires,
  tokenize='porter unicode61'
);

CREATE TABLE IF NOT EXISTS kits (
  slug TEXT PRIMARY KEY,
  name TEXT,
  description TEXT,
  items TEXT,
  updated_at INTEGER
);

CREATE TABLE IF NOT EXISTS tokens (
  id TEXT PRIMARY KEY,
  name TEXT,
  hash TEXT,
  scope TEXT,
  created_at INTEGER,
  last_used INTEGER,
  revoked INTEGER
);

CREATE TABLE IF NOT EXISTS usage (
  ts INTEGER,
  token_id TEXT,
  client TEXT,
  tool TEXT,
  component_id TEXT,
  query TEXT,
  hits INTEGER,
  ms INTEGER
);

CREATE TABLE IF NOT EXISTS wishlist (
  id TEXT PRIMARY KEY,
  query TEXT,
  description TEXT,
  count INTEGER,
  status TEXT,
  first_seen INTEGER,
  last_seen INTEGER
);
`;

const fullD1Sql = d1SchemaSql + '\n\n-- Component Seed Inserts\n' + d1Inserts.join('\n');
fs.writeFileSync(path.join(publicDir, 'd1-seed.sql'), fullD1Sql);

console.log(`\n=== Corpus Build Summary ===`);
console.log(`Registry Items Written: ${builtCount} into public/r/`);
console.log(`Registry Index Size: ${(fs.statSync(path.join(registryDir, 'index.json')).size / 1024).toFixed(1)} KB`);
console.log(`Category Packs Generated: ${Object.keys(categoryPacks).length} into public/packs/`);
console.log(`D1 Seed SQL Generated: ${(fs.statSync(path.join(publicDir, 'd1-seed.sql')).size / 1024).toFixed(1)} KB`);
