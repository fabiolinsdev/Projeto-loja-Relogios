# Frontend React

Não criar um app router. Extender `frontend/src/App.tsx` e classes em `frontend/src/App.css`.

## Estado

- `token` sincronizado com `localStorage.getItem/setItem/removeItem('token')`.
- Carrinho só em memória (`cart`); esvaziar depois de `POST /orders` ok.
- Catálogo: `GET /products` no mount (hoje o efeito **não** depende de `token` — se mudar fetch autenticado, atualizar o array de deps).
- Pedidos: `fetchOrders()` quando `token` muda e depois de criar/atualizar pedido.

## Chamadas HTTP

Base: `http://localhost:3333`. JSON `Content-Type: application/json` em POST/PUT/PATCH.

Rotas que exigem login: header `Authorization: Bearer ${token}`.

Padrão de erro: `if (!response.ok) { const data = await response.json(); alert(data.message); return }`.

Funções existentes para reutilizar: `login`, `register`, `logout`, `createProduct`, `updateProduct`, `deleteProduct`, `startEditingProduct`, `addToCart` / quantidade, `createOrder`, `fetchOrders`, `updateOrderStatus`, `getOrderStatusLabel`, `getAvailableStatuses`.

## UI / CSS

Ancoras do header: `#produtos`, `#carrinho`, `#pedidos`.

Cards: `auth-card`, `product-form-card`, `product-card`, `cart-card`, `order-card`, `hero-banner`, `site-header`.

Formulário de produto só renderiza se `token` existe. O mesmo form serve criar e editar (`editingProductId`).

Categoria no `<select>`: hoje uma option Casual com ID fixo do SQLite local. Ao listar categorias da API, substituir esse hardcode — não duplicar IDs mágicos.

Select de status do pedido: `disabled` quando `getAvailableStatuses` é vazio; opções = status atual + transições permitidas.

## Verificação no browser

1. Cadastro + login; header mostra Sair e “Você está autenticado!”.
2. Criar produto logado; aparece no grid com imagem se `imageUrl` válida.
3. Editar troca imagem (`imageUrl` no PUT); excluir some do grid.
4. Carrinho respeita estoque no `+`; finalizar compra exige login e carrinho não vazio.
5. Histórico aparece sem F5 (`fetchOrders` após criar).
6. Troca de status só nas transições válidas; labels com emoji iguais ao `getOrderStatusLabel`.
7. Layout: desktop e tela estreita se a mudança for visual/responsiva.
