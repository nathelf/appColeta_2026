# Deploy na Vercel sem banco de dados (modo teste)

Use esse modo para subir o site e testar funcionalidades **sem configurar Supabase ou Postgres**.

## 1. Variáveis na Vercel

Vercel → seu projeto → **Settings** → **Environment Variables** (Production e Preview):

| Nome           | Valor   |
|----------------|---------|
| `USE_MEMORY_DB`| `true`  |
| `JWT_SECRET`   | qualquer string (ex: `appcoleta_teste_2026`) |

Só isso. Não precisa de `DATABASE_URL`, `DB_HOST`, etc.

## 2. Login

- **Email:** `admin@appcoleta.com`  
- **Senha:** `admin123`

## 3. Comportamento

- Os dados ficam em memória (arrays no servidor).
- Após um tempo de inatividade ou novo deploy, os dados são resetados.
- Serve para testar telas, fluxos e sincronização sem banco externo.

## 4. Redeploy

Depois de salvar as variáveis: **Deployments** → ⋮ → **Redeploy**.
