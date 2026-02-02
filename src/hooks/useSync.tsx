import { useState, useCallback } from 'react';
import { useSyncQueue } from './useSyncQueue';
import { useToast } from './use-toast';
import { db, SyncQueue } from '@/lib/db';

export function useSync() {
  const [syncing, setSyncing] = useState(false);
  const { queueItems, pendingCount, errorCount, updateQueueItem } = useSyncQueue();
  const { toast } = useToast();

  const syncItem = useCallback(async (item: SyncQueue) => {
    if (!item.id) return;

    try {
      await updateQueueItem(item.id, { status: 'ENVIANDO' });

      // TODO: Implement actual API call
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate success/error randomly for demo
      const success = Math.random() > 0.3;

      if (success) {
        await updateQueueItem(item.id!, { 
          status: 'CONCLUIDO',
          tentativas: item.tentativas + 1
        });
      } else {
        await updateQueueItem(item.id!, { 
          status: 'ERRO',
          tentativas: item.tentativas + 1,
          ultimoErro: 'Erro de conexão com o servidor'
        });
      }

      return success;
    } catch (error) {
      if (item.id) {
        await updateQueueItem(item.id, { 
          status: 'ERRO',
          tentativas: item.tentativas + 1,
          ultimoErro: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }
      return false;
    }
  }, [updateQueueItem]);

  const syncAll = useCallback(async () => {
    setSyncing(true);
    
    try {
      const pending = queueItems.filter(item => item.status === 'PENDENTE' || item.status === 'ERRO');
      
      let successCount = 0;
      let errorCount = 0;

      for (const item of pending) {
        const success = await syncItem(item);
        if (success) {
          successCount++;
        } else {
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast({
          title: 'Sincronização concluída',
          description: `${successCount} item(ns) sincronizado(s) com sucesso.${errorCount > 0 ? ` ${errorCount} falhou(aram).` : ''}`,
        });
      } else if (errorCount > 0) {
        toast({
          title: 'Erro na sincronização',
          description: `${errorCount} item(ns) falharam ao sincronizar.`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro na sincronização',
        description: 'Não foi possível sincronizar os dados.',
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  }, [queueItems, syncItem, toast]);

  const retryItem = useCallback(async (itemId: number) => {
    const item = queueItems.find(i => i.id === itemId);
    if (!item) return;

    await updateQueueItem(itemId, { status: 'PENDENTE' });
    const success = await syncItem(item);
    
    if (success) {
      toast({
        title: 'Item sincronizado',
        description: 'O item foi sincronizado com sucesso.',
      });
    } else {
      toast({
        title: 'Erro ao sincronizar',
        description: 'Não foi possível sincronizar o item.',
        variant: 'destructive',
      });
    }
  }, [queueItems, syncItem, updateQueueItem, toast]);

  const discardItem = useCallback(async (itemId: number) => {
    await db.syncQueue.delete(itemId);
    toast({
      title: 'Item descartado',
      description: 'O item foi removido da fila de sincronização.',
    });
  }, [toast]);

  return {
    syncing,
    pendingCount,
    errorCount,
    queueItems,
    syncAll,
    syncItem,
    retryItem,
    discardItem,
  };
}
