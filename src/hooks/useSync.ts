import { useState, useEffect, useCallback } from 'react';
import { cloudSync, SyncStatus } from '../services/cloudSync';
import { auth, signOut as fbSignOut, User } from '../services/firebase';

export interface UseSyncReturn {
  user: User | null;
  status: SyncStatus;
  lastSyncedAt: number | null;
  syncNow: () => Promise<void>;
  signOut: () => Promise<void>;
}

export function useSync(): UseSyncReturn {
  const [user, setUser] = useState<User | null>(cloudSync.getCurrentUser());
  const [status, setStatus] = useState<SyncStatus>(cloudSync.getStatus());
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(cloudSync.getLastSyncedAt());

  useEffect(() => {
    const unsubscribe = cloudSync.subscribe((newStatus, newUser, newLastSyncedAt) => {
      setStatus(newStatus);
      setUser(newUser);
      setLastSyncedAt(newLastSyncedAt);
    });
    return unsubscribe;
  }, []);

  const syncNow = useCallback(async () => {
    if (user) {
      await cloudSync.runFullMerge();
    }
  }, [user]);

  const signOut = useCallback(async () => {
    await fbSignOut(auth);
  }, []);

  return {
    user,
    status,
    lastSyncedAt,
    syncNow,
    signOut,
  };
}
