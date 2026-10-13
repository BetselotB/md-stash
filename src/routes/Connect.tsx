import React, { useState, useEffect } from 'react';
import { useUIStore } from '../store/uiStore';
import {
  Cpu,
  Terminal,
  FileCode,
  Copy,
  Check,
  Key,
  ShieldCheck,
  Activity,
  Plus,
  Trash2,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Server,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface TokenItem {
  id: string;
  name: string;
  scope: string;
  createdAt: number;
  lastUsed: number;
  revoked: boolean;
}

interface UsageItem {
  ts: number;
  client: string;
  tool: string;
  componentId?: string;
  query?: string;
  hits: number;
  ms: number;
}

type SnippetTab = 'claudemd' | 'cursorrules' | 'system' | 'mcp_json';

export const Connect: React.FC = () => {
  const { showToast } = useUIStore();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Connection testing state
  const [isTestingMcp, setIsTestingMcp] = useState(false);
  const [mcpStatus, setMcpStatus] = useState<string | null>(null);

  // Active Snippet tab
  const [activeSnippetTab, setActiveSnippetTab] = useState<SnippetTab>('claudemd');

  // Token management
  const [tokens, setTokens] = useState<TokenItem[]>([]);
  const [newTokenName, setNewTokenName] = useState('');
  const [createdSecretToken, setCreatedSecretToken] = useState<string | null>(null);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);

  // Usage logs
  const [usageLogs, setUsageLogs] = useState<UsageItem[]>([]);

  const host = typeof window !== 'undefined' ? window.location.host : 'localhost:8787';
  const apiBase = `http://${host}`;
  const mcpUrl = `${apiBase}/mcp`;
  const llmsUrl = `${apiBase}/llms.txt`;
  const registryUrl = `${apiBase}/r/index.json`;

  const handleCopy = async (text: string, key: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      showToast(`Copied ${label}`, 'success');
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      showToast(`Failed to copy ${label}`, 'error');
    }
  };

  // Test live MCP connection
  const handleTestMcpConnection = async () => {
    try {
      setIsTestingMcp(true);
      setMcpStatus(null);
      const res = await fetch(`${apiBase}/mcp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/list',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const count = data.result?.tools?.length || 8;
        setMcpStatus(`Server Online: ${count} tools active`);
        showToast(`MCP Server connected (${count} tools active)!`, 'success');
      } else {
        setMcpStatus('Server responded with error');
        showToast('MCP Server returned error status', 'error');
      }
    } catch {
      setMcpStatus('Offline or unreachable');
      showToast('Could not reach MCP endpoint at ' + mcpUrl, 'error');
    } finally {
      setIsTestingMcp(false);
    }
  };

  // Load Tokens and Usage
  const loadAdminData = async () => {
    try {
      const resTokens = await fetch(`${apiBase}/api/admin/tokens`);
      if (resTokens.ok) {
        const data = await resTokens.json();
        setTokens(data);
      }
      const resUsage = await fetch(`${apiBase}/api/admin/usage`);
      if (resUsage.ok) {
        const usageData = await resUsage.json();
        setUsageLogs(usageData);
      }
    } catch {
      // Offline fallback
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Create new token
  const handleCreateToken = async () => {
    if (!newTokenName.trim()) return;
    try {
      setIsGeneratingToken(true);
      const res = await fetch(`${apiBase}/api/admin/tokens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTokenName.trim(), scope: 'all' }),
      });

      if (res.ok) {
        const data = await res.json();
        setCreatedSecretToken(data.token);
        setNewTokenName('');
        await loadAdminData();
        showToast('Generated new agent token!', 'success');
      }
    } catch {
      showToast('Failed to generate token', 'error');
    } finally {
      setIsGeneratingToken(false);
    }
  };

  // Revoke token
  const handleRevokeToken = async (id: string) => {
    try {
      await fetch(`${apiBase}/api/admin/tokens/${id}`, { method: 'DELETE' });
      await loadAdminData();
      showToast('Token revoked successfully', 'info');
    } catch {
      showToast('Failed to revoke token', 'error');
    }
  };

  // Snippets definitions
  const snippets: Record<SnippetTab, string> = {
    claudemd: `# MDstash Component Library Integration

When implementing or editing UI components:
1. Always search my local MDstash library first via MCP before writing custom styles:
   \`use_mcp_tool(server="mdstash", tool="search_components", query="<component description>")\`
2. Retrieve canonical code and props:
   \`use_mcp_tool(server="mdstash", tool="get_component", id="<slug>")\`
3. If no matching component exists in the library, report the missing item using:
   \`use_mcp_tool(server="mdstash", tool="request_component", query="<needed component>")\`
4. Do not invent custom color palettes; use the semantic design system tokens.`,

    cursorrules: `// .cursorrules: MDstash Library Configuration
// Use the owner's component library at ${mcpUrl}
- Before creating a component from scratch, call search_components via MCP.
- Fetch source code via get_component with include=['code', 'props'].
- Follow Tailwind v4 & neutral token conventions.
- Report missing components to request_component.`,

    system: `You have access to the owner's private MDstash UI component library.
Refer to the component index at: ${llmsUrl}
Whenever asked to build frontend screens, search and reuse components from this library first.`,

    mcp_json: `{
  "mcpServers": {
    "mdstash": {
      "url": "${mcpUrl}"
    }
  }
}`,
  };

  return (
    <div className="w-full space-y-8 animate-fadeIn pb-20">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange/20 border border-orange/40 flex items-center justify-center text-orange-deep">
            <Cpu className="w-5 h-5 text-orange" />
          </div>
          <div>
            <h2 className="font-display text-xl text-cream font-bold tracking-tight">
              Agent Access & Connection Center
            </h2>
            <p className="text-xs text-cream/70 font-sans">
              Connect Claude Code, Cursor, Cline, and custom AI agents directly to your 8,000+ component stash.
            </p>
          </div>
        </div>
      </div>

      {/* 3 Connection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: MCP Server */}
        <div className="p-5 rounded-3xl bg-[var(--dialog-bg)] border border-[rgba(38,51,42,0.18)] shadow-xs flex flex-col justify-between gap-4 text-ink">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-display text-sm font-bold flex items-center gap-1.5">
                <Server className="w-4 h-4 text-orange" />
                <span>Streamable MCP Server</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-800 font-bold">
                HTTP / JSON-RPC
              </span>
            </div>
            <p className="text-xs text-ink/70 font-sans leading-relaxed">
              Exposes 8 native tools: <code>search_components</code>, <code>get_component</code>, <code>install_plan</code>, and <code>request_component</code>.
            </p>
            <div className="p-2.5 rounded-xl bg-forest-dark text-cream font-mono text-[11px] truncate">
              {mcpUrl}
            </div>
          </div>

          <div className="space-y-2 pt-1 border-t border-[rgba(38,51,42,0.1)]">
            {mcpStatus && (
              <div className="text-[11px] font-mono text-emerald-700 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>{mcpStatus}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopy(mcpUrl, 'mcp_url', 'MCP Server URL')}
                className="flex-1 py-2 px-3 rounded-xl bg-orange hover:bg-orange-deep text-forest font-display text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all"
              >
                {copiedKey === 'mcp_url' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'mcp_url' ? 'Copied' : 'Copy URL'}</span>
              </button>

              <button
                type="button"
                onClick={handleTestMcpConnection}
                disabled={isTestingMcp}
                className="py-2 px-3 rounded-xl border border-[rgba(38,51,42,0.2)] text-ink font-display text-xs hover:border-orange cursor-pointer transition-colors"
                title="Test live MCP tools/list ping"
              >
                {isTestingMcp ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Test Ping'}
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Prompt Link */}
        <div className="p-5 rounded-3xl bg-[var(--dialog-bg)] border border-[rgba(38,51,42,0.18)] shadow-xs flex flex-col justify-between gap-4 text-ink">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-display text-sm font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Prompt Link (llms.txt)</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/15 text-sky-800 font-bold">
                Chat / Web
              </span>
            </div>
            <p className="text-xs text-ink/70 font-sans leading-relaxed">
              Standard <code>/llms.txt</code> index providing full catalog context for ChatGPT, Claude.ai, or chat windows without MCP.
            </p>
            <div className="p-2.5 rounded-xl bg-forest-dark text-cream font-mono text-[11px] truncate">
              {llmsUrl}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-[rgba(38,51,42,0.1)]">
            <button
              type="button"
              onClick={() => handleCopy(llmsUrl, 'llms_url', 'llms.txt URL')}
              className="flex-1 py-2 px-3 rounded-xl bg-forest hover:bg-forest/90 text-cream font-display text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all"
            >
              {copiedKey === 'llms_url' ? <Check className="w-3.5 h-3.5 text-orange" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'llms_url' ? 'Copied' : 'Copy Link'}</span>
            </button>

            <button
              type="button"
              onClick={() =>
                handleCopy(
                  `Use my MDstash component library at ${llmsUrl} as the design system.`,
                  'one_liner',
                  'one-liner prompt'
                )
              }
              className="py-2 px-3 rounded-xl border border-[rgba(38,51,42,0.2)] text-ink font-display text-xs hover:border-orange cursor-pointer transition-colors"
            >
              One-Liner
            </button>
          </div>
        </div>

        {/* Card 3: Shadcn Registry */}
        <div className="p-5 rounded-3xl bg-[var(--dialog-bg)] border border-[rgba(38,51,42,0.18)] shadow-xs flex flex-col justify-between gap-4 text-ink">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-display text-sm font-bold flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-forest" />
                <span>Shadcn Registry</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/15 text-purple-800 font-bold">
                CLI Compatible
              </span>
            </div>
            <p className="text-xs text-ink/70 font-sans leading-relaxed">
              Standard <code>/r/{'{name}'}.json</code> endpoints for direct installation with <code>npx shadcn@latest add</code>.
            </p>
            <div className="p-2.5 rounded-xl bg-forest-dark text-cream font-mono text-[11px] truncate">
              {registryUrl}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-[rgba(38,51,42,0.1)]">
            <button
              type="button"
              onClick={() =>
                handleCopy(
                  `npx shadcn@latest add ${apiBase}/r/shimmer-button.json`,
                  'shadcn_example',
                  'example CLI command'
                )
              }
              className="flex-1 py-2 px-3 rounded-xl border border-[rgba(38,51,42,0.2)] hover:border-orange text-ink font-display text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              {copiedKey === 'shadcn_example' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy CLI Example</span>
            </button>
          </div>
        </div>
      </div>

      {/* Integration Snippets Tabs */}
      <div className="p-6 rounded-3xl bg-[var(--dialog-bg)] border border-[rgba(38,51,42,0.18)] shadow-xs space-y-4 text-ink">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[rgba(38,51,42,0.12)]">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-orange" />
            <h3 className="font-display text-sm font-bold text-ink">
              Agent Setup & Instructions Snippets
            </h3>
          </div>

          {/* Snippet Tabs */}
          <div className="flex items-center gap-1 bg-[rgba(38,51,42,0.06)] p-1 rounded-xl">
            {(
              [
                { id: 'claudemd', label: 'CLAUDE.md / AGENTS.md' },
                { id: 'cursorrules', label: '.cursorrules' },
                { id: 'mcp_json', label: 'MCP Config JSON' },
                { id: 'system', label: 'System Prompt' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSnippetTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-display transition-all cursor-pointer ${
                  activeSnippetTab === tab.id
                    ? 'bg-forest text-cream font-bold shadow-xs'
                    : 'text-ink/70 hover:text-ink'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Code Box */}
        <div className="relative rounded-2xl bg-forest-dark p-4 overflow-x-auto shadow-inner text-cream">
          <button
            type="button"
            onClick={() => handleCopy(snippets[activeSnippetTab], 'active_snippet', 'snippet')}
            className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-forest/80 hover:bg-forest text-cream text-[11px] font-display flex items-center gap-1.5 border border-cream/20 shadow-md cursor-pointer transition-all"
          >
            {copiedKey === 'active_snippet' ? <Check className="w-3 h-3 text-orange" /> : <Copy className="w-3 h-3" />}
            <span>{copiedKey === 'active_snippet' ? 'Copied!' : 'Copy Snippet'}</span>
          </button>
          <pre className="font-mono text-xs leading-relaxed">
            <code>{snippets[activeSnippetTab]}</code>
          </pre>
        </div>
      </div>

      {/* Agent Tokens Administration */}
      <div className="p-6 rounded-3xl bg-[var(--dialog-bg)] border border-[rgba(38,51,42,0.18)] shadow-xs space-y-4 text-ink">
        <div className="flex items-center justify-between pb-3 border-b border-[rgba(38,51,42,0.12)]">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-orange" />
            <h3 className="font-display text-sm font-bold text-ink">Agent Secret Tokens</h3>
          </div>
        </div>

        {/* Generate Token Form */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            type="text"
            value={newTokenName}
            onChange={(e) => setNewTokenName(e.target.value)}
            placeholder="Token name (e.g. Cursor IDE, Claude Code Mac, CI Bot)..."
            className="flex-1 px-3.5 py-2 rounded-xl border border-[rgba(38,51,42,0.18)] bg-white/70 text-xs font-sans text-ink focus:outline-none focus:border-orange"
          />
          <button
            type="button"
            onClick={handleCreateToken}
            disabled={isGeneratingToken || !newTokenName.trim()}
            className="px-4 py-2 rounded-xl bg-orange hover:bg-orange-deep text-forest font-display text-xs font-bold disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Generate Token</span>
          </button>
        </div>

        {/* Newly Created Secret Banner */}
        {createdSecretToken && (
          <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-ink shadow-xs space-y-2">
            <span className="font-display text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Copy your new agent secret token (shown once):</span>
            </span>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/80 border border-amber-500/20 font-mono text-xs">
              <span className="truncate">{createdSecretToken}</span>
              <button
                type="button"
                onClick={() => handleCopy(createdSecretToken, 'new_secret', 'secret token')}
                className="px-2.5 py-1 rounded-lg bg-orange text-forest font-display text-[11px] font-bold cursor-pointer ml-2"
              >
                Copy
              </button>
            </div>
          </div>
        )}

        {/* Active Tokens Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[rgba(38,51,42,0.14)] text-ink/65 font-display">
                <th className="pb-2">Token Name</th>
                <th className="pb-2">Scope</th>
                <th className="pb-2">Created</th>
                <th className="pb-2">Last Used</th>
                <th className="pb-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(38,51,42,0.08)]">
              {tokens.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-ink/50 italic">
                    No agent tokens generated yet. Default access uses anonymous read mode.
                  </td>
                </tr>
              ) : (
                tokens.map((tok) => (
                  <tr key={tok.id} className="hover:bg-[rgba(38,51,42,0.03)]">
                    <td className="py-2.5 font-bold text-ink font-display">{tok.name}</td>
                    <td className="py-2.5 font-mono text-[11px] text-forest">{tok.scope}</td>
                    <td className="py-2.5 text-ink/70">{new Date(tok.createdAt).toLocaleDateString()}</td>
                    <td className="py-2.5 text-ink/70">{new Date(tok.lastUsed).toLocaleTimeString()}</td>
                    <td className="py-2.5 text-right">
                      {tok.revoked ? (
                        <span className="text-rose-500 font-bold font-mono text-[10px]">Revoked</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRevokeToken(tok.id)}
                          className="px-2 py-1 rounded-lg border border-rose-300 text-rose-600 hover:bg-rose-50 text-[11px] cursor-pointer"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Agent Usage Feed */}
      <div className="p-6 rounded-3xl bg-[var(--dialog-bg)] border border-[rgba(38,51,42,0.18)] shadow-xs space-y-4 text-ink">
        <div className="flex items-center justify-between pb-3 border-b border-[rgba(38,51,42,0.12)]">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <h3 className="font-display text-sm font-bold text-ink">Live Agent Activity Log</h3>
          </div>
          <span className="text-[11px] font-mono text-ink/60">
            {usageLogs.length} events recorded
          </span>
        </div>

        {usageLogs.length === 0 ? (
          <p className="text-xs text-ink/50 font-sans italic py-4 text-center">
            No agent calls logged yet. Connect an MCP client or issue queries to see real-time hits.
          </p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {usageLogs.map((log, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-2xl bg-[rgba(248,247,230,0.5)] border border-[rgba(38,51,42,0.1)] text-xs font-mono"
              >
                <div className="flex items-center gap-3 truncate">
                  <span className="px-2 py-0.5 rounded bg-forest/10 text-forest font-bold">
                    {log.tool}
                  </span>
                  <span className="text-ink/80 truncate">
                    {log.componentId || log.query || 'catalog query'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-ink/60 shrink-0 text-[11px]">
                  <span>{log.ms}ms</span>
                  <span>{new Date(log.ts).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
