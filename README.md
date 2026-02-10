# 📦 Sistema Web Full-Stack — Documentação do Projeto

## 📋 Visão Geral

Este repositório contém uma aplicação **Full-Stack** composta por:

* **Frontend:** React + TypeScript + Vite + Tailwind + shadcn-ui
* **Backend:** Node.js + Express
* **Banco de Dados:** PostgreSQL

O sistema permite execução local completa com comunicação via API REST.

---

# 🏗️ Arquitetura

```bash
project-root/
│
├── backend/          # API Node/Express
│   ├── src/
│   ├── .env
│   └── server.js
│
├── frontend/         # Aplicação React (Vite)
│   ├── src/
│   ├── vite.config.ts
│   └── package.json
│
└── README.md
```

---

# 🖥️ Pré-requisitos

Instale na máquina:

* Node.js 18+
* npm
* PostgreSQL

Verificar:

```bash
node -v
npm -v
psql --version
```

---

# ⚙️ Configuração do Backend

## 1️⃣ Entrar na pasta

```bash
cd backend
```

---

## 2️⃣ Instalar dependências

```bash
npm install
```

---

## 3️⃣ Criar arquivo `.env`

Crie dentro da pasta `/backend`:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=senha
DB_NAME=nome_do_banco

JWT_SECRET=seu_token_secreto
```

---

## 4️⃣ Rodar o servidor

```bash
npm run dev
```

ou

```bash
node server.js
```

Servidor iniciará em:

```bash
http://localhost:3000
```

---

# 🗄️ Banco de Dados

Exemplo de criação no PostgreSQL:

```sql
CREATE DATABASE nome_do_banco;
```

Restaurar dump ou criar tabelas conforme scripts do projeto.

---

# 🎨 Configuração do Frontend

## 1️⃣ Entrar na pasta

```bash
cd frontend
```

---

## 2️⃣ Instalar dependências

```bash
npm install
```

---

## 3️⃣ Configurar URL da API

Criar arquivo:

```bash
frontend/.env
```

Conteúdo:

```env
VITE_API_URL=http://localhost:3000
```

---

# 🔗 Proxy do Vite (Opcional)

Se quiser evitar CORS no dev, configure no `vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
```

Assim chamadas para:

```ts
/api/usuarios
```

irão para o backend.

---

# ▶️ Rodando o Frontend

```bash
npm run dev
```

Acesse:

```bash
http://localhost:5173
```

---

# 🔄 Fluxo de Execução Local

Ordem recomendada:

1️⃣ Subir banco PostgreSQL
2️⃣ Subir backend

```bash
cd backend
npm run dev
```

3️⃣ Subir frontend

```bash
cd frontend
npm run dev
```

---

# 🏗️ Build de Produção

## Frontend

```bash
cd frontend
npm run build
```

Gera:

```bash
/frontend/dist
```

---

## Backend

Normalmente roda direto:

```bash
node server.js
```

Ou com PM2:

```bash
pm2 start server.js
```

---

# 🌐 Deploy

Pode ser feito em:

* VPS (Ubuntu + Nginx)
* Vercel (frontend)
* Railway / Render (backend)
* Docker

Fluxo comum:

1. Build frontend
2. Publicar `/dist`
3. Subir backend
4. Configurar `.env` produção
5. Ajustar URL da API

---

# 🔐 Variáveis de Ambiente (Resumo)

Backend `.env`:

```env
PORT=
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=
JWT_SECRET=
```

Frontend `.env`:

```env
VITE_API_URL=
```

---

# 🧪 Scripts Disponíveis

## Backend

```bash
npm run dev     # Dev com nodemon
npm start       # Produção
```

## Frontend

```bash
npm run dev
npm run build
npm run preview
```

---

# 📂 Estrutura Recomendada de API

```bash
backend/src/
├── controllers/
├── routes/
├── services/
├── middlewares/
├── config/
└── server.js
```

---

# 🚨 Problemas Comuns

### CORS

Instalar:

```bash
npm install cors
```

Usar no backend:

```js
app.use(cors());
```

---

### Porta em uso

Trocar no `.env`:

```env
PORT=3001
```

---

### Banco não conecta

Verificar:

* Usuário
* Senha
* Porta 5432
* Serviço do PostgreSQL ativo

---

# 👥 Contribuição

```bash
git checkout -b feature/nome
git commit -m "feat: descrição"
git push origin feature/nome
```

Abrir Pull Request.

---

# 📄 Licença

Definir conforme necessidade do projeto.

---

# 📞 Suporte

Em caso de erro ao subir o ambiente, revise:

* `.env`
* Portas
* Banco ativo
* Dependências instaladas

Persistindo, abrir issue no repositório.
