import { db } from './schema';

export const settingsRepo = {
  async get<T>(key: string, defaultValue: T): Promise<T> {
    const item = await db.settings.get(key);
    return item ? (item.value as T) : defaultValue;
  },

  async set<T>(key: string, value: T): Promise<void> {
    await db.settings.put({ key, value });
  },

  async delete(key: string): Promise<void> {
    await db.settings.delete(key);
  },

  async clearAll(): Promise<void> {
    await db.settings.clear();
  },
};
