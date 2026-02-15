# Configuração do Banco no Supabase

Este guia explica como criar o banco de dados do App Coleta no Supabase e conectar o backend.

## Passo 1: Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e faça login
2. Clique em **New Project**
3. Preencha:
   - **Name**: appcoleta (ou outro)
   - **Database Password**: anote esta senha (é a senha do usuário `postgres`)
   - **Region**: South America (São Paulo)
4. Aguarde a criação do projeto (~2 min)

## Passo 2: Executar o script SQL

1. No dashboard do projeto, vá em **SQL Editor**
2. Clique em **New query**
3. Copie todo o conteúdo do arquivo `appcoleta-backend/scripts/supabase-schema.sql`
4. Cole no editor e clique em **Run** (ou Ctrl+Enter)
5. Verifique se não há erros e se todas as tabelas foram criadas

## Passo 3: Obter os dados de conexão

1. No Supabase, vá em **Project Settings** (ícone de engrenagem)
2. Clique em **Database** no menu lateral
3. Na seção **Connection string**, copie os dados:
   - **URI** (ou use Host, Port, User, Database)

Exemplo dos valores:
- **Host**: `db.xxxxxxxxxxxx.supabase.co`
- **Port**: `5432`
- **User**: `postgres`
- **Database**: `postgres`
- **Password**: a senha que você definiu na criação do projeto

## Passo 4: Configurar o backend

1. Edite `appcoleta-backend/.env` com os dados do Supabase:

```env
# SERVER
PORT=3001

# DATABASE (Supabase)
DB_HOST=db.xxxxxxxxxxxx.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha_do_projeto
DB_NAME=postgres
DB_SSL=true

# AUTH
JWT_SECRET=appcoleta_secret_dev
JWT_EXPIRES_IN=8h
```

Substitua:
- `db.xxxxxxxxxxxx.supabase.co` pelo Host real do seu projeto
- `sua_senha_do_projeto` pela senha do banco que você definiu

## Passo 5: Criar usuário administrador

Execute o script de seed para criar o primeiro admin:

```bash
cd appcoleta-backend
node scripts/seedAdmin.js
```

Credenciais padrão: **admin@biometria.com** / **admin123**

Para usar o email do resumo (admin@appcoleta.com), edite `scripts/seedAdmin.js` antes de rodar.

## Passo 6: Testar a conexão

```bash
cd appcoleta-backend
npm run dev
```

Acesse `http://localhost:3001/health` – deve retornar `{"ok":true,"databaseTime":"..."}`

## Conexão direta (DBeaver, etc.)

- **URL**: `postgresql://postgres:[SENHA]@db.xxxxxxxxxxxx.supabase.co:5432/postgres`
- **JDBC**: `jdbc:postgresql://db.xxxxxxxxxxxx.supabase.co:5432/postgres`

## Dicas

- **DB_SSL=true** é obrigatório para Supabase (conexão externa usa SSL).
