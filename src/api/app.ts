import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { edgeDb } from './db';
import { handleMcpRequest } from './mcp';
import { generateInstallPlan, rewriteImports } from './rewriter';

export const apiApp = new Hono();

// Global CORS enabled for all GET/POST requests per spec
apiApp.use('*', cors());

// Health endpoint
apiApp.get('/api/health', (c) => {
  return c.json({
    status: 'healthy',
    version: '1.0.0',
    componentsCount: edgeDb.getAllComponents().length,
    timestamp: Date.now(),
  });
});

// Helper for extracting bearer or path token
function resolveAuth(c: any): { tokenId: string; valid: boolean } {
  const authHeader = c.req.header('Authorization');
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (c.req.param('token')) {
    token = c.req.param('token');
  } else if (c.req.query('t')) {
    token = c.req.query('t');
  }

  if (!token) {
    return { tokenId: 'anonymous', valid: true };
  }

  const record = edgeDb.verifyToken(token);
  if (!record) {
    return { tokenId: 'invalid', valid: false };
  }

  return { tokenId: record.id, valid: true };
}

// --- MCP Server Endpoints ---

const mcpHandler = async (c: any) => {
  const auth = resolveAuth(c);
  if (!auth.valid) {
    return c.json(
      { jsonrpc: '2.0', id: null, error: { code: -32001, message: 'Unauthorized: Invalid token' } },
      401
    );
  }

  const clientHeader = c.req.header('User-Agent') || 'mcp-client';
  const host = c.req.header('host') || 'localhost:4777';

  let body = {};
  try {
    body = await c.req.json();
  } catch {}

  const response = await handleMcpRequest(body, {
    tokenId: auth.tokenId,
    client: clientHeader,
    host,
  });

  return c.json(response);
};

apiApp.post('/mcp', mcpHandler);
apiApp.post('/t/:token/mcp', mcpHandler);

// --- Prompt Links (llms.txt) ---

const llmsTxtHandler = (c: any) => {
  const host = c.req.header('host') || 'localhost:4777';
  const token = c.req.param('token') || c.req.query('t') || '<token>';
  const categories = edgeDb.getCategories();

  const text = `# Owner's Component Library
You have access to a library of ~8,000 React+Tailwind components.
Before writing any UI component, look it up:
- Search:    GET https://${host}/api/search?q=<terms>&t=${token}        (ids + summaries)
- One item:  GET https://${host}/c/<id>.md?alias=@/lib/utils&t=${token} (code + usage)
- Kit:       GET https://${host}/kit/<slug>.md?t=${token}               (curated bundle)
- Rules:     GET https://${host}/api/docs/design-system?t=${token}
Workflow: search → open best 1–3 → copy code → adapt only what the user asked.
Prefer fav=true. If missing, say so and build it.

Categories (${categories.length}):
${categories.map((cat) => `- ${cat.category} (${cat.count} items, top tags: ${cat.topTags.join(', ')})`).join('\n')}

Top kits: saas-dashboard, landing-page, ai-chat
`;

  return c.text(text, 200, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'public, max-age=60',
  });
};

apiApp.get('/llms.txt', llmsTxtHandler);
apiApp.get('/llms-full.txt', llmsTxtHandler);
apiApp.get('/t/:token/llms.txt', llmsTxtHandler);

// --- Markdown Links (/c/:filename) ---

apiApp.get('/c/:filename', (c) => {
  const filename = c.req.param('filename');
  const id = filename.replace(/\.md$/i, '');
  const alias = c.req.query('alias') || '@/lib/utils';
  const lang = c.req.query('lang') || 'ts';
  const comp = edgeDb.getComponent(id);

  if (!comp) {
    return c.text(`Component not found: "${id}"`, 404);
  }

  const rewritten = rewriteImports(comp.code, { alias });
  const md = `# ${comp.name}\n\n${comp.description}\n\n### Code\n\`\`\`${lang === 'js' ? 'jsx' : 'tsx'}\n${rewritten}\n\`\`\`\n\n### Usage\n\`\`\`tsx\n${comp.usage || `<${comp.name} />`}\n\`\`\`\n\n<!-- Attribution: ${comp.attribution} -->\n`;

  return c.text(md, 200, {
    'Content-Type': 'text/markdown; charset=utf-8',
    'Cache-Control': 'public, max-age=60, stale-while-revalidate=86400',
  });
});

// --- Kit Markdown Bundle (/kit/:slug) ---

apiApp.get('/kit/:slug', (c) => {
  const slug = c.req.param('slug').replace(/\.md$/i, '');
  const all = edgeDb.getAllComponents().slice(0, 5);

  let md = `# Kit: ${slug} (${all.length} items)\n\n`;
  for (const item of all) {
    md += `### File: components/ui/${item.id}.tsx\n\`\`\`tsx\n${item.code}\n\`\`\`\n\n---\n\n`;
  }

  return c.text(md, 200, {
    'Content-Type': 'text/markdown; charset=utf-8',
  });
});

