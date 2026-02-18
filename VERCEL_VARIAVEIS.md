# Variáveis para colar na Vercel

Vercel → seu projeto → **Settings** → **Environment Variables**.  
Crie cada variável, marque **Production** e **Preview**, salve e depois faça **Redeploy**.

---

## 1. DATABASE_URL (obrigatório para a API funcionar)

Nome: `DATABASE_URL`

Valor (use a linha abaixo; a senha já está codificada para `@Senha@2025@`):

```
postgresql://postgres.slrrphmdnnjzmkaaxscv:%40Senha%402025%40@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

Se sua senha do Supabase for **outra**, troque só a parte da senha na URL:
- `@` → `%40`
- `#` → `%23`
- Exemplo: senha `minha@senha` → use `minha%40senha` no lugar de `%40Senha%402025%40`.

---

## 2. JWT_SECRET (obrigatório)

Nome: `JWT_SECRET`

Valor: uma string aleatória longa (ex.: gere em https://randomkeygen.com e copie uma "Code Key").

Exemplo (troque por outra em produção):
```
appcoleta_vercel_secret_2026_xyz123
```

---

## 3. Frontend (opcional – para o cliente Supabase no build)

Nome: `VITE_SUPABASE_URL`  
Valor: `https://slrrphmdnnjzmkaaxscv.supabase.co`

Nome: `VITE_SUPABASE_ANON_KEY`  
Valor: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNscnJwaG1kbm5qem1rYWF4c2N2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExODcxOTcsImV4cCI6MjA4Njc2MzE5N30.Dz0pGYCFxUyvqxPfJ-m6Hq2cNr-UZNMaa1oJsR_JuoQ`

---

## Região do Supabase

A URL acima usa `aws-0-sa-east-1` (São Paulo). Se seu projeto Supabase estiver em outra região, troque:
- **US East**: `aws-0-us-east-1.pooler.supabase.com`
- **Europe**: `aws-0-eu-central-1.pooler.supabase.com`  
(veja em Supabase → Project Settings → General → Region.)

---

Depois de salvar todas: **Deployments** → ⋮ no último deploy → **Redeploy**.
