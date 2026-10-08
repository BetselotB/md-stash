export interface StashFile {
  id: string;
  title: string;
  filename: string;
  content: string;
  collectionId: string | null;
  tags: string[];
  pinned: boolean;
  size: number; // in bytes
  createdAt: number;
  updatedAt: number;
}

export interface Collection {
  id: string;
  name: string;
  color: string;
  icon: string;
  order: number;
  createdAt: number;
}

export interface Version {
  id: string;
  fileId: string;
  content: string;
  createdAt: number;
}

export interface Setting {
  key: string;
  value: unknown;
}

export type CopyMode = 'raw' | 'codeblock' | 'prompt';

export interface StorageQuotaInfo {
  usage: number;
  quota: number;
  persisted: boolean;
}
