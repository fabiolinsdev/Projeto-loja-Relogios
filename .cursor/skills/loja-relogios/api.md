# API Fastify

Registrar rotas novas em `backend/src/server.ts` com `app.register(...)`.

## Endpoints

| Método | Caminho | Auth | Notas |
|--------|---------|------|--------|
| GET | `/` | não | Healthcheck |
| POST | `/users` | não | Cadastro. Zod `createUserSchema`. 409 se e-mail existe. Senha com bcrypt (10). Nunca devolver `password`. |
| POST | `/login` | não | `{ token, user, message }`. JWT: `{ id, email }`. |
| GET | `/products` | não | `include: { category: true }` |
| GET | `/products/:id` | não | 404 `Produto não encontrado` |
| POST | `/products` | sim | `userId: request.user.id`. 201 |
| PUT | `/products/:id` | sim | Só o dono (`id` + `userId`). Schema partial. |
| DELETE | `/products/:id` | sim | Só o dono. 204 |
| GET | `/orders` | sim | Pedidos do usuário, `createdAt desc`, items + product |
| POST | `/orders` | sim | Body `{ items: [{ productId, quantity }] }`. Decrementa `stock`. 201 |
| PATCH | `/orders/:id/status` | sim | Só o dono. Máquina de estados abaixo |

## Auth

`backend/src/auth.ts`: `request.jwtVerify()`. Falha → 401 `{ message: 'Não autorizado' }`.

Tipagem JWT: `backend/src/types/fastify-jwt.d.ts`. Usar `request.user.id`.

## Validação

- Produto: `backend/src/schemas/product.ts` — `safeParse`; 400 `{ message: 'Dados inválidos', errors }`.
- Usuário: `backend/src/schemas/user.ts` — `parse` (pode lançar se o body for inválido).
- Status de pedido: enum Zod inline na rota.

`imageUrl`: URL opcional ou string vazia.

## Prisma

Adapter: `PrismaBetterSqlite3({ url: "./dev.db" })` em `backend/src/lib/prisma.ts` (caminho relativo ao cwd `backend/`).

Models: `User`, `Category`, `Product` (obrigatório `userId` e `categoryId`), `Order` (`status` default `PENDENTE`), `OrderItem` (preço copiado no momento da compra).

Após mudar `prisma/schema.prisma`: migrate + generate. Não editar `generated/prisma` na mão.

## Status do pedido

Transições válidas (backend e frontend devem bater):

- `PENDENTE` → `PAGO` ou `CANCELADO`
- `PAGO` → `ENVIADO` ou `CANCELADO`
- `ENVIADO` → `ENTREGUE`
- `ENTREGUE` e `CANCELADO` → nenhuma

Pedido novo começa `PENDENTE`. Criação de pedido valida estoque e quantidade > 0.
