import {
  auth,
  firestore,
  onAuthStateChanged,
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  writeBatch,
  User,
} from './firebase';
import { db } from '../db/schema';
import { StashFile, Collection } from '../domain/types';

export type SyncStatus = 'disconnected' | 'syncing' | 'synced' | 'error';

type SyncListener = (status: SyncStatus, user: User | null, lastSyncedAt: number | null) => void;

class CloudSyncService {
  private currentUser: User | null = null;
  private unsubscribeFiles: (() => void) | null = null;
  private unsubscribeCollections: (() => void) | null = null;
  private listeners: Set<SyncListener> = new Set();
  private status: SyncStatus = 'disconnected';
  private lastSyncedAt: number | null = null;
  private isInitialSyncDone = false;
  private isProcessingRemoteChange = false;

  constructor() {
    this.initAuthListener();
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    listener(this.status, this.currentUser, this.lastSyncedAt);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.status, this.currentUser, this.lastSyncedAt);
      } catch (err) {
        console.error('Error in sync listener:', err);
      }
    }
  }

  private setStatus(status: SyncStatus) {
    this.status = status;
    this.notify();
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public getStatus(): SyncStatus {
    return this.status;
  }

  public getLastSyncedAt(): number | null {
    return this.lastSyncedAt;
  }

  private initAuthListener() {
    onAuthStateChanged(auth, async (user) => {
      this.currentUser = user;
      if (user) {
        this.setStatus('syncing');
        await this.startSyncSession(user);
      } else {
        this.stopSyncSession();
        this.setStatus('disconnected');
      }
    });
  }

  private async startSyncSession(user: User) {
    try {
      this.setStatus('syncing');
      await this.runFullMerge(user);
      this.startRealtimeListeners(user);
      this.lastSyncedAt = Date.now();
      this.setStatus('synced');
    } catch (err) {
      console.error('CloudSync: Failed to initialize session:', err);
      this.setStatus('error');
    }
  }

  private stopSyncSession() {
    if (this.unsubscribeFiles) {
      this.unsubscribeFiles();
      this.unsubscribeFiles = null;
    }
    if (this.unsubscribeCollections) {
      this.unsubscribeCollections();
      this.unsubscribeCollections = null;
    }
    this.isInitialSyncDone = false;
  }

  /**
   * Bi-directional merge on login:
   * 1. Pull remote items and write into Dexie if remote is newer or local is missing.
   * 2. Push any local items that don't exist remotely or are newer locally.
   */
  public async runFullMerge(targetUser?: User): Promise<void> {
    const user = targetUser || this.currentUser;
    if (!user) return;

    this.setStatus('syncing');

    try {
      // 1. Collections merge
      const remoteColsSnap = await getDocs(
        collection(firestore, 'users', user.uid, 'collections')
      );
      const remoteColsMap = new Map<string, Collection>();
      remoteColsSnap.forEach((d) => {
        remoteColsMap.set(d.id, d.data() as Collection);
      });

      const localCols = await db.collections.toArray();
      const localColsMap = new Map<string, Collection>();
      localCols.forEach((c) => localColsMap.set(c.id, c));

      // Remote -> Local
      for (const [colId, remoteCol] of remoteColsMap.entries()) {
        const localCol = localColsMap.get(colId);
        if (!localCol || (remoteCol.createdAt || 0) > (localCol.createdAt || 0)) {
          await db.collections.put(remoteCol);
        }
      }

      // Local -> Remote
      for (const [colId, localCol] of localColsMap.entries()) {
        if (!remoteColsMap.has(colId)) {
          await setDoc(doc(firestore, 'users', user.uid, 'collections', colId), {
            id: localCol.id,
            name: localCol.name,
            color: localCol.color,
            icon: localCol.icon,
            order: localCol.order,
            createdAt: localCol.createdAt,
          });
        }
      }

      // 2. Files merge
      const remoteFilesSnap = await getDocs(
        collection(firestore, 'users', user.uid, 'files')
      );
      const remoteFilesMap = new Map<string, StashFile>();
      remoteFilesSnap.forEach((d) => {
        remoteFilesMap.set(d.id, d.data() as StashFile);
      });

      const localFiles = await db.files.toArray();
      const localFilesMap = new Map<string, StashFile>();
      localFiles.forEach((f) => localFilesMap.set(f.id, f));

      // Remote -> Local
      for (const [fileId, remoteFile] of remoteFilesMap.entries()) {
        const localFile = localFilesMap.get(fileId);
        if (!localFile || remoteFile.updatedAt >= localFile.updatedAt) {
          await db.files.put({
            ...remoteFile,
            collectionId: remoteFile.collectionId ?? null,
            tags: remoteFile.tags || [],
          });
        }
      }

      // Local -> Remote (upload existing local files that aren't on remote yet)
      const starterId = 'starter-mdstash-note';
      const hasRealRemoteFiles = Array.from(remoteFilesMap.keys()).some((id) => id !== starterId);

      for (const [fileId, localFile] of localFilesMap.entries()) {
        // If user already had real files in cloud, don't push starter note to cloud
        if (fileId === starterId && hasRealRemoteFiles) {
          await db.files.delete(starterId);
          continue;
        }

        const remoteFile = remoteFilesMap.get(fileId);
        if (!remoteFile || localFile.updatedAt > remoteFile.updatedAt) {
          await this.uploadFileDoc(user.uid, localFile);
        }
      }

      // Clean up local starter note if cloud already had real files
      if (hasRealRemoteFiles) {
        await db.files.delete(starterId);
      }

      this.lastSyncedAt = Date.now();
      this.setStatus('synced');
    } catch (err) {
      console.error('CloudSync: runFullMerge error:', err);
      this.setStatus('error');
      throw err;
    }
  }

  private startRealtimeListeners(user: User) {
    if (this.unsubscribeFiles) this.unsubscribeFiles();
    if (this.unsubscribeCollections) this.unsubscribeCollections();

    // Files realtime listener
    this.unsubscribeFiles = onSnapshot(
      collection(firestore, 'users', user.uid, 'files'),
      async (snapshot) => {
        if (!snapshot.docChanges().length) return;

        this.isProcessingRemoteChange = true;
        try {
          for (const change of snapshot.docChanges()) {
            // Ignore optimistic local writes
            if (change.doc.metadata.hasPendingWrites) continue;

            const fileId = change.doc.id;
            if (change.type === 'removed') {
              await db.files.delete(fileId);
            } else {
              const remoteFile = change.doc.data() as StashFile;
              const localFile = await db.files.get(fileId);

              if (!localFile || remoteFile.updatedAt >= localFile.updatedAt) {
                await db.files.put({
                  ...remoteFile,
                  collectionId: remoteFile.collectionId ?? null,
                  tags: remoteFile.tags || [],
                });
              }
            }
          }
          this.lastSyncedAt = Date.now();
          this.setStatus('synced');
        } catch (err) {
          console.error('CloudSync: Error applying remote file changes:', err);
        } finally {
          this.isProcessingRemoteChange = false;
        }
      },
      (error) => {
        console.warn('CloudSync: Files snapshot error:', error);
        this.setStatus('error');
      }
    );

    // Collections realtime listener
    this.unsubscribeCollections = onSnapshot(
      collection(firestore, 'users', user.uid, 'collections'),
      async (snapshot) => {
        if (!snapshot.docChanges().length) return;

        this.isProcessingRemoteChange = true;
        try {
          for (const change of snapshot.docChanges()) {
            if (change.doc.metadata.hasPendingWrites) continue;

            const colId = change.doc.id;
            if (change.type === 'removed') {
              await db.collections.delete(colId);
            } else {
              const remoteCol = change.doc.data() as Collection;
              await db.collections.put(remoteCol);
            }
          }
          this.lastSyncedAt = Date.now();
          this.setStatus('synced');
        } catch (err) {
          console.error('CloudSync: Error applying remote collection changes:', err);
        } finally {
          this.isProcessingRemoteChange = false;
        }
      },
      (error) => {
        console.warn('CloudSync: Collections snapshot error:', error);
        this.setStatus('error');
      }
    );

    this.isInitialSyncDone = true;
  }

  private cleanFileData(file: StashFile): Record<string, unknown> {
    return {
      id: file.id,
      title: file.title || file.filename,
      filename: file.filename,
      content: file.content || '',
      collectionId: file.collectionId ?? null,
      tags: file.tags || [],
      pinned: Boolean(file.pinned),
      size: typeof file.size === 'number' ? file.size : (file.content?.length || 0),
      createdAt: file.createdAt || Date.now(),
      updatedAt: file.updatedAt || Date.now(),
    };
  }

  private async uploadFileDoc(uid: string, file: StashFile): Promise<void> {
    const data = this.cleanFileData(file);
    await setDoc(doc(firestore, 'users', uid, 'files', file.id), data);
  }

  // --- Public hooks called by filesRepo and collectionsRepo ---

  public async pushFile(file: StashFile): Promise<void> {
    if (!this.currentUser || this.isProcessingRemoteChange) return;
    try {
      await this.uploadFileDoc(this.currentUser.uid, file);
      this.lastSyncedAt = Date.now();
      this.setStatus('synced');
    } catch (err) {
      console.error('CloudSync: pushFile error:', err);
    }
  }

  public async pushFileUpdate(id: string, updates: Partial<StashFile>): Promise<void> {
    if (!this.currentUser || this.isProcessingRemoteChange) return;
    try {
      const full = await db.files.get(id);
      if (full) {
        await this.uploadFileDoc(this.currentUser.uid, full);
      } else {
        const cleanUpdates: Record<string, unknown> = { ...updates, updatedAt: Date.now() };
        if (cleanUpdates.collectionId === undefined) {
          delete cleanUpdates.collectionId;
        }
        await setDoc(
          doc(firestore, 'users', this.currentUser.uid, 'files', id),
          cleanUpdates,
          { merge: true }
        );
      }
      this.lastSyncedAt = Date.now();
      this.setStatus('synced');
    } catch (err) {
      console.error('CloudSync: pushFileUpdate error:', err);
    }
  }

  public async removeFile(id: string): Promise<void> {
    if (!this.currentUser || this.isProcessingRemoteChange) return;
    try {
      await deleteDoc(doc(firestore, 'users', this.currentUser.uid, 'files', id));
      this.lastSyncedAt = Date.now();
      this.setStatus('synced');
    } catch (err) {
      console.error('CloudSync: removeFile error:', err);
    }
  }

  public async removeFiles(ids: string[]): Promise<void> {
    if (!this.currentUser || this.isProcessingRemoteChange || ids.length === 0) return;
    try {
      const batch = writeBatch(firestore);
      for (const id of ids) {
        batch.delete(doc(firestore, 'users', this.currentUser.uid, 'files', id));
      }
      await batch.commit();
      this.lastSyncedAt = Date.now();
      this.setStatus('synced');
    } catch (err) {
      console.error('CloudSync: removeFiles error:', err);
    }
  }

  public async pushCollection(collectionData: Collection): Promise<void> {
    if (!this.currentUser || this.isProcessingRemoteChange) return;
    try {
      await setDoc(
        doc(firestore, 'users', this.currentUser.uid, 'collections', collectionData.id),
        {
          id: collectionData.id,
          name: collectionData.name,
          color: collectionData.color,
          icon: collectionData.icon,
          order: collectionData.order,
          createdAt: collectionData.createdAt,
        }
      );
      this.lastSyncedAt = Date.now();
      this.setStatus('synced');
    } catch (err) {
      console.error('CloudSync: pushCollection error:', err);
    }
  }

  public async pushCollectionUpdate(id: string, updates: Partial<Collection>): Promise<void> {
    if (!this.currentUser || this.isProcessingRemoteChange) return;
    try {
      await setDoc(
        doc(firestore, 'users', this.currentUser.uid, 'collections', id),
        updates,
        { merge: true }
      );
      this.lastSyncedAt = Date.now();
      this.setStatus('synced');
    } catch (err) {
      console.error('CloudSync: pushCollectionUpdate error:', err);
    }
  }

  public async removeCollection(id: string): Promise<void> {
    if (!this.currentUser || this.isProcessingRemoteChange) return;
    try {
      await deleteDoc(doc(firestore, 'users', this.currentUser.uid, 'collections', id));
      this.lastSyncedAt = Date.now();
      this.setStatus('synced');
    } catch (err) {
      console.error('CloudSync: removeCollection error:', err);
    }
  }

  public async pushCollectionsReorder(orderedIds: string[]): Promise<void> {
    if (!this.currentUser || this.isProcessingRemoteChange) return;
    try {
      const batch = writeBatch(firestore);
      orderedIds.forEach((id, index) => {
        batch.set(
          doc(firestore, 'users', this.currentUser!.uid, 'collections', id),
          { order: index },
          { merge: true }
        );
      });
      await batch.commit();
      this.lastSyncedAt = Date.now();
      this.setStatus('synced');
    } catch (err) {
      console.error('CloudSync: pushCollectionsReorder error:', err);
    }
  }
}

export const cloudSync = new CloudSyncService();
