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

async function createUsuariosTable() {
  await pool.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      uuid UUID NOT NULL DEFAULT gen_random_uuid(),
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      cpf TEXT,
      data_nascimento DATE,
      senha TEXT,
      perfil TEXT NOT NULL DEFAULT 'COLETISTA',
      admin BOOLEAN NOT NULL DEFAULT false,
      ativo BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS uuid UUID;`);
  await pool.query(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS nome TEXT;`);
  await pool.query(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS email TEXT;`);
  await pool.query(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS cpf TEXT;`);
  await pool.query(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS data_nascimento DATE;`);
  await pool.query(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS senha TEXT;`);
  await pool.query(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS perfil TEXT;`);
  await pool.query(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS admin BOOLEAN;`);
  await pool.query(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS ativo BOOLEAN;`);
  await pool.query(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS created_at TIMESTAMP;`);
  await pool.query(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;`);

  await pool.query(`
    UPDATE usuarios
    SET uuid = COALESCE(uuid, gen_random_uuid()),
        perfil = CASE
          WHEN COALESCE(perfil, 'COLETISTA') IN ('OPERADOR', 'SUPERVISOR') THEN 'COLETISTA'
          ELSE COALESCE(perfil, 'COLETISTA')
        END,
        admin = COALESCE(admin, false),
        ativo = COALESCE(ativo, true),
        created_at = COALESCE(created_at, NOW()),
        updated_at = COALESCE(updated_at, NOW())
  `);

  await pool.query(`
    ALTER TABLE usuarios
    ALTER COLUMN uuid SET NOT NULL,
    ALTER COLUMN nome SET NOT NULL,
    ALTER COLUMN email SET NOT NULL
  `);

  await pool.query(`ALTER TABLE usuarios ALTER COLUMN uuid SET DEFAULT gen_random_uuid();`);
  await pool.query(`ALTER TABLE usuarios ALTER COLUMN perfil SET DEFAULT 'COLETISTA';`);
  await pool.query(`ALTER TABLE usuarios ALTER COLUMN admin SET DEFAULT false;`);
  await pool.query(`ALTER TABLE usuarios ALTER COLUMN ativo SET DEFAULT true;`);
  await pool.query(`ALTER TABLE usuarios ALTER COLUMN created_at SET DEFAULT NOW();`);
  await pool.query(`ALTER TABLE usuarios ALTER COLUMN updated_at SET DEFAULT NOW();`);

  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'usuarios_email_key'
      ) THEN
        ALTER TABLE usuarios ADD CONSTRAINT usuarios_email_key UNIQUE (email);
      END IF;
    END
    $$;
  `);

  await pool.query(`CREATE INDEX IF NOT EXISTS usuarios_email_idx ON usuarios (email);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS usuarios_uuid_idx ON usuarios (uuid);`);
}

createUsuariosTable()
  .then(() => {
    console.log("Tabela usuarios pronta.");
    return pool.end();
  })
  .catch((err) => {
    console.error("Erro ao criar tabela usuarios:", err);
    return pool.end().finally(() => process.exit(1));
  });
