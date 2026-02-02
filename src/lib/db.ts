import Dexie, { Table } from 'dexie';

// Database models
export interface Usuario {
  id?: number;
  uuid?: string;
  nome: string;
  email: string;
  cpf?: string;
  dataNascimento?: string;
  perfil: 'ADMINISTRADOR' | 'OPERADOR' | 'SUPERVISOR';
  ativo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Mae {
  id?: number;
  uuid?: string;
  nome: string;
  cpf?: string;
  rg?: string;
  dataNascimento?: Date;
  telefone?: string;
  endereco?: string;
  createdAt?: Date;
}

export interface Bebe {
  id?: number;
  uuid?: string;
  maeId: number;
  nome?: string;
  dataNascimento: Date;
  sexo?: 'M' | 'F';
  numeroFilho?: number;
  createdAt?: Date;
}

export interface Scanner {
  id?: number;
  uuid?: string;
  nome: string;
  modelo: string;
  numeroSerie: string;
  ativo: boolean;
  ultimoUso?: Date;
}

export interface ArquivoReferencia {
  id?: number;
  uuid?: string;
  bebeId: number;
  caminhoArquivo: string;
  dataColeta: Date;
  createdAt?: Date;
}

export interface SessaoColeta {
  id?: number;
  uuid?: string;
  usuarioId: number;
  maeId: number;
  bebeId: number;
  scannerId: number;
  tipoSessao: 'PRIMEIRA_COLETA' | 'RECOLETA';
  sessaoOrigemId?: number;
  matchingHabilitado: boolean;
  matchingRefId?: number;
  dataInicio: Date;
  dataFim?: Date;
  status: 'EM_ANDAMENTO' | 'CONCLUIDA' | 'CANCELADA';
  syncStatus?: 'PENDENTE' | 'SINCRONIZADO' | 'ERRO';
  createdAt?: Date;
}

export interface DedoColeta {
  id?: number;
  uuid?: string;
  sessaoColetaId: number;
  tipoDedo: 'POLEGAR_D' | 'POLEGAR_E' | 'INDICADOR_D' | 'INDICADOR_E' | 'MEDIO_D' | 'MEDIO_E' | 'ANELAR_D' | 'ANELAR_E' | 'MINIMO_D' | 'MINIMO_E';
  qualidade: number; // 0-100
  framesOk: number;
  framesTotal: number;
  resultado: 'SUCESSO' | 'FALHA' | 'PARCIAL';
  imagemPath?: string;
  createdAt?: Date;
}

export interface FormColeta {
  id?: number;
  uuid?: string;
  sessaoColetaId: number;
  temperatura?: number;
  umidade?: number;
  tipoMistura?: string;
  questionarioVersao: string;
  observacoes?: string;
  justificativaParcial?: string;
  coletaRapida: boolean;
  createdAt?: Date;
}

export interface RespostaQuali {
  id?: number;
  uuid?: string;
  formColetaId: number;
  pergunta: string;
  resposta: string;
  createdAt?: Date;
}

export interface Auditoria {
  id?: number;
  uuid?: string;
  usuarioId: number;
  acao: string;
  entidade: string;
  entidadeId?: number;
  dadosAntigos?: string;
  dadosNovos?: string;
  dispositivo?: string;
  ipAddress?: string;
  createdAt?: Date;
  syncStatus?: 'PENDENTE' | 'SINCRONIZADO' | 'ERRO';
}

export interface LoginEvento {
  id?: number;
  uuid?: string;
  usuarioId?: number;
  email: string;
  sucesso: boolean;
  motivoFalha?: string;
  dispositivo?: string;
  ipAddress?: string;
  createdAt?: Date;
}

export interface SyncQueue {
  id?: number;
  tipo: 'SESSAO' | 'DEDO' | 'FORMULARIO' | 'IMAGEM' | 'AUDITORIA' | 'LOGIN_EVENTO';
  payload: string; // JSON stringified
  prioridade: number; // 1 = highest
  tentativas: number;
  ultimoErro?: string;
  status: 'PENDENTE' | 'ENVIANDO' | 'ERRO' | 'CONFLITO' | 'CONCLUIDO';
  createdAt?: Date;
  updatedAt?: Date;
}

// Dexie database
export class BiometriaDB extends Dexie {
  usuarios!: Table<Usuario>;
  maes!: Table<Mae>;
  bebes!: Table<Bebe>;
  scanners!: Table<Scanner>;
  arquivosReferencia!: Table<ArquivoReferencia>;
  sessoesColeta!: Table<SessaoColeta>;
  dedosColeta!: Table<DedoColeta>;
  formsColeta!: Table<FormColeta>;
  respostasQuali!: Table<RespostaQuali>;
  auditorias!: Table<Auditoria>;
  loginEventos!: Table<LoginEvento>;
  syncQueue!: Table<SyncQueue>;

  constructor() {
    super('BiometriaDB');
    this.version(1).stores({
      usuarios: '++id, uuid, email, perfil, ativo',
      maes: '++id, uuid, cpf, nome',
      bebes: '++id, uuid, maeId, dataNascimento',
      scanners: '++id, uuid, numeroSerie, ativo',
      arquivosReferencia: '++id, uuid, bebeId, dataColeta',
      sessoesColeta: '++id, uuid, usuarioId, maeId, bebeId, scannerId, tipoSessao, status, syncStatus, dataInicio',
      dedosColeta: '++id, uuid, sessaoColetaId, tipoDedo, resultado',
      formsColeta: '++id, uuid, sessaoColetaId',
      respostasQuali: '++id, uuid, formColetaId',
      auditorias: '++id, uuid, usuarioId, entidade, syncStatus, createdAt',
      loginEventos: '++id, uuid, usuarioId, email, sucesso, createdAt',
      syncQueue: '++id, tipo, status, prioridade, createdAt'
    });
  }
}

export const db = new BiometriaDB();
