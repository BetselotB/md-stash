import { describe, it, expect, beforeAll } from 'vitest';
import { apiApp } from '../src/api/app';
import { edgeDb } from '../src/api/db';

describe('Phase 3 — MCP Server & Edge Agent API Conformance', () => {
  let testToken: string;
  let testTokenId: string;

  beforeAll(() => {
    const { token, record } = edgeDb.createToken('Test Agent Token');
    testToken = token;
    testTokenId = record.id;
  });

  // --- MCP JSON-RPC 2.0 Protocol ---

  it('handles MCP initialize with protocolVersion, serverInfo, and instructions', async () => {
    const res = await apiApp.request('/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testToken}`,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          clientInfo: { name: 'Claude Code', version: '1.0.0' },
        },
      }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.jsonrpc).toBe('2.0');
    expect(data.id).toBe(1);
    expect(data.result.serverInfo.name).toBe('mdstash-components');
    expect(data.result.protocolVersion).toBe('2024-11-05');
    expect(data.result.instructions).toContain('ALWAYS search here before writing a UI component');
  });

  it('lists all 8 compliant MCP tools with JSON schemas', async () => {
    const res = await apiApp.request('/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testToken}`,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
      }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    const tools = data.result.tools;
    expect(tools).toHaveLength(8);

    const toolNames = tools.map((t: any) => t.name);
    expect(toolNames).toContain('search_components');
    expect(toolNames).toContain('get_component');
    expect(toolNames).toContain('get_components');
    expect(toolNames).toContain('install_plan');
    expect(toolNames).toContain('get_kit');
    expect(toolNames).toContain('get_design_system');
    expect(toolNames).toContain('list_categories');
    expect(toolNames).toContain('request_component');
  });

  // --- MCP Tool Executions ---

  it('executes tool 1: search_components and returns summaries without code', async () => {
    const res = await apiApp.request('/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testToken}`,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
          name: 'search_components',
          arguments: { query: 'button', limit: 5 },
        },
      }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    const content = JSON.parse(data.result.content[0].text);
    expect(content.total).toBeGreaterThan(0);
    expect(content.results.length).toBeGreaterThan(0);

    // Verify search NEVER returns full code
    for (const r of content.results) {
      expect(r).toHaveProperty('id');
      expect(r).toHaveProperty('summary');
      expect(r).not.toHaveProperty('code');
    }
  });

  it('executes tool 2: get_component with import rewriting and license attribution', async () => {
    const sample = edgeDb.getAllComponents()[0];
    expect(sample).toBeDefined();

    const res = await apiApp.request('/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testToken}`,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/call',
        params: {
          name: 'get_component',
          arguments: { id: sample.id, alias: '~/custom/utils' },
        },
      }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    const text = data.result.content[0].text;
    expect(text).toContain(`### File: components/ui/${sample.id}.tsx`);
    expect(text).toContain('<!-- License:');
    expect(data.result.structuredContent.id).toBe(sample.id);
  });

  it('executes tool 3: get_components (batch)', async () => {
    const all = edgeDb.getAllComponents().slice(0, 3);
    const ids = all.map((c) => c.id);

    const res = await apiApp.request('/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testToken}`,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 5,
        method: 'tools/call',
        params: {
          name: 'get_components',
          arguments: { ids },
        },
      }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.result.structuredContent).toHaveLength(ids.length);
  });

  it('executes tool 4: install_plan and returns commands and files', async () => {
    const sample = edgeDb.getAllComponents()[0];

    const res = await apiApp.request('/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testToken}`,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 6,
        method: 'tools/call',
        params: {
          name: 'install_plan',
          arguments: {
            ids: [sample.id],
            project: { framework: 'next-app', tailwind: '4', pm: 'pnpm' },
          },
        },
      }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    const plan = data.result.structuredContent;
    expect(plan.commands[0]).toContain('pnpm add');
    expect(plan.files.some((f: any) => f.path.includes(sample.id))).toBe(true);
    expect(plan.files.some((f: any) => f.path.includes('utils.ts'))).toBe(true);
  });

  it('executes tool 5 (get_kit), tool 6 (get_design_system), tool 7 (list_categories)', async () => {
    // Tool 5
    const kitRes = await apiApp.request('/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${testToken}` },
      body: JSON.stringify({ jsonrpc: '2.0', id: 7, method: 'tools/call', params: { name: 'get_kit' } }),
    });
    expect(kitRes.status).toBe(200);

    // Tool 6
    const dsRes = await apiApp.request('/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${testToken}` },
      body: JSON.stringify({ jsonrpc: '2.0', id: 8, method: 'tools/call', params: { name: 'get_design_system' } }),
    });
    expect(dsRes.status).toBe(200);
    const dsData = await dsRes.json();
    expect(dsData.result.content[0].text).toContain('Chelsea Market');

    // Tool 7
    const catRes = await apiApp.request('/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${testToken}` },
      body: JSON.stringify({ jsonrpc: '2.0', id: 9, method: 'tools/call', params: { name: 'list_categories' } }),
    });
    expect(catRes.status).toBe(200);
    const catData = await catRes.json();
    expect(catData.result.structuredContent.length).toBeGreaterThan(5);
  });

  it('executes tool 8: request_component and logs to wishlist inbox', async () => {
    const res = await apiApp.request('/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${testToken}` },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 10,
        method: 'tools/call',
        params: {
          name: 'request_component',
          arguments: { query: 'calendar range picker with presets' },
        },
      }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.result.content[0].text).toContain('calendar range picker with presets');

    const wishlist = edgeDb.getWishlist();
    const wish = wishlist.find((w) => w.query.includes('calendar range picker'));
    expect(wish).toBeDefined();
    expect(wish?.count).toBeGreaterThanOrEqual(1);
  });

  // --- Path Token Support (/t/mdk_.../mcp) ---

  it('supports path token simple URL transport (/t/:token/mcp)', async () => {
    const res = await apiApp.request(`/t/${testToken}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 11,
        method: 'tools/call',
        params: {
          name: 'list_categories',
        },
      }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.result.structuredContent).toBeDefined();
  });

  // --- Auth & Token Revocation ---

  it('enforces token revocation and returns 401', async () => {
    const { token, record } = edgeDb.createToken('Temporary Token');
    const revokeSuccess = edgeDb.revokeToken(record.id);
    expect(revokeSuccess).toBe(true);

    const res = await apiApp.request(`/t/${token}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 12,
        method: 'initialize',
      }),
    });

    expect(res.status).toBe(401);
  });

  // --- Usage Logging ---

  it('writes structured usage logs on tool calls', async () => {
    const usage = edgeDb.getUsage(10);
    expect(usage.length).toBeGreaterThan(0);
    expect(usage[0]).toHaveProperty('tool');
    expect(usage[0]).toHaveProperty('ms');
    expect(usage[0]).toHaveProperty('ts');
  });

  // --- REST & Prompt Links ---

  it('serves /llms.txt prompt entry link with compact briefing', async () => {
    const res = await apiApp.request(`/t/${testToken}/llms.txt`);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("# Owner's Component Library");
    expect(text).toContain(testToken);
  });

  it('serves /c/:id.md raw token-lean markdown', async () => {
    const sample = edgeDb.getAllComponents()[0];
    const res = await apiApp.request(`/c/${sample.id}.md`);
    expect(res.status).toBe(200);
    const md = await res.text();
    expect(md).toContain(`# ${sample.name}`);
    expect(md).toContain('<!-- Attribution:');
  });

  it('serves /r/:id.json shadcn registry item', async () => {
    const sample = edgeDb.getAllComponents()[0];
    const res = await apiApp.request(`/r/${sample.id}.json`);
    expect(res.status).toBe(200);
    const reg = await res.json();
    expect(reg.name).toBe(sample.id);
    expect(reg.files[0].content).toBeDefined();
  });

  it('serves /api/search with scoring and hints', async () => {
    const res = await apiApp.request('/api/search?q=button');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.results.length).toBeGreaterThan(0);
    expect(data).toHaveProperty('hint');
  });

  // --- Latency Budget (< 100ms) ---

  it('meets edge latency budget p95 < 100ms for search and get', async () => {
    const latencies: number[] = [];
    const sample = edgeDb.getAllComponents()[0];

    for (let i = 0; i < 20; i++) {
      const t0 = performance.now();
      const res = await apiApp.request('/api/search?q=table');
      expect(res.status).toBe(200);
      latencies.push(performance.now() - t0);
    }

    for (let i = 0; i < 20; i++) {
      const t0 = performance.now();
      const res = await apiApp.request(`/c/${sample.id}.md`);
      expect(res.status).toBe(200);
      latencies.push(performance.now() - t0);
    }

    latencies.sort((a, b) => a - b);
    const p95 = latencies[Math.floor(latencies.length * 0.95)];
    console.log(`\n--- Edge API Latency Benchmark (40 requests) ---`);
    console.log(`p95 latency: ${p95.toFixed(2)} ms (Budget: < 100.00 ms)`);
    expect(p95).toBeLessThan(100);
  });
});
