/**
 * Express app (API apenas) - usado tanto no server.js local quanto no Vercel serverless
 * Carrega .env localmente; no Vercel usa variáveis de ambiente já injetadas
 */
import "dotenv/config";
import express from "express";
import cors from "cors";
import pkg from "pg";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { Pool } = pkg;

const log = (tag, ...args) => {
  const ts = new Date().toISOString();
  console.log(`[${ts}] [${tag}]`, ...args);
};

/* =====================================================
   🗃️ DATABASE
===================================================== */

log("config", "DB_HOST:", process.env.DB_HOST ? `${process.env.DB_HOST.slice(0, 15)}...` : "(não definido)");
log("config", "DB_PORT:", process.env.DB_PORT);
log("config", "DB_USER:", process.env.DB_USER || "(não definido)");
log("config", "DB_NAME:", process.env.DB_NAME || "(não definido)");
log("config", "DB_SSL:", process.env.DB_SSL);
log("config", "JWT_SECRET:", process.env.JWT_SECRET ? "definido" : "(não definido)");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: String(process.env.DB_PASSWORD || ""),
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

pool.on("error", (err) => log("db-pool", "Pool error:", err.message));

/* =====================================================
   🚀 APP
===================================================== */

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

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
    log("health", "Testando conexão com o banco...");
    const r = await pool.query("SELECT NOW()");
    log("health", "Conexão OK. DB time:", r.rows[0].now);
    res.json({ ok: true, databaseTime: r.rows[0].now });
  } catch (e) {
    log("health", "Erro:", e.message);
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.get("/api/health/detailed", async (_, res) => {
  const check = {
    env: {
      DB_HOST: !!process.env.DB_HOST,
      DB_PORT: !!process.env.DB_PORT,
      DB_USER: !!process.env.DB_USER,
      DB_PASSWORD: !!process.env.DB_PASSWORD,
      DB_NAME: !!process.env.DB_NAME,
      DB_SSL: process.env.DB_SSL,
      JWT_SECRET: !!process.env.JWT_SECRET,
    },
    database: null,
    usuariosCount: null,
  };
  try {
    log("health/detailed", "Testando DB...");
    const r = await pool.query("SELECT NOW()");
    check.database = { ok: true, time: r.rows[0].now };
    const countRes = await pool.query("SELECT COUNT(*) FROM usuarios");
    check.usuariosCount = parseInt(countRes.rows[0].count, 10);
    log("health/detailed", "OK. Usuários:", check.usuariosCount);
  } catch (e) {
    check.database = { ok: false, error: e.message };
    log("health/detailed", "Erro DB:", e.message);
  }
  res.json(check);
});

app.get("/api/auth/first-user", async (_, res) => {
  try {
    log("first-user", "Verificando se há usuários...");
    const r = await pool.query("SELECT COUNT(*) FROM usuarios");
    const count = parseInt(r.rows[0].count, 10);
    const hasUsers = count > 0;
    log("first-user", "Count:", count, "hasUsers:", hasUsers);
    res.json({ hasUsers, count });
  } catch (err) {
    log("first-user", "Erro:", err.message);
    res.status(500).json({
      hasUsers: false,
      error: err.message,
      hint: "Tabela usuarios pode não existir. Execute o script SQL no Supabase.",
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
    const countRes = await pool.query("SELECT COUNT(*) FROM usuarios");
    const count = parseInt(countRes.rows[0].count, 10);
    if (count > 0) {
      log("register", "Já existem usuários. Negado.");
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
    log("register", "Erro:", msg);
    res.status(500).json({ error: "Erro ao cadastrar", detail: msg });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ error: "Email e senha são obrigatórios" });
    }
    log("login", "Tentativa de login:", email);
    const result = await pool.query("SELECT * FROM usuarios WHERE LOWER(email)=LOWER($1)", [email]);
    const user = result.rows[0];
    if (!user) {
      log("login", "Usuário não encontrado:", email);
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    if (!user.senha) {
      log("login", "Usuário sem senha no banco:", email);
      return res.status(500).json({ error: "Usuário sem senha configurada. Contate o administrador." });
    }
    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida) {
      log("login", "Senha inválida para:", email);
      return res.status(401).json({ error: "Senha inválida" });
    }
    const token = jwt.sign({ id: user.id, email: user.email, admin: user.admin, perfil: user.perfil }, process.env.JWT_SECRET || "dev_secret", { expiresIn: "8h" });
    delete user.senha;
    log("login", "Login OK:", email);
    res.json({ usuario: user, token });
  } catch (err) {
    const msg = err?.message || String(err);
    log("login", "Erro:", msg);
    res.status(500).json({
      error: "Erro interno no login",
      detail: msg,
    });
  }
});

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
      const { sql, values } = buildUpsert(cfg.table, data, cfg.conflict || ["uuid"]);
      const r = await pool.query(sql, values);
      results.push({ clientRef: item.clientRef, table: item.table, status: "ok", id: r.rows[0]?.id });
    } catch (err) {
      results.push({ clientRef: item.clientRef, table: item.table, status: "error", error: err.message });
    }
  }
  res.json({ results });
});

app.get("/api/sync/pull", async (req, res) => {
  try {
    const data = {};
    for (const [tableKey, cfg] of Object.entries(TABLE_CONFIG)) {
      try {
        const result = await pool.query(`SELECT * FROM ${cfg.table}`);
        data[tableKey] = result.rows;
      } catch (err) {
        console.error(`Erro ao buscar ${tableKey}:`, err.message);
        data[tableKey] = [];
      }
    }
    res.json({ ok: true, timestamp: new Date().toISOString(), data });
  } catch (err) {
    res.status(500).json({ ok: false, error: "Erro ao sincronizar", message: err.message });
  }
});

export default app;
