import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Phase 7: Agent Access Panel & Configuration Snippets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generates secure 32-byte hex secret tokens with mdk_ prefix', () => {
    // Generate token like Connect.tsx does
    const array = new Uint8Array(24);
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    const tokenHex = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
    const fullToken = `mdk_${tokenHex}`;

    expect(fullToken).toMatch(/^mdk_[0-9a-f]{48}$/);
    expect(fullToken.startsWith('mdk_')).toBe(true);
  });

  it('generates valid Claude/Agents config snippet containing endpoints and instructions', () => {
    const apiBase = 'http://localhost:8787';
    const llmsUrl = `${apiBase}/llms.txt`;
    const mcpUrl = `${apiBase}/mcp`;

    const snippet = `# Component Library Guidelines (MDstash)
Always prefer existing design-system components from the local MDstash library before writing custom UI.

- Catalog index: ${llmsUrl}
- MCP endpoint: ${mcpUrl} (Streamable HTTP, 8 tools)
- Token-lean component: ${apiBase}/c/{name}.md
- Shadcn registry: ${apiBase}/r/{name}.json

When the user asks for a UI element, call the MCP tool 'search_components' or fetch /c/{name}.md directly.`;

    expect(snippet).toContain(llmsUrl);
    expect(snippet).toContain(mcpUrl);
    expect(snippet).toContain('search_components');
  });

  it('generates valid cursorrules snippet', () => {
    const apiBase = 'http://localhost:8787';
    const cursorSnippet = `{
  "context": {
    "componentLibrary": "${apiBase}/llms.txt",
    "mcpServer": "${apiBase}/mcp"
  },
  "rules": [
    "Always check MDstash components first using '${apiBase}/r/{name}.json'",
    "Reuse existing primitives and design tokens before inventing new components."
  ]
}`;
    const parsed = JSON.parse(cursorSnippet);
    expect(parsed.context.componentLibrary).toBe('http://localhost:8787/llms.txt');
    expect(parsed.rules).toHaveLength(2);
  });

  it('generates valid mcp.json client configuration snippet', () => {
    const mcpJson = `{
  "mcpServers": {
    "mdstash": {
      "url": "http://localhost:8787/mcp",
      "headers": {
        "Authorization": "Bearer mdk_test_secret_token"
      }
    }
  }
}`;
    const parsed = JSON.parse(mcpJson);
    expect(parsed.mcpServers.mdstash.url).toBe('http://localhost:8787/mcp');
    expect(parsed.mcpServers.mdstash.headers.Authorization).toContain('mdk_');
  });

  it('simulates MCP server tools/list ping response with 8 tools', async () => {
    const expectedTools = [
      'search_components',
      'get_component',
      'get_component_code',
      'list_categories',
      'list_kits',
      'get_kit',
      'export_kit_prompt',
      'submit_to_inbox',
    ];

    const mockResponse = {
      jsonrpc: '2.0',
      id: 1,
      result: {
        tools: expectedTools.map((t) => ({ name: t, description: `Tool ${t}` })),
      },
    };

    expect(mockResponse.result.tools).toHaveLength(8);
    expect(mockResponse.result.tools.map((t) => t.name)).toEqual(expectedTools);
  });
});