// --- Shadcn Registry Endpoints ---

apiApp.get('/r/:filename', (c) => {
  const filename = c.req.param('filename');
  if (filename === 'index.json') {
    const all = edgeDb.getAllComponents().map((comp) => ({
      name: comp.id,
      type: 'registry:ui',
      title: comp.name,
      description: comp.description,
      dependencies: comp.deps,
    }));

    return c.json(all, 200, {
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=86400',
    });
  }

  const id = filename.replace(/\.json$/i, '');
  const comp = edgeDb.getComponent(id);

  if (!comp) {
    return c.json({ error: { code: 'not_found', message: `Component "${id}" not found` } }, 404);
  }

  const regItem = {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    name: comp.id,
    type: 'registry:ui',
    title: comp.name,
    description: comp.description,
    dependencies: comp.deps,
    registryDependencies: [],
    files: [
      {
        path: `components/ui/${comp.id}.tsx`,
        content: comp.code,
        type: 'registry:ui',
      },
    ],
    tailwind: { config: { theme: { extend: {} } } },
    cssVars: {},
    meta: {
      license: comp.license,
      attribution: comp.attribution,
      source: comp.source,
      styling: comp.styling,
      category: comp.category,
    },
  };

  return c.json(regItem, 200, {
    'Cache-Control': 'public, max-age=60, stale-while-revalidate=86400',
    ETag: `"hash-${comp.id}"`,
  });
});

// --- REST API Endpoints ---

apiApp.get('/api/search', (c) => {
  const q = c.req.query('q') || '';
  const category = c.req.query('category');
  const tag = c.req.query('tag');
  const kind = c.req.query('kind');
  const styling = c.req.query('styling');
  const limit = parseInt(c.req.query('limit') || '8', 10);

  const search = edgeDb.searchComponents(q, { category, tag, kind, styling, limit });

  return c.json({
    q,
    total: search.total,
    results: search.results.map((r) => ({
      id: r.id,
      name: r.name,
      category: r.category,
      styling: r.styling,
      preview: r.previewStatus,
      fav: r.favorite,
      score: r.score,
      summary: r.description,
    })),
    hint: "Call get_component with an id. Use include=['props'] only if you need prop details.",
  });
});

apiApp.get('/api/components/:id', (c) => {
  const id = c.req.param('id');
  const alias = c.req.query('alias') || '@/lib/utils';
  const comp = edgeDb.getComponent(id);

  if (!comp) {
    return c.json({ error: { code: 'not_found', message: `Component "${id}" not found` } }, 404);
  }

  const rewritten = rewriteImports(comp.code, { alias });
  return c.json({
    ...comp,
    code: rewritten,
  });
});

apiApp.post('/api/components:batch', async (c) => {
  const body = await c.req.json();
  const { ids = [], alias = '@/lib/utils' } = body;

  const results = ids.slice(0, 20).map((id: string) => {
    const comp = edgeDb.getComponent(id);
    if (!comp) return null;
    return {
      ...comp,
      code: rewriteImports(comp.code, { alias }),
    };
  }).filter(Boolean);

  return c.json({ components: results });
});

apiApp.post('/api/install-plan', async (c) => {
  const body = await c.req.json();
  const { ids = [], project = {} } = body;
  const host = c.req.header('host') || 'localhost:4777';

  const comps = ids.map((id: string) => edgeDb.getComponent(id)).filter(Boolean);
  const plan = generateInstallPlan(comps, project, host);
  return c.json(plan);
});

apiApp.get('/api/categories', (c) => {
  return c.json(edgeDb.getCategories());
});

apiApp.post('/api/requests', async (c) => {
  const body = await c.req.json();
  const { query, description } = body;

  if (!query) {
    return c.json({ error: { message: 'Missing query parameter' } }, 400);
  }

  const record = edgeDb.requestComponent(query, description);
  return c.json(record);
});

// --- Admin Endpoints ---

apiApp.post('/api/admin/tokens', async (c) => {
  const body = await c.req.json();
  const { name = 'Agent Token', scope = 'all' } = body;
  const created = edgeDb.createToken(name, scope);
  return c.json(created);
});

apiApp.get('/api/admin/tokens', (c) => {
  return c.json(edgeDb.listTokens());
});

apiApp.delete('/api/admin/tokens/:id', (c) => {
  const id = c.req.param('id');
  const success = edgeDb.revokeToken(id);
  return c.json({ success });
});

apiApp.get('/api/admin/usage', (c) => {
  return c.json(edgeDb.getUsage(100));
});

apiApp.get('/api/admin/wishlist', (c) => {
  return c.json(edgeDb.getWishlist());
});
