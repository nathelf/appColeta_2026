import { db, SyncQueue } from './db';

/* =====================================================
   📌 TIPOS
===================================================== */

export type SyncTable =
  | 'usuarios'
  | 'maes'
  | 'bebes'
  | 'scanners'
  | 'arquivos_referencia'
  | 'sessoes_coleta'
  | 'dedos_coleta'
  | 'forms_coleta'
  | 'respostas_quali'
  | 'auditorias'
  | 'login_eventos';

type EnqueueParams = {
  tipo: SyncQueue['tipo'];
  table: SyncTable;
  data: Record<string, unknown>;
  prioridade?: number;
};

/* =====================================================
   🔧 SERIALIZAÇÃO
===================================================== */

const serializeValue = (value: unknown) => {
  if (value instanceof Date) return value.toISOString();
  return value;
};

const serializeEntity = (data: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(data)
      .filter(([_, value]) => typeof value !== 'undefined')
      .map(([key, value]) => [key, serializeValue(value)])
  );

/* =====================================================
   ➕ ENQUEUE
===================================================== */

export async function enqueueSyncItem({
  tipo,
  table,
  data,
  prioridade = 2
}: EnqueueParams) {

  if (!data.uuid) {
    data.uuid = crypto.randomUUID();
  }

  if (table === 'usuarios') {
    if (!data.senha) {
      data.senha = '123456';
    }
  }

  const payload = JSON.stringify({
    table,
    data: serializeEntity(data)
  });

  await db.syncQueue.add({
    tipo,
    payload,
    prioridade,
    tentativas: 0,
    status: 'PENDENTE',
    createdAt: new Date(),
    updatedAt: new Date()
  });
}

/* =====================================================
   🧠 ORDEM
===================================================== */

const syncOrder: Record<string, number> = {
  USUARIO: 1,
  MAE: 2,
  BEBE: 3,
  SCANNER: 4,
  SESSAO: 5,
  FORMULARIO: 6,
  DEDO: 7,
  AUDITORIA: 8,
  LOGIN_EVENTO: 9,
  ARQUIVO_REFERENCIA: 10
};

/* =====================================================
   🚀 PROCESSAR FILA
===================================================== */

export async function processSyncQueue() {

  const items = await db.syncQueue
    .where('status')
    .anyOf('PENDENTE', 'ERRO')
    .toArray();

  if (!items.length) return;

  items.sort((a, b) => {
    const ordemTipo =
      (syncOrder[a.tipo] || 99) -
      (syncOrder[b.tipo] || 99);

    if (ordemTipo !== 0) return ordemTipo;

    return a.prioridade - b.prioridade;
  });

  for (const item of items) {
    await processItem(item);
  }

  // 🔥 limpa após processar tudo
  await clearCompletedSync();
}

/* =====================================================
   🔄 PROCESSAR ITEM
===================================================== */

async function processItem(item: SyncQueue) {

  try {

    await db.syncQueue.update(item.id!, {
      status: 'ENVIANDO',
      updatedAt: new Date()
    });

    let payload;

    try {
      payload = JSON.parse(item.payload);
    } catch {
      throw new Error('Payload inválido');
    }

    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('Token não encontrado');
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL || ''}/api/sync`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          items: [
            {
              table: payload.table,
              data: payload.data
            }
          ]
        })
      }
    );

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(
        responseData?.error ||
        `HTTP ${response.status}`
      );
    }

    /* =====================================================
       🔥 VALIDA RESULTADO DO BACKEND
    ===================================================== */

    const result = responseData?.results?.[0];

    if (!result || result.status !== 'ok') {
      throw new Error(
        result?.error ||
        'Falha retornada pelo backend'
      );
    }

    /* =====================================================
       ✔️ SUCESSO
    ===================================================== */

    await db.syncQueue.update(item.id!, {
      status: 'CONCLUIDO',
      tentativas: item.tentativas + 1,
      ultimoErro: '',
      updatedAt: new Date()
    });

  } catch (error: any) {

    console.error('SYNC ERROR:', error);

    const tentativas = item.tentativas + 1;

    await db.syncQueue.update(item.id!, {
      tentativas,
      status:
        tentativas >= 3
          ? 'CONFLITO'
          : 'ERRO',
      ultimoErro:
        error?.message ||
        JSON.stringify(error) ||
        'Erro desconhecido',
      updatedAt: new Date()
    });
  }
}

/* =====================================================
   🧹 LIMPAR CONCLUÍDOS
===================================================== */

export async function clearCompletedSync() {
  await db.syncQueue
    .where('status')
    .equals('CONCLUIDO')
    .delete();
}

/* =====================================================
   🔄 SYNC MANUAL
===================================================== */

export async function runFullSync() {
  await processSyncQueue();
}
