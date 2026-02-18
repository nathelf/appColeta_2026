# Deploy no Vercel com Supabase

## 1. Pré-requisitos e checklist

- [ ] Conta no [Vercel](https://vercel.com) e no [Supabase](https://supabase.com)
- [ ] Repositório no GitHub (ou GitLab/Bitbucket) com o código do projeto
- [ ] **Schema no Supabase**: executou `appcoleta-backend/scripts/supabase-schema.sql` no SQL Editor do projeto
- [ ] **Admin no banco**: rodou `node scripts/seedAdmin.js` no backend (com .env do Supabase) para criar o primeiro usuário
- [ ] Variáveis de ambiente do backend configuradas no Vercel (seção 2)

## 2. Variáveis de ambiente no Vercel

No [Dashboard Vercel](https://vercel.com/dashboard) → seu projeto → **Settings** → **Environment Variables**, adicione (marque **Production** e **Preview**):

| Variável      | Valor                             |
|---------------|-----------------------------------|
| `DB_HOST`     | `db.slrrphmdnnjzmkaaxscv.supabase.co` |
| `DB_PORT`     | `5432`                            |
| `DB_USER`     | `postgres`                        |
| `DB_PASSWORD` | A mesma senha do Supabase (ex: `@Senha@2025@` — use aspas no valor se tiver `@`) |
| `DB_NAME`     | `postgres`                        |
| `DB_SSL`      | `true`                            |
| `JWT_SECRET`  | Uma string secreta forte (ex: gere em [randomkeygen.com](https://randomkeygen.com)) |

Opcional (para o cliente Supabase no frontend):

| Variável                   | Valor |
|----------------------------|--------|
| `VITE_SUPABASE_URL`        | `https://slrrphmdnnjzmkaaxscv.supabase.co` |
| `VITE_SUPABASE_ANON_KEY`   | Sua chave anon (JWT longa do Supabase → API) |

## 3. Deploy

### Opção A: Via GitHub

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Importe o repositório do projeto
3. **Framework Preset**: Vite
4. **Root Directory**: `./` (raiz)
5. **Build Command**: `npm run build` (padrão)
6. **Output Directory**: `dist` (padrão)
7. **Install Command**: `npm install && npm install --prefix appcoleta-backend`
8. Clique em **Deploy**

### Opção B: Via CLI

```bash
npm i -g vercel
vercel
```

Siga o assistente e configure as variáveis quando solicitado ou em **Settings → Environment Variables** depois.

## 4. Após o deploy

1. Acesse o domínio gerado (ex: `seu-projeto.vercel.app`)
2. Teste o login: **admin@biometria.com** / **admin123** (ou o admin criado com `seedAdmin.js`)
3. Se o banco ainda não tiver o admin, rode localmente:  
   `cd appcoleta-backend && node scripts/seedAdmin.js`  
   (com `.env` apontando para o Supabase)

## 5. Domínio personalizado (opcional)

Em **Settings → Domains** do projeto, adicione um domínio customizado.

## 6. Estrutura do deploy

- **Frontend**: arquivos em `dist/` servidos pelo CDN
- **API**: rotas em `/api/*` tratadas pela serverless function (`api/[[...path]].js`)
- **Banco**: Supabase (PostgreSQL)

## 7. Solução de problemas

**"getaddrinfo ENOTFOUND db.xxx.supabase.co" ou "Erro ao cadastrar" na Vercel**
- As variáveis de ambiente **precisam estar configuradas no Vercel** (não só no `.env` local).  
  **Settings → Environment Variables** do projeto: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSL`, `JWT_SECRET`.
- Marque **Production** e **Preview** para cada variável.
- **Faça um novo deploy** depois de salvar as variáveis (Deployments → ⋮ no último deploy → Redeploy).

**Erro de conexão com o banco**
- Confirme se o Supabase permite conexões externas (geralmente sim)
- Verifique se `DB_SSL=true`

**502 / Erro na API**
- Veja **Functions → Logs** no Vercel
- Revise as variáveis de ambiente

**Login não funciona**
- Confirme se executou `seedAdmin.js` no Supabase (ou cadastrou o primeiro usuário pelo modal)
- Verifique se o email/senha correspondem aos dados no banco
