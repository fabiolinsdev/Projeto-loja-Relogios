---
name: loja-relogios
description: >-
  Orienta desenvolvimento da Loja Relógios (e-commerce de relógios).
  Use when working in loja-relogios, Projeto-loja-Relogios, frontend Vite,
  backend Fastify, produtos, pedidos, carrinho, login, ou ao subir o app no Chrome.
---

# Loja Relógios

SPA de vitrine + API. Tudo o que o cliente vê está em um único React; a API Fastify persiste no SQLite.

## Layout

- `frontend/` — Vite + React 19 + TypeScript. UI em `frontend/src/App.tsx` e `frontend/src/App.css`.
- `backend/` — Fastify + Prisma 7 + better-sqlite3. Entrada real: `backend/src/server.ts` (não usar `backend/server.js`).
- Banco: `backend/dev.db`. Client gerado em `backend/generated/prisma` (`output` no `schema.prisma`).
- `backend/.env` precisa de `DATABASE_URL` e `JWT_SECRET`. Nunca commitar `.env`.

## Subir o app

Portas fixas: frontend **5173**, API **3333** (`host: 0.0.0.0`). CORS só libera `http://localhost:5173`.

Se a porta já estiver em uso, não mate processos sem pedir. Reuse o servidor existente.

```bash
cd backend && npx tsx --env-file=.env src/server.ts
cd frontend && npm run dev
```

Abrir no Chrome: `http://localhost:5173/`.

Prisma (migrations usam `DATABASE_URL` de `backend/prisma.config.ts`):

```bash
cd backend && npx prisma migrate dev
cd backend && npx prisma generate
```

Categorias novas: `backend/src/create-category.ts` (`npx tsx src/create-category.ts`). O select do frontend hoje tem ID hardcoded de Casual — IDs mudam por banco.

## Regras ao mudar código

1. Manter API em `http://localhost:3333` e token JWT no `localStorage` chave `token`.
2. Rotas autenticadas: `preHandler: authenticate` + header `Authorization: Bearer <token>`.
3. Mensagens de erro da API em português (`message`).
4. Preços na UI: `toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })`.
5. Mudança de UI: verificar no Chrome o fluxo real (não só screenshot): login/cadastro, CRUD de produto, carrinho, pedido, status.

Detalhes de API e UI: [api.md](api.md) e [frontend.md](frontend.md).
