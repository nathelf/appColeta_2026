import { useState, useCallback } from 'react';
import { useSyncQueue } from './useSyncQueue';
import { useToast } from './use-toast';
import { db, SyncQueue } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

// Detectar URL do backend: 
// - Em localhost: usar '' (proxy do Vite)
// - Em produção/túnel: usar sempre a mesma origin (backend está servindo o frontend estático)
const getApiBaseUrl = () => {
  // Se estiver rodando em localhost, usar '' (proxy do Vite em dev)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return '';
  }
  
  // Em produção (túnel Cloudflare ou outro), todas as requisições vão para a mesma origin
  // pois o backend está servindo o frontend estático
  return '';
};

const API_BASE_URL = getApiBaseUrl();

const camelToSnake = (value: string) =>
  value.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

const toSnakeCaseObject = (data: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      camelToSnake(key),
      value instanceof Date ? value.toISOString() : value
    ])
  );

const TYPE_CONFIG: Record<
  SyncQueue['tipo'],
  { table: string; store: keyof typeof db; idKey: string }
> = {
  SESSAO: { table: 'sessoes_coleta', store: 'sessoesColeta', idKey: 'sessaoId' },
  DEDO: { table: 'dedos_coleta', store: 'dedosColeta', idKey: 'dedoId' },
  FORMULARIO: { table: 'forms_coleta', store: 'formsColeta', idKey: 'formId' },
  IMAGEM: { table: 'arquivos_referencia', store: 'arquivosReferencia', idKey: 'arquivoId' },
  AUDITORIA: { table: 'auditorias', store: 'auditorias', idKey: 'auditId' },
  LOGIN_EVENTO: { table: 'login_eventos', store: 'loginEventos', idKey: 'loginEventoId' },
  MAE: { table: 'maes', store: 'maes', idKey: 'maeId' },
  BEBE: { table: 'bebes', store: 'bebes', idKey: 'bebeId' },
  USUARIO: { table: 'usuarios', store: 'usuarios', idKey: 'usuarioId' },
  SCANNER: { table: 'scanners', store: 'scanners', idKey: 'scannerId' },
  ARQUIVO_REFERENCIA: { table: 'arquivos_referencia', store: 'arquivosReferencia', idKey: 'arquivoId' }
};

const TYPE_ORDER: Record<SyncQueue['tipo'], number> = {
  USUARIO: 1,
  MAE: 1,
  BEBE: 1,
  SCANNER: 1,
  ARQUIVO_REFERENCIA: 1,
  IMAGEM: 1,
  SESSAO: 2,
  DEDO: 3,
  FORMULARIO: 3,
  AUDITORIA: 4,
  LOGIN_EVENTO: 4
};

// Mapear tabelas para stores do Dexie
const TABLE_STORE_MAP: Record<string, keyof typeof db> = {
  usuarios: 'usuarios',
  maes: 'maes',
  bebes: 'bebes',
  scanners: 'scanners',
  arquivos_referencia: 'arquivosReferencia',
  sessoes_coleta: 'sessoesColeta',
  dedos_coleta: 'dedosColeta',
  forms_coleta: 'formsColeta',
  respostas_quali: 'respostasQuali',
  auditorias: 'auditorias',
  login_eventos: 'loginEventos'
};

// Converter snake_case para camelCase
const snakeToCamel = (str: string) => {
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
};

const snakeCaseObjectToCamel = (data: Record<string, unknown>) => {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      snakeToCamel(key),
      value
    ])
  );
};

