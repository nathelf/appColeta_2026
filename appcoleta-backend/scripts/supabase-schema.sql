-- =====================================================
-- SCHEMA COMPLETO - APP COLETA BIOMÉTRICA
-- Execute no Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- =====================================================

-- Extensão para UUID (Supabase já tem)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. USUÁRIOS
-- =====================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id BIGSERIAL PRIMARY KEY,
  uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  cpf TEXT,
  data_nascimento DATE,
  senha TEXT,
  perfil TEXT NOT NULL DEFAULT 'COLETISTA' CHECK (perfil IN ('ADMINISTRADOR', 'COLETISTA')),
  admin BOOLEAN NOT NULL DEFAULT false,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS usuarios_email_idx ON usuarios (email);
CREATE INDEX IF NOT EXISTS usuarios_uuid_idx ON usuarios (uuid);

-- =====================================================
-- 2. MÃES
-- =====================================================
CREATE TABLE IF NOT EXISTS maes (
  id BIGSERIAL PRIMARY KEY,
  uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  nome TEXT NOT NULL,
  cpf TEXT,
  rg TEXT,
  data_nascimento DATE,
  telefone TEXT,
  endereco TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS maes_uuid_idx ON maes (uuid);
CREATE INDEX IF NOT EXISTS maes_cpf_idx ON maes (cpf);

-- =====================================================
-- 3. BEBÊS (depende de maes)
-- =====================================================
CREATE TABLE IF NOT EXISTS bebes (
  id BIGSERIAL PRIMARY KEY,
  uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  mae_id BIGINT NOT NULL REFERENCES maes(id) ON DELETE CASCADE,
  nome TEXT,
  data_nascimento DATE NOT NULL,
  sexo TEXT,
  numero_filho INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS bebes_uuid_idx ON bebes (uuid);
CREATE INDEX IF NOT EXISTS bebes_mae_id_idx ON bebes (mae_id);

-- =====================================================
-- 4. SCANNERS
-- =====================================================
CREATE TABLE IF NOT EXISTS scanners (
  id BIGSERIAL PRIMARY KEY,
  uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  nome TEXT NOT NULL,
  modelo TEXT NOT NULL,
  numero_serie TEXT NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  ultimo_uso TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS scanners_uuid_idx ON scanners (uuid);

-- =====================================================
-- 5. ARQUIVOS REFERÊNCIA (depende de bebes)
-- =====================================================
CREATE TABLE IF NOT EXISTS arquivos_referencia (
  id BIGSERIAL PRIMARY KEY,
  uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  bebe_id BIGINT NOT NULL REFERENCES bebes(id) ON DELETE CASCADE,
  caminho_arquivo TEXT NOT NULL,
  data_coleta DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS arquivos_referencia_uuid_idx ON arquivos_referencia (uuid);
CREATE INDEX IF NOT EXISTS arquivos_referencia_bebe_id_idx ON arquivos_referencia (bebe_id);

-- =====================================================
-- 6. SESSÕES COLETA (depende de usuarios, maes, bebes, scanners)
-- =====================================================
CREATE TABLE IF NOT EXISTS sessoes_coleta (
  id BIGSERIAL PRIMARY KEY,
  uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
  mae_id BIGINT NOT NULL REFERENCES maes(id) ON DELETE RESTRICT,
  bebe_id BIGINT NOT NULL REFERENCES bebes(id) ON DELETE RESTRICT,
  scanner_id BIGINT NOT NULL REFERENCES scanners(id) ON DELETE RESTRICT,
  tipo_sessao TEXT NOT NULL CHECK (tipo_sessao IN ('PRIMEIRA_COLETA', 'RECOLETA')),
  sessao_origem_id BIGINT REFERENCES sessoes_coleta(id) ON DELETE SET NULL,
  matching_habilitado BOOLEAN NOT NULL DEFAULT false,
  matching_ref_id BIGINT,
  data_inicio TIMESTAMPTZ NOT NULL,
  data_fim TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'EM_ANDAMENTO' CHECK (status IN ('EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA')),
  sync_status TEXT DEFAULT 'PENDENTE',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS sessoes_coleta_uuid_idx ON sessoes_coleta (uuid);
CREATE INDEX IF NOT EXISTS sessoes_coleta_usuario_id_idx ON sessoes_coleta (usuario_id);
CREATE INDEX IF NOT EXISTS sessoes_coleta_mae_id_idx ON sessoes_coleta (mae_id);
CREATE INDEX IF NOT EXISTS sessoes_coleta_bebe_id_idx ON sessoes_coleta (bebe_id);
CREATE INDEX IF NOT EXISTS sessoes_coleta_data_inicio_idx ON sessoes_coleta (data_inicio);

-- =====================================================
-- 7. DEDOS COLETA (depende de sessoes_coleta)
-- =====================================================
CREATE TABLE IF NOT EXISTS dedos_coleta (
  id BIGSERIAL PRIMARY KEY,
  uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  sessao_coleta_id BIGINT NOT NULL REFERENCES sessoes_coleta(id) ON DELETE CASCADE,
  tipo_dedo TEXT NOT NULL,
  qualidade INT DEFAULT 0,
  frames_ok INT DEFAULT 0,
  frames_total INT DEFAULT 0,
  resultado TEXT,
  imagem_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS dedos_coleta_uuid_idx ON dedos_coleta (uuid);
CREATE INDEX IF NOT EXISTS dedos_coleta_sessao_id_idx ON dedos_coleta (sessao_coleta_id);

-- =====================================================
-- 8. FORMS COLETA (depende de sessoes_coleta)
-- =====================================================
CREATE TABLE IF NOT EXISTS forms_coleta (
  id BIGSERIAL PRIMARY KEY,
  uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  sessao_coleta_id BIGINT NOT NULL REFERENCES sessoes_coleta(id) ON DELETE CASCADE,
  temperatura NUMERIC(4,1),
  umidade NUMERIC(4,1),
  tipo_mistura TEXT,
  questionario_versao TEXT NOT NULL DEFAULT '1',
  observacoes TEXT,
  justificativa_parcial TEXT,
  coleta_rapida BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS forms_coleta_uuid_idx ON forms_coleta (uuid);
CREATE INDEX IF NOT EXISTS forms_coleta_sessao_id_idx ON forms_coleta (sessao_coleta_id);

-- =====================================================
-- 9. RESPOSTAS QUALITATIVAS (depende de forms_coleta)
-- =====================================================
CREATE TABLE IF NOT EXISTS respostas_quali (
  id BIGSERIAL PRIMARY KEY,
  uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  form_coleta_id BIGINT NOT NULL REFERENCES forms_coleta(id) ON DELETE CASCADE,
  pergunta TEXT NOT NULL,
  resposta TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS respostas_quali_uuid_idx ON respostas_quali (uuid);
CREATE INDEX IF NOT EXISTS respostas_quali_form_id_idx ON respostas_quali (form_coleta_id);

-- =====================================================
-- 10. AUDITORIAS (depende de usuarios)
-- =====================================================
CREATE TABLE IF NOT EXISTS auditorias (
  id BIGSERIAL PRIMARY KEY,
  uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  usuario_id BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
  acao TEXT NOT NULL,
  entidade TEXT NOT NULL,
  entidade_id BIGINT,
  dados_antigos JSONB,
  dados_novos JSONB,
  dispositivo TEXT,
  ip_address TEXT,
  sync_status TEXT DEFAULT 'PENDENTE',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS auditorias_uuid_idx ON auditorias (uuid);
CREATE INDEX IF NOT EXISTS auditorias_usuario_id_idx ON auditorias (usuario_id);
CREATE INDEX IF NOT EXISTS auditorias_created_at_idx ON auditorias (created_at);

-- =====================================================
-- 11. LOGIN EVENTOS (depende de usuarios)
-- =====================================================
CREATE TABLE IF NOT EXISTS login_eventos (
  id BIGSERIAL PRIMARY KEY,
  uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  usuario_id BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  sucesso BOOLEAN NOT NULL,
  motivo_falha TEXT,
  dispositivo TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS login_eventos_uuid_idx ON login_eventos (uuid);
CREATE INDEX IF NOT EXISTS login_eventos_email_idx ON login_eventos (email);
CREATE INDEX IF NOT EXISTS login_eventos_created_at_idx ON login_eventos (created_at);

-- =====================================================
-- USUÁRIO ADMIN: Execute "node scripts/seedAdmin.js" após
-- configurar o .env com a conexão Supabase.
-- Credenciais padrão: admin@appcoleta.com / Admin@123
-- =====================================================
