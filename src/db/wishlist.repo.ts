import { db } from './schema';
import { WishlistItem } from '../domain/componentTypes';

export const wishlistRepo = {
  async getAll(): Promise<WishlistItem[]> {
    const items = await db.wishlist.toArray();
    return items.sort((a, b) => b.count - a.count || b.lastSeen - a.lastSeen);
  },

  async getPending(): Promise<WishlistItem[]> {
    const items = await db.wishlist.where('status').equals('pending').toArray();
    return items.sort((a, b) => b.count - a.count || b.lastSeen - a.lastSeen);
  },

  async getById(id: string): Promise<WishlistItem | undefined> {
    return await db.wishlist.get(id);
  },

  async addOrIncrement(query: string, description?: string): Promise<WishlistItem> {
    const normalized = query.trim().toLowerCase();
    const existing = await db.wishlist.filter((w) => w.query.toLowerCase() === normalized).first();

    const now = Date.now();
    if (existing) {
      const updated: WishlistItem = {
        ...existing,
        count: existing.count + 1,
        lastSeen: now,
        description: description || existing.description,
      };
      await db.wishlist.put(updated);
      return updated;
    }

    const newItem: WishlistItem = {
      id: `wish-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      query: query.trim(),
      description,
      count: 1,
      status: 'pending',
      firstSeen: now,
      lastSeen: now,
    };
    await db.wishlist.put(newItem);
    return newItem;
  },

  async updateStatus(id: string, status: 'pending' | 'completed' | 'dismissed'): Promise<void> {
    await db.wishlist.update(id, { status, lastSeen: Date.now() });
  },

  async delete(id: string): Promise<void> {
    await db.wishlist.delete(id);
  },

  async countPending(): Promise<number> {
    return await db.wishlist.where('status').equals('pending').count();
  },

  async clear(): Promise<void> {
    await db.wishlist.clear();
  },
};