export function useSync() {
  const [syncing, setSyncing] = useState(false);
  const { queueItems, pendingCount, errorCount, updateQueueItem } = useSyncQueue();
  const { toast } = useToast();

  const resolvePayload = useCallback(async (item: SyncQueue) => {
    try {
      const raw = JSON.parse(item.payload || '{}');
      if (raw?.table && raw?.data) {
        return { table: raw.table as string, data: raw.data as Record<string, unknown> };
      }

      const config = TYPE_CONFIG[item.tipo];
      if (!config) {
        return null;
      }

      const entityId = raw?.[config.idKey] ?? raw?.id;
      if (!entityId) {
        return null;
      }

      const store = db[config.store] as any;
      const data = await store.get(entityId);
      if (!data) {
        return null;
      }

      return { table: config.table, data };
    } catch {
      return null;
    }
  }, []);

  const sendToApi = useCallback(async (itemId: number, table: string, data: Record<string, unknown>) => {
    const token = getAuthUser()?.token;
    const response = await fetch(`${API_BASE_URL}/api/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        items: [
          {
            clientRef: itemId,
            table,
            data: toSnakeCaseObject(data)
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error || 'Erro ao sincronizar');
    }

    const result = await response.json();
    const itemResult = result?.results?.find((res: any) => res.clientRef === itemId);
    if (!itemResult || itemResult.status !== 'ok') {
      throw new Error(itemResult?.error || 'Erro ao sincronizar item');
    }

    return true;
  }, []);

  const syncItem = useCallback(async (item: SyncQueue) => {
    if (!item.id) return;

    try {
      await updateQueueItem(item.id, { status: 'ENVIANDO' });

      const payload = await resolvePayload(item);
      if (!payload) {
        await updateQueueItem(item.id, {
          status: 'ERRO',
          tentativas: item.tentativas + 1,
          ultimoErro: 'Dados não encontrados para sincronização'
        });
        return false;
      }

      await sendToApi(item.id, payload.table, payload.data);
      await updateQueueItem(item.id, {
        status: 'CONCLUIDO',
        tentativas: item.tentativas + 1,
        ultimoErro: undefined
      });
      return true;
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
  }, [resolvePayload, sendToApi, updateQueueItem]);

  const syncBatch = useCallback(async (items: SyncQueue[]) => {
    const token = getAuthUser()?.token;
    const sortedItems = [...items].sort((a, b) => {
      const typeOrderA = TYPE_ORDER[a.tipo] ?? 9;
      const typeOrderB = TYPE_ORDER[b.tipo] ?? 9;
      if (typeOrderA !== typeOrderB) return typeOrderA - typeOrderB;
      if (a.prioridade !== b.prioridade) return a.prioridade - b.prioridade;
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateA - dateB;
    });

    const prepared = await Promise.all(
      sortedItems.map(async (item) => {
        if (!item.id) return null;
        const payload = await resolvePayload(item);
        if (!payload) return null;
        return {
          clientRef: item.id,
          table: payload.table,
          data: toSnakeCaseObject(payload.data)
        };
      })
    );

    const validItems = prepared.filter(Boolean) as Array<{
      clientRef: number;
      table: string;
      data: Record<string, unknown>;
    }>;

    if (!validItems.length) {
      return { results: [] };
    }

    const response = await fetch(`${API_BASE_URL}/api/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ items: validItems })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error || 'Erro ao sincronizar');
    }

    return response.json();
  }, [resolvePayload]);

  const pullDataFromServer = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sync/pull`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar dados do servidor');
      }

      const result = await response.json();
      if (!result.ok || !result.data) {
        throw new Error('Resposta inválida do servidor');
      }

      // Atualizar cada tabela no IndexedDB
      for (const [table, records] of Object.entries(result.data)) {
        const storeName = TABLE_STORE_MAP[table];
        if (!storeName || !Array.isArray(records)) continue;

        const store = db[storeName] as any;
        
        for (const record of records) {
          const camelRecord = snakeCaseObjectToCamel(record as Record<string, unknown>);
          try {
            // UPSERT: tenta atualizar, se não existir insere
            const existing = await store.where('uuid').equals(camelRecord.uuid).toArray();
            if (existing.length > 0) {
              await store.update(existing[0].id, camelRecord);
            } else {
              await store.add(camelRecord);
            }
          } catch (err) {
            console.error(`Erro ao atualizar ${table}:`, err);
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Erro ao fazer pull do servidor:', error);
      return false;
    }
  }, []);

  const syncAll = useCallback(async () => {
    setSyncing(true);
    
    try {
      const pending = queueItems.filter(item => item.status === 'PENDENTE' || item.status === 'ERRO');
      
      await Promise.all(
        pending.filter((item) => item.id).map((item) =>
          updateQueueItem(item.id!, { status: 'ENVIANDO' })
        )
      );

      const response = await syncBatch(pending);
      const results = response?.results || [];

      let successCount = 0;
      let errorCount = 0;

      for (const item of pending) {
        if (!item.id) continue;
        const result = results.find((entry: any) => entry.clientRef === item.id);
        if (result?.status === 'ok') {
          successCount++;
          await updateQueueItem(item.id, {
            status: 'CONCLUIDO',
            tentativas: item.tentativas + 1,
            ultimoErro: undefined
          });
        } else {
          errorCount++;
          await updateQueueItem(item.id, {
            status: 'ERRO',
            tentativas: item.tentativas + 1,
            ultimoErro: result?.error || 'Erro ao sincronizar item'
          });
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

      // 📥 PULL: Buscar dados atualizados do servidor
      const pullSuccess = await pullDataFromServer();
      if (pullSuccess) {
        toast({
          title: 'Dados atualizados',
          description: 'Novos dados do servidor foram carregados.',
        });
      }
    } catch (error) {
      await Promise.all(
        queueItems
          .filter((item) => item.status === 'ENVIANDO' && item.id)
          .map((item) =>
            updateQueueItem(item.id!, {
              status: 'ERRO',
              tentativas: item.tentativas + 1,
              ultimoErro: error instanceof Error ? error.message : 'Erro ao sincronizar'
            })
          )
      );
      toast({
        title: 'Erro na sincronização',
        description: 'Não foi possível sincronizar os dados.',
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  }, [queueItems, syncBatch, toast, updateQueueItem, pullDataFromServer]);

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
    pullDataFromServer,
  };
}
