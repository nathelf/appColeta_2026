import express from "express";
import cors from "cors";
import pkg from "pg";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import path from "path";
import { fileURLToPath } from "url";

/* =====================================================
   🔧 LOAD ENV
===================================================== */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.join(__dirname, ".env"),
});

const { Pool } = pkg;

/* =====================================================
   🔌 DATABASE
===================================================== */

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: String(process.env.DB_PASSWORD || ""),
  database: process.env.DB_NAME,
});

/* =====================================================
   🚀 APP
===================================================== */

const app = express();
app.use(cors());
app.use(express.json());

/* =====================================================
   🔧 UTILS
===================================================== */

const camelToSnake = (v) =>
  v.replace(/[A-Z]/g, (l) => `_${l.toLowerCase()}`);

const toSnake = (obj = {}) =>
  Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [
      camelToSnake(k),
      v,
    ])
  );

const sanitize = (data, cols) => {
  const s = toSnake(data);

  return Object.fromEntries(
    Object.entries(s).filter(
      ([k, v]) =>
        cols.includes(k) &&
        typeof v !== "undefined"
    )
  );
};

/* =====================================================
   🧠 UPSERT BUILDER (EMAIL = CONFLITO)
===================================================== */

const buildUpsert = (table, data) => {
  const cols = Object.keys(data);
  const vals = cols.map((_, i) => `$${i + 1}`);

  // email não atualiza (é chave)
  const updates = cols
    .filter((c) => c !== "email")
    .map((c) => `${c}=EXCLUDED.${c}`)
    .join(",");

  const sql = `
    INSERT INTO ${table} (${cols.join(",")})
    VALUES (${vals.join(",")})
    ON CONFLICT (email)
    DO UPDATE SET ${updates}
    RETURNING *
  `;

  return {
    sql,
    values: cols.map((c) => data[c]),
  };
};

/* =====================================================
   🗂️ CONFIG TABELAS
===================================================== */

const TABLE_CONFIG = {
  usuarios: {
    table: "usuarios",
    cols: [
      "uuid",
      "nome",
      "email",
      "cpf",
      "data_nascimento",
      "perfil",
      "ativo",
      "admin",
      "senha",
      "created_at",
      "updated_at",
    ],
  },
};

/* =====================================================
   🧪 HEALTH
===================================================== */

app.get("/health", async (_, res) => {
  try {
    const r = await pool.query("SELECT NOW()");
    res.json({
      ok: true,
      databaseTime: r.rows[0].now,
    });
  } catch (e) {
    console.error("DB ERROR:", e);

    res.status(500).json({
      error: e.message,
    });
  }
});

/* =====================================================
   🔄 SYNC
===================================================== */

app.post("/sync", async (req, res) => {
  const items = req.body.items || [];
  const results = [];

  if (!items.length) {
    return res.status(400).json({
      error: "Nenhum item enviado",
    });
  }

  for (const item of items) {
    const cfg = TABLE_CONFIG[item.table];

    if (!cfg) {
      results.push({
        table: item.table,
        status: "error",
        error: "Tabela inválida",
      });
      continue;
    }

    try {
      let data = sanitize(item.data, cfg.cols);

      console.log("SYNC DATA:", data);

      /* ================= HASH SENHA ================= */

      if (cfg.table === "usuarios") {
        if (!data.senha) {
          data.senha = await bcrypt.hash(
            "123456",
            10
          );
        } else if (
          !data.senha.startsWith("$2b$")
        ) {
          data.senha = await bcrypt.hash(
            data.senha,
            10
          );
        }
      }

      /* ================= UPSERT ================= */

      const { sql, values } = buildUpsert(
        cfg.table,
        data
      );

      const r = await pool.query(sql, values);

      results.push({
        table: item.table,
        status: "ok",
        uuid: r.rows[0]?.uuid,
        id: r.rows[0]?.id,
      });
    } catch (err) {
      console.error("SYNC ERROR:", err);

      results.push({
        table: item.table,
        status: "error",
        error: err.message,
      });
    }
  }

  res.json({ results });
});

/* =====================================================
   🚀 START
===================================================== */

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(
    `🚀 Backend rodando em http://localhost:${PORT}`
  );
});

