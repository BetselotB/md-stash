import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { ComponentMetadata } from '../domain/componentTypes';

export interface TokenRecord {
  id: string;
  name: string;
  hash: string;
  scope: string; // 'all' | 'kits:[slugs]'
  createdAt: number;
  lastUsed: number;
  revoked: boolean;
}

export interface UsageRecord {
  ts: number;
  tokenId: string;
  client: string;
  tool: string;
  componentId?: string;
  query?: string;
  hits: number;
  ms: number;
}

export interface WishlistRecord {
  id: string;
  query: string;
  description?: string;
  count: number;
  status: 'pending' | 'completed' | 'dismissed';
  firstSeen: number;
  lastSeen: number;
}

export interface ComponentRecord extends ComponentMetadata {
  code: string;
  usage?: string;
  props?: any[];
  deps: string[];
  dependsOn: string[];
  shared: string[];
}

class EdgeDatabase {
  private components: Map<string, ComponentRecord> = new Map();
  private tokens: Map<string, TokenRecord> = new Map();
  private usage: UsageRecord[] = [];
  private wishlist: Map<string, WishlistRecord> = new Map();

  constructor() {
    this.seedFromDisk();
  }

  private seedFromDisk() {
    try {
      const publicDir = path.join(process.cwd(), 'public');
      const pilotCatalogPath = path.join(publicDir, 'pilot-catalog.json');
      const registryDir = path.join(publicDir, 'r');

      if (fs.existsSync(pilotCatalogPath)) {
        const metas: ComponentMetadata[] = JSON.parse(
          fs.readFileSync(pilotCatalogPath, 'utf8')
        );

        for (const meta of metas) {
          let code = `export function ${meta.name.replace(/[^a-zA-Z0-9]/g, '')}() {\n  return <div>${meta.name}</div>;\n}`;
          let usage = `<${meta.name.replace(/[^a-zA-Z0-9]/g, '')} />`;
          let deps = meta.requires || [];
          let props: any[] = [];

          // Try reading registry JSON if available
          const regPath = path.join(registryDir, `${meta.id}.json`);
          if (fs.existsSync(regPath)) {
            try {
              const regItem = JSON.parse(fs.readFileSync(regPath, 'utf8'));
              if (regItem.files && regItem.files[0]) {
                code = regItem.files[0].content;
              }
              if (regItem.dependencies) {
                deps = regItem.dependencies;
              }
            } catch {}
          }

          this.components.set(meta.id, {
            ...meta,
            code,
            usage,
            props,
            deps,
            dependsOn: [],
            shared: ['utils/cn'],
          });
        }
      }
    } catch (err) {
      console.warn('EdgeDatabase seed error:', err);
    }
  }

  // --- Components ---

  getComponent(id: string): ComponentRecord | undefined {
    return this.components.get(id);
  }

  getAllComponents(): ComponentRecord[] {
    return Array.from(this.components.values());
  }

  searchComponents(query: string, options: {
    category?: string;
    tag?: string;
    kind?: string;
    styling?: string;
    limit?: number;
  } = {}): { results: Array<ComponentRecord & { score: number }>; total: number } {
    const q = query.toLowerCase().trim();
    const limit = options.limit || 8;

    const matched: Array<ComponentRecord & { score: number }> = [];

    for (const comp of this.components.values()) {
      if (options.category && comp.category !== options.category) continue;
      if (options.tag && !comp.tags.includes(options.tag)) continue;
      if (options.kind && comp.kind !== options.kind) continue;
      if (options.styling && options.styling !== 'any' && comp.styling !== options.styling) continue;

      let score = 0;
      const lowerName = comp.name.toLowerCase();
      const lowerDesc = comp.description.toLowerCase();
      const tagsStr = comp.tags.join(' ').toLowerCase();

      if (lowerName === q) score += 20;
      else if (lowerName.includes(q)) score += 10;
      if (tagsStr.includes(q)) score += 5;
      if (lowerDesc.includes(q)) score += 3;

      // Ranking boosts per 02-API-AND-MCP-SPEC.md §6
      if (comp.favorite) score *= 1.5;
      if (comp.previewStatus === 'ready') score *= 1.15;
      if (comp.styling === 'tailwind') score *= 1.2;

      if (score > 0 || !q) {
        matched.push({ ...comp, score: score || 1 });
      }
    }

    matched.sort((a, b) => b.score - a.score);
    return {
      results: matched.slice(0, limit),
      total: matched.length,
    };
  }

  getCategories(): Array<{ category: string; count: number; topTags: string[] }> {
    const counts: Record<string, { count: number; tags: Record<string, number> }> = {};

    for (const comp of this.components.values()) {
      if (!counts[comp.category]) {
        counts[comp.category] = { count: 0, tags: {} };
      }
      counts[comp.category].count++;
      for (const tag of comp.tags) {
        counts[comp.category].tags[tag] = (counts[comp.category].tags[tag] || 0) + 1;
      }
    }

    return Object.entries(counts).map(([cat, data]) => ({
      category: cat,
      count: data.count,
      topTags: Object.entries(data.tags)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([t]) => t),
    }));
  }

  // --- Tokens ---

  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  createToken(name: string, scope = 'all'): { token: string; record: TokenRecord } {
    const rawBytes = crypto.randomBytes(24).toString('base64url');
    const token = `mdk_${rawBytes}`;
    const hash = this.hashToken(token);
    const id = `tok_${crypto.randomBytes(8).toString('hex')}`;

    const record: TokenRecord = {
      id,
      name,
      hash,
      scope,
      createdAt: Date.now(),
      lastUsed: Date.now(),
      revoked: false,
    };

    this.tokens.set(hash, record);
    return { token, record };
  }

  verifyToken(token: string): TokenRecord | null {
    const hash = this.hashToken(token);
    const record = this.tokens.get(hash);
    if (!record || record.revoked) return null;

    record.lastUsed = Date.now();
    return record;
  }

  revokeToken(id: string): boolean {
    for (const record of this.tokens.values()) {
      if (record.id === id) {
        record.revoked = true;
        return true;
      }
    }
    return false;
  }

  listTokens(): TokenRecord[] {
    return Array.from(this.tokens.values());
  }

  // --- Usage Logging ---

  logUsage(entry: Omit<UsageRecord, 'ts'>) {
    this.usage.push({
      ...entry,
      ts: Date.now(),
    });
  }

  getUsage(limit = 100): UsageRecord[] {
    return this.usage.slice(-limit).reverse();
  }

  // --- Wishlist ---

  requestComponent(query: string, description?: string): WishlistRecord {
    const id = `wish_${query.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const existing = this.wishlist.get(id);

    if (existing) {
      existing.count++;
      existing.lastSeen = Date.now();
      if (description && !existing.description) existing.description = description;
      return existing;
    }

    const record: WishlistRecord = {
      id,
      query,
      description,
      count: 1,
      status: 'pending',
      firstSeen: Date.now(),
      lastSeen: Date.now(),
    };
    this.wishlist.set(id, record);
    return record;
  }

  getWishlist(): WishlistRecord[] {
    return Array.from(this.wishlist.values()).sort((a, b) => b.count - a.count);
  }
}

export const edgeDb = new EdgeDatabase();
