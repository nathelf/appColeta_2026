import { useLiveQuery } from 'dexie-react-hooks';
import { db, SyncQueue } from '@/lib/db';

export function useSyncQueue() {
  const queueItems = useLiveQuery(
    () => db.syncQueue
      .orderBy('prioridade')
      .reverse()
      .toArray()
  );

  const pendingCount = useLiveQuery(
    () => db.syncQueue
      .where('status')
      .equals('PENDENTE')
      .count()
  );

  const errorCount = useLiveQuery(
    () => db.syncQueue
      .where('status')
      .anyOf(['ERRO', 'CONFLITO'])
      .count()
  );

  const addToQueue = async (item: Omit<SyncQueue, 'id' | 'createdAt' | 'updatedAt'>) => {
    await db.syncQueue.add({
      ...item,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  };

  const removeFromQueue = async (id: number) => {
    await db.syncQueue.delete(id);
  };

  const updateQueueItem = async (id: number, updates: Partial<SyncQueue>) => {
    await db.syncQueue.update(id, {
      ...updates,
      updatedAt: new Date()
    });
  };

  const retryItem = async (id: number) => {
    await db.syncQueue.update(id, {
      status: 'PENDENTE',
      updatedAt: new Date()
    });
  };

  return {
    queueItems: queueItems || [],
    pendingCount: pendingCount || 0,
    errorCount: errorCount || 0,
    addToQueue,
    removeFromQueue,
    updateQueueItem,
    retryItem
  };
}
