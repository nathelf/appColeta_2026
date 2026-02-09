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

async function deleteAdminSeed() {
  const result = await pool.query(
    "DELETE FROM usuarios WHERE email = $1 RETURNING id, email",
    ["admin@biometria.com"]
  );
  if (!result.rows.length) {
    console.log("Usuario admin seed nao encontrado.");
    return;
  }
  console.log("Usuario admin seed removido:", result.rows[0]);
}

deleteAdminSeed()
  .then(() => pool.end())
  .catch((err) => {
    console.error("Erro ao remover admin seed:", err);
    return pool.end().finally(() => process.exit(1));
  });
