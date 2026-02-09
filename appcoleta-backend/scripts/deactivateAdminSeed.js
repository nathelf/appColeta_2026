import dotenv from "dotenv";
import pkg from "pg";

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function deactivateAdminSeed() {
  const result = await pool.query(
    "UPDATE usuarios SET ativo = false, updated_at = NOW() WHERE email = $1 RETURNING id, email, ativo",
    ["admin@biometria.com"]
  );
  if (!result.rows.length) {
    console.log("Usuario admin seed nao encontrado.");
    return;
  }
  console.log("Usuario admin seed inativado:", result.rows[0]);
}

deactivateAdminSeed()
  .then(() => pool.end())
  .catch((err) => {
    console.error("Erro ao inativar admin seed:", err);
    return pool.end().finally(() => process.exit(1));
  });
