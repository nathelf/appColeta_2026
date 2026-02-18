/**
 * Express app (API apenas) - usado tanto no server.js local quanto no Vercel serverless
 * Carrega .env da pasta do backend; no Vercel usa variáveis de ambiente já injetadas
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

import express from "express";
import cors from "cors";
import pkg from "pg";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";

const { Pool } = pkg;

const log = (tag, ...args) => {
  const ts = new Date().toISOString();
  console.log(`[${ts}] [${tag}]`, ...args);
};

const logError = (tag, err) => {
  log(tag, "Erro:", err?.message || String(err));
  if (err?.stack) log(tag, "Stack:", err.stack);
};

/** Dica para erros de conexão (ex.: ENOTFOUND na Vercel) */
const connectionErrorHint = (err) => {
  const msg = (err?.message || String(err)).toLowerCase();
  const code = err?.code || "";
  if (
    code === "ENOTFOUND" ||
    code === "ECONNREFUSED" ||
    code === "ETIMEDOUT" ||
    msg.includes("getaddrinfo")
  ) {
    return process.env.VERCEL
      ? "Use DATABASE_URL com a URI do pooler do Supabase (Project Settings → Database → Connection string → Use connection pooling). Depois faça um novo deploy."
      : "Verifique o .env em appcoleta-backend (DB_HOST, DB_PASSWORD, DB_SSL=true) e se o backend está rodando.";
  }
  return null;
};

/* =====================================================
   🗃️ DATABASE
===================================================== */

const USE_MEMORY_DB =
  process.env.USE_MEMORY_DB === "true" ||
  (!process.env.DATABASE_URL && !process.env.DB_HOST);

log("config", "App carregado. VERCEL:", !!process.env.VERCEL);
log("config", "USE_MEMORY_DB:", USE_MEMORY_DB);
log("config", "DATABASE_URL:", process.env.DATABASE_URL ? "definido" : "(não definido)");
log("config", "DB_HOST:", process.env.DB_HOST ? `${process.env.DB_HOST.slice(0, 15)}...` : "(não definido)");
log("config", "JWT_SECRET:", process.env.JWT_SECRET ? "definido" : "(não definido)");

let pool = null;
if (!USE_MEMORY_DB) {
  const poolConfig = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: String(process.env.DB_PASSWORD || ""),
        database: process.env.DB_NAME,
        ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
      };
  pool = new Pool(poolConfig);
  pool.on("error", (err) => log("db-pool", "Pool error:", err.message));
}

/* ========== MEMORY DB (sem Postgres - para testar deploy) ========== */
const memoryStore = {
  usuarios: [],
  maes: [],
  bebes: [],
  scanners: [],
  arquivos_referencia: [],
  sessoes_coleta: [],
  dedos_coleta: [],
  forms_coleta: [],
  respostas_quali: [],
  auditorias: [],
  login_eventos: [],
};

