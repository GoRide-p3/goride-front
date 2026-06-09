# GoRide

Aplicacao do GoRide com frontend em React e backend em Node.js dentro do mesmo
repositorio.

## Stack

- Frontend: React, TypeScript, Vite e Tailwind
- Backend: Node.js, Express, TypeScript, Prisma e SQLite
- Validacao: Zod
- Autenticacao: bcrypt para senha e JWT para token

## Estrutura

```txt
src/       -> frontend
backend/   -> API do GoRide
```

O frontend consome a API configurada em `VITE_API_URL`. Para desenvolvimento
local, use:

```env
VITE_API_URL=http://localhost:3000
```

## Rodando o frontend

```bash
npm install
npm run dev
```

O frontend roda por padrao em:

```txt
http://localhost:5173
```

## Rodando o backend

```bash
npm run backend:install
npm run backend:prisma:migrate
npm run backend:prisma:generate
npm run backend:dev
```

A API roda por padrao em:

```txt
http://localhost:3000
```

## Observacao sobre dados

O projeto nao usa seed nem dados mockados no codigo. Para testar o fluxo, crie
usuarios e caronas pela propria aplicacao ou pelas rotas da API.
