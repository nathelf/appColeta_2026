# Deploy no Vercel com Supabase

## 1. Pré-requisitos

- Conta no [Vercel](https://vercel.com) e no [Supabase](https://supabase.com)
- Repositório no GitHub (ou GitLab/Bitbucket) com o código do projeto
- Banco Supabase configurado (schema executado via `supabase-schema.sql`)

## 2. Variáveis de ambiente no Vercel

No [Dashboard Vercel](https://vercel.com/dashboard) → seu projeto → **Settings** → **Environment Variables**, adicione:

| Variável      | Valor                             | Ambiente   |
|---------------|-----------------------------------|------------|
| `DB_HOST`     | `db.slrrphmdnnjzmkaaxscv.supabase.co` | Production, Preview |
| `DB_PORT`     | `5432`                            | Production, Preview |
| `DB_USER`     | `postgres`                        | Production, Preview |
| `DB_PASSWORD` | *sua senha do Supabase*           | Production, Preview |
| `DB_NAME`     | `postgres`                        | Production, Preview |
| `DB_SSL`      | `true`                            | Production, Preview |
| `JWT_SECRET`  | *string secreta aleatória (ex: use um gerador)* | Production, Preview |

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

**Erro de conexão com o banco**
- Confirme se o Supabase permite conexões externas (geralmente sim)
- Verifique se `DB_SSL=true`

**502 / Erro na API**
- Veja **Functions → Logs** no Vercel
- Revise as variáveis de ambiente

**Login não funciona**
- Confirme se executou `seedAdmin.js` no Supabase
- Verifique se o email/senha correspondem aos dados no banco