async function initMemoryDb() {
  const senhaHash = await bcrypt.hash("admin123", 10);
  memoryStore.usuarios = [
    {
      id: 1,
      uuid: crypto.randomUUID(),
      nome: "Admin Demo",
      email: "admin@appcoleta.com",
      senha: senhaHash,
      perfil: "ADMINISTRADOR",
      admin: true,
      ativo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
  log("config", "Memory DB inicializado. Login: admin@appcoleta.com / admin123");
}

const memoryDbReady = USE_MEMORY_DB ? initMemoryDb() : Promise.resolve();

/* =====================================================
   🚀 APP
===================================================== */

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

app.use(async (req, res, next) => {
  if (USE_MEMORY_DB) await memoryDbReady;
  next();
});

/* =====================================================
   🔧 UTILS
===================================================== */

const sanitize = (data, cols) =>
  Object.fromEntries(
    Object.entries(data || {}).filter(
      ([k, v]) => cols.includes(k) && typeof v !== "undefined"
    )
  );

const buildUpsert = (table, data, conflictCols = ["uuid"]) => {
  const cols = Object.keys(data);
  const vals = cols.map((_, i) => `$${i + 1}`);
  const updates = cols
    .filter((c) => !conflictCols.includes(c))
    .map((c) => `${c}=EXCLUDED.${c}`)
    .join(",");
  return {
    sql: `
      INSERT INTO ${table} (${cols.join(",")})
      VALUES (${vals.join(",")})
      ON CONFLICT (${conflictCols.join(",")})
      DO UPDATE SET ${updates}
      RETURNING *
    `,
    values: cols.map((c) => data[c]),
  };
};

/* =====================================================
   🗂️ TABLE CONFIG
===================================================== */

const TABLE_CONFIG = {
  usuarios: {
    table: "usuarios",
    conflict: ["email"],
    cols: ["uuid", "nome", "email", "cpf", "data_nascimento", "perfil", "ativo", "admin", "senha", "created_at", "updated_at"],
  },
  maes: { table: "maes", cols: ["uuid", "nome", "cpf", "rg", "data_nascimento", "telefone", "endereco", "created_at"] },
  bebes: { table: "bebes", cols: ["uuid", "mae_id", "nome", "data_nascimento", "sexo", "numero_filho", "created_at"] },
  scanners: { table: "scanners", cols: ["uuid", "nome", "modelo", "numero_serie", "ativo", "ultimo_uso"] },
  arquivos_referencia: { table: "arquivos_referencia", cols: ["uuid", "bebe_id", "caminho_arquivo", "data_coleta", "created_at"] },
  sessoes_coleta: { table: "sessoes_coleta", cols: ["uuid", "usuario_id", "mae_id", "bebe_id", "scanner_id", "tipo_sessao", "sessao_origem_id", "matching_habilitado", "matching_ref_id", "data_inicio", "data_fim", "status", "sync_status", "created_at"] },
  dedos_coleta: { table: "dedos_coleta", cols: ["uuid", "sessao_coleta_id", "tipo_dedo", "qualidade", "frames_ok", "frames_total", "resultado", "imagem_path", "created_at"] },
  forms_coleta: { table: "forms_coleta", cols: ["uuid", "sessao_coleta_id", "temperatura", "umidade", "tipo_mistura", "questionario_versao", "observacoes", "justificativa_parcial", "coleta_rapida", "created_at"] },
  respostas_quali: { table: "respostas_quali", cols: ["uuid", "form_coleta_id", "pergunta", "resposta", "created_at"] },
  auditorias: { table: "auditorias", cols: ["uuid", "usuario_id", "acao", "entidade", "entidade_id", "dados_antigos", "dados_novos", "dispositivo", "ip_address", "sync_status", "created_at"] },
  login_eventos: { table: "login_eventos", cols: ["uuid", "usuario_id", "email", "sucesso", "motivo_falha", "dispositivo", "ip_address", "created_at"] },
};

/* =====================================================
   🛣️ ROTAS
===================================================== */

app.get("/api/health", async (_, res) => {
  try {
    if (USE_MEMORY_DB) {
      return res.json({ ok: true, databaseTime: new Date().toISOString(), mode: "memory" });
    }
    log("health", "Testando conexão com o banco...");
    const r = await pool.query("SELECT NOW()");
    log("health", "Conexão OK. DB time:", r.rows[0].now);
    res.json({ ok: true, databaseTime: r.rows[0].now });
  } catch (e) {
    logError("health", e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.get("/api/health/detailed", async (_, res) => {
  const check = {
    mode: USE_MEMORY_DB ? "memory" : "postgres",
    env: {
      USE_MEMORY_DB,
      DB_HOST: !!process.env.DB_HOST,
      DATABASE_URL: !!process.env.DATABASE_URL,
      JWT_SECRET: !!process.env.JWT_SECRET,
    },
    database: null,
    usuariosCount: null,
  };
  try {
    if (USE_MEMORY_DB) {
      check.database = { ok: true, time: new Date().toISOString() };
      check.usuariosCount = memoryStore.usuarios.length;
    } else {
      log("health/detailed", "Testando DB...");
      const r = await pool.query("SELECT NOW()");
      check.database = { ok: true, time: r.rows[0].now };
      const countRes = await pool.query("SELECT COUNT(*) FROM usuarios");
      check.usuariosCount = parseInt(countRes.rows[0].count, 10);
    }
  } catch (e) {
    check.database = { ok: false, error: e.message };
    logError("health/detailed", e);
  }
  res.json(check);
});

app.get("/api/auth/first-user", async (_, res) => {
  try {
    if (USE_MEMORY_DB) {
      const count = memoryStore.usuarios.length;
      return res.json({ hasUsers: count > 0, count });
    }
    log("first-user", "Verificando se há usuários...");
    const r = await pool.query("SELECT COUNT(*) FROM usuarios");
    const count = parseInt(r.rows[0].count, 10);
    const hasUsers = count > 0;
    res.json({ hasUsers, count });
  } catch (err) {
    logError("first-user", err);
    const hint = connectionErrorHint(err) || "Tabela usuarios pode não existir. Execute o script SQL no Supabase.";
    res.status(500).json({
      hasUsers: false,
      error: err?.message || String(err),
      hint,
    });
  }
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) {
      return res.status(400).json({ error: "Nome, email e senha são obrigatórios" });
    }
    if (senha.length < 8) {
      return res.status(400).json({ error: "Senha deve ter pelo menos 8 caracteres" });
    }
    log("register", "Tentando cadastrar primeiro usuário:", email);

    if (USE_MEMORY_DB) {
      if (memoryStore.usuarios.length > 0) {
        return res.status(403).json({ error: "Já existem usuários. Use admin@appcoleta.com / admin123" });
      }
      const senhaHash = await bcrypt.hash(senha, 10);
      const id = memoryStore.usuarios.length + 1;
      const now = new Date().toISOString();
      memoryStore.usuarios.push({
        id,
        uuid: crypto.randomUUID(),
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        senha: senhaHash,
        perfil: "ADMINISTRADOR",
        admin: true,
        ativo: true,
        created_at: now,
        updated_at: now,
      });
      return res.json({ ok: true, message: "Usuário cadastrado. Faça login." });
    }

    const countRes = await pool.query("SELECT COUNT(*) FROM usuarios");
    const count = parseInt(countRes.rows[0].count, 10);
    if (count > 0) {
      return res.status(403).json({ error: "Já existem usuários. Peça ao administrador para cadastrá-lo." });
    }
    const senhaHash = await bcrypt.hash(senha, 10);
    const uuid = crypto.randomUUID();
    await pool.query(
      `INSERT INTO usuarios (uuid, nome, email, senha, perfil, admin, ativo, created_at, updated_at) 
       VALUES ($1, $2, LOWER($3), $4, 'ADMINISTRADOR', true, true, NOW(), NOW())`,
      [uuid, nome.trim(), email.trim(), senhaHash]
    );
    log("register", "Primeiro usuário criado com sucesso:", email);
    res.json({ ok: true, message: "Usuário cadastrado. Faça login." });
  } catch (err) {
    const msg = err?.message || String(err);
    logError("register", err);
    const hint = connectionErrorHint(err);
    res.status(500).json({
      error: "Erro ao cadastrar",
      detail: msg,
      ...(hint && { hint }),
    });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ error: "Email e senha são obrigatórios" });
    }
    log("login", "Tentativa de login:", email);

    let user;
    if (USE_MEMORY_DB) {
      user = memoryStore.usuarios.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    } else {
      const result = await pool.query("SELECT * FROM usuarios WHERE LOWER(email)=LOWER($1)", [email]);
      user = result.rows[0];
    }

    if (!user) {
      log("login", "Usuário não encontrado:", email);
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    if (!user.senha) {
      return res.status(500).json({ error: "Usuário sem senha configurada. Contate o administrador." });
    }
    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida) {
      log("login", "Senha inválida para:", email);
      return res.status(401).json({ error: "Senha inválida" });
    }
    const token = jwt.sign({ id: user.id, email: user.email, admin: user.admin, perfil: user.perfil }, process.env.JWT_SECRET || "dev_secret", { expiresIn: "8h" });
    const { senha: _, ...userSafe } = user;
    log("login", "Login OK:", email);
    res.json({ usuario: userSafe, token });
  } catch (err) {
    const msg = err?.message || String(err);
    logError("login", err);
    res.status(500).json({
      error: "Erro interno no login",
      detail: msg,
    });
  }
});

function memoryUpsert(tableKey, data, conflictCol = "uuid") {
  const arr = memoryStore[TABLE_CONFIG[tableKey]?.table];
  if (!arr) return null;
  const key = conflictCol === "email" ? "email" : "uuid";
  const keyVal = data[key];
  const idx = arr.findIndex((r) => (r[key] || "").toLowerCase() === (keyVal || "").toLowerCase());
  const row = { id: (arr.length + 1), ...data };
  if (idx >= 0) {
    arr[idx] = { ...arr[idx], ...data };
    return arr[idx];
  }
  arr.push(row);
  return row;
}

app.post("/api/sync", async (req, res) => {
  const items = req.body.items || [];
  const results = [];
  for (const item of items) {
    const cfg = TABLE_CONFIG[item.table];
    if (!cfg) {
      results.push({ clientRef: item.clientRef, table: item.table, status: "ignored", error: "Tabela não suportada" });
      continue;
    }
    let data = sanitize(item.data, cfg.cols);
    if (cfg.table === "usuarios" && !data.senha) {
      data.senha = await bcrypt.hash("123456", 10);
    }
    try {
      if (USE_MEMORY_DB) {
        const conflict = cfg.conflict?.[0] || "uuid";
        const row = memoryUpsert(item.table, data, conflict);
        results.push({ clientRef: item.clientRef, table: item.table, status: "ok", id: row?.id });
      } else {
        const { sql, values } = buildUpsert(cfg.table, data, cfg.conflict || ["uuid"]);
        const r = await pool.query(sql, values);
        results.push({ clientRef: item.clientRef, table: item.table, status: "ok", id: r.rows[0]?.id });
      }
    } catch (err) {
      results.push({ clientRef: item.clientRef, table: item.table, status: "error", error: err.message });
    }
  }
  res.json({ results });
});

app.get("/api/sync/pull", async (req, res) => {
  try {
    const data = {};
    if (USE_MEMORY_DB) {
      for (const [tableKey, cfg] of Object.entries(TABLE_CONFIG)) {
        const arr = memoryStore[cfg.table];
        data[tableKey] = Array.isArray(arr) ? [...arr] : [];
      }
    } else {
      for (const [tableKey, cfg] of Object.entries(TABLE_CONFIG)) {
        try {
          const result = await pool.query(`SELECT * FROM ${cfg.table}`);
          data[tableKey] = result.rows;
        } catch (err) {
          console.error(`Erro ao buscar ${tableKey}:`, err.message);
          data[tableKey] = [];
        }
      }
    }
    res.json({ ok: true, timestamp: new Date().toISOString(), data });
  } catch (err) {
    res.status(500).json({ ok: false, error: "Erro ao sincronizar", message: err.message });
  }
});

// Handler global: garante que sempre retornamos JSON em erros não tratados
app.use((err, _req, res, _next) => {
  logError("unhandled", err);
  if (res.headersSent) return;
  res.status(500).json({ error: "Internal Server Error", detail: err?.message || String(err) });
});

export default app;
