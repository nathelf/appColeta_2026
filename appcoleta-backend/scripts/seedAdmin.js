import dotenv from "dotenv";
import pkg from "pg";
import bcrypt from "bcrypt";
import crypto from "node:crypto";

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function seedAdmin() {
  const email = "admin@biometria.com";
  const senha = await bcrypt.hash("admin123", 10);

  const existing = await pool.query(
    "SELECT id FROM usuarios WHERE email = $1",
    [email]
  );

  if (existing.rows.length) {
    const id = existing.rows[0].id;
    const result = await pool.query(
      `UPDATE usuarios
       SET senha = $1,
           admin = true,
           perfil = 'ADMINISTRADOR',
           ativo = true,
           updated_at = NOW()
       WHERE id = $2
       RETURNING id, email`,
      [senha, id]
    );
    return result.rows[0];
  }

  const uuid = crypto.randomUUID();
  const result = await pool.query(
    `INSERT INTO usuarios (uuid, nome, email, senha, admin, perfil, ativo, created_at, updated_at)
     VALUES ($1, $2, $3, $4, true, 'ADMINISTRADOR', true, NOW(), NOW())
     RETURNING id, email`,
    [uuid, "Administrador Seed", email, senha]
  );
  return result.rows[0];
}

seedAdmin()
  .then((row) => {
    console.log("Seed ok:", row);
    return pool.end();
  })
  .catch((err) => {
    console.error("Seed erro:", err);
    return pool.end().finally(() => process.exit(1));
  });
