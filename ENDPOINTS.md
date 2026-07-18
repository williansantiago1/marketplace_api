# Endpoints — Marketplace API

## Importar no Insomnia

Arquivo pronto: [`insomnia-collection.json`](insomnia-collection.json)

1. Abra o Insomnia  
2. **Application → Preferences → Data → Import Data** (ou **Import/Export → Import**)  
3. Selecione `api/insomnia-collection.json`  
4. Ative o environment **Base Environment**  
5. Faça login → cole o `accessToken` na variável `token`

Pastas: Health → Auth → Categories → Stores → Products → Cart → Coupons → Orders → Payments → Reviews

---

Base URL: `http://localhost:3333`  
Prefixo da API: `http://localhost:3333/api`

Antes de tudo:

```bash
docker compose up -d
npm run dev
```

Teste rápido: `GET http://localhost:3333/health` → `{ "status": "ok" }`

---

## Contas do seed

| E-mail | Senha | Role |
|--------|-------|------|
| `admin@marketplace.com` | `Senha123!` | ADMIN |
| `seller1@marketplace.com` | `Senha123!` | SELLER (Tech Store) |
| `seller2@marketplace.com` | `Senha123!` | SELLER (Casa & Cia) |
| `cliente1@marketplace.com` | `Senha123!` | CUSTOMER |
| `cliente2@marketplace.com` | `Senha123!` | CUSTOMER |

Cupons: `BEMVINDO10`, `TECH50`, `FRETE0`  
Lojas (slug): `tech-store`, `casa-e-cia`

**Auth no Insomnia:** Bearer Token = `accessToken` do login.

---

## Checklist — fluxo completo (copie e marque)

```text
[ ] 1. GET /health
[ ] 2. POST /api/auth/login (cliente1)
[ ] 3. GET /api/auth/me
[ ] 4. GET /api/categories
[ ] 5. GET /api/products
[ ] 6. GET /api/stores/slug/tech-store
[ ] 7. POST /api/cart/items
[ ] 8. GET /api/cart
[ ] 9. POST /api/orders/checkout
[ ] 10. GET /api/orders
[ ] 11. Login seller1 → GET /api/stores/mine → POST /api/products
[ ] 12. Login admin → POST /api/categories
[ ] 13. POST /api/coupons/validate
[ ] 14. POST /api/payments (só com Stripe sk_test no .env)
```

---

## 0. Health

### `GET /health`

Sem auth. Sem body.

**Esperado:** `200`

```json
{ "status": "ok" }
```

---

## 1. Auth — `/api/auth`

### `POST /api/auth/register`

Sem auth.

```json
{
  "name": "Novo Cliente",
  "email": "novo@teste.com",
  "password": "Senha123!",
  "role": "CUSTOMER"
}
```

`role` opcional: `CUSTOMER` ou `SELLER` (nunca `ADMIN`).

**Esperado:** `201` — usuário sem senha.

---

### `POST /api/auth/login`

Sem auth. **Faça isso primeiro** e salve o `accessToken`.

```json
{
  "email": "cliente1@marketplace.com",
  "password": "Senha123!"
}
```

**Esperado:** `200`

```json
{
  "user": { "id": "...", "name": "...", "email": "...", "role": "CUSTOMER" },
  "accessToken": "eyJ...",
  "refreshToken": "abc123..."
}
```

---

### `POST /api/auth/refresh`

Sem auth.

```json
{
  "refreshToken": "COLE_O_REFRESH_AQUI"
}
```

**Esperado:** `200` — novos tokens.

---

### `POST /api/auth/logout`

Bearer + body:

```json
{
  "refreshToken": "COLE_O_REFRESH_AQUI"
}
```

**Esperado:** `204` (sem body).

---

### `GET /api/auth/me`

Bearer. Sem body.

**Esperado:** `200` — dados do usuário logado.

---

## 2. Categories — `/api/categories`

### `GET /api/categories`

Sem auth.

**Esperado:** `200` — lista (Eletrônicos, Casa, Moda, Livros…).

Copie um `id` de categoria para criar produto depois.

---

### `GET /api/categories/:id`

Sem auth. Troque `:id` pelo UUID.

---

### `POST /api/categories`

Bearer **ADMIN** (`admin@marketplace.com`).

```json
{
  "name": "Games",
  "slug": "games"
}
```

**Esperado:** `201`

---

### `PATCH /api/categories/:id`

Bearer **ADMIN**.

```json
{
  "name": "Games e Consoles"
}
```

**Esperado:** `200`

---

## 3. Stores — `/api/stores`

### `GET /api/stores/slug/tech-store`

Sem auth.

**Esperado:** `200` — loja Tech Store. Copie o `id`.

---

### `GET /api/stores/:id`

Sem auth. UUID da loja.

---

### `GET /api/stores/mine`

Bearer **SELLER** ou **ADMIN**.

Login: `seller1@marketplace.com`

**Esperado:** `200` — lojas do vendedor.

---

### `POST /api/stores`

Bearer **SELLER** ou **ADMIN**.

```json
{
  "name": "Minha Nova Loja",
  "slug": "minha-nova-loja",
  "description": "Loja de teste"
}
```

**Esperado:** `201`

---

### `PATCH /api/stores/:id`

Bearer dono da loja ou ADMIN.

```json
{
  "description": "Descrição atualizada"
}
```

**Esperado:** `200`

---

## 4. Products — `/api/products`

### `GET /api/products`

Sem auth.

Query opcional:

```
GET /api/products?page=1&limit=20&search=fone
GET /api/products?storeId=UUID&categoryId=UUID&minPrice=1000&maxPrice=50000
```

**Esperado:** `200`

```json
{
  "items": [ ... ],
  "total": 10,
  "page": 1,
  "limit": 20
}
```

Copie um `id` de produto para o carrinho.

---

### `GET /api/products/:id`

Sem auth.

---

### `POST /api/products`

Bearer **SELLER** (`seller1`) ou **ADMIN**.

Pegue `storeId` em `GET /stores/mine` e `categoryId` em `GET /categories`.

```json
{
  "storeId": "UUID_DA_LOJA",
  "categoryId": "UUID_DA_CATEGORIA",
  "name": "Produto Teste",
  "description": "Criado via Insomnia",
  "priceInCents": 9990,
  "stock": 15
}
```

Preço em **centavos** (`9990` = R$ 99,90).

**Esperado:** `201`

---

### `PATCH /api/products/:id`

Bearer dono da loja ou ADMIN.

```json
{
  "priceInCents": 8990,
  "stock": 20,
  "isActive": true
}
```

**Esperado:** `200`

---

## 5. Cart — `/api/cart`

Tudo com Bearer **CUSTOMER** (`cliente1`).

### `GET /api/cart`

Sem body. Cria carrinho vazio se não existir.

---

### `POST /api/cart/items`

```json
{
  "productId": "UUID_DO_PRODUTO",
  "quantity": 1
}
```

**Esperado:** `201` — carrinho com items. Copie o `id` do item se for editar/remover.

---

### `PATCH /api/cart/items/:itemId`

```json
{
  "quantity": 2
}
```

**Esperado:** `200`

---

### `DELETE /api/cart/items/:itemId`

Sem body.

**Esperado:** `200` — carrinho atualizado.

---

## 6. Coupons — `/api/coupons`

### `POST /api/coupons/validate`

Bearer (qualquer logado).

```json
{
  "code": "BEMVINDO10",
  "subtotalInCents": 10000
}
```

**Esperado:** `200` — cupom + `discountInCents`.

---

### `POST /api/coupons`

Bearer **SELLER** (com `storeId` da própria loja) ou **ADMIN** (global sem storeId).

```json
{
  "code": "PROMO20",
  "type": "PERCENT",
  "value": 20,
  "storeId": "UUID_DA_LOJA",
  "maxUses": 50
}
```

Cupom global (só ADMIN):

```json
{
  "code": "GLOBAL5",
  "type": "FIXED",
  "value": 500,
  "maxUses": 100
}
```

`type`: `PERCENT` (1–100) ou `FIXED` (centavos).

**Esperado:** `201`

---

### `GET /api/coupons/store/:storeId`

Bearer **SELLER**/ADMIN.

---

## 7. Orders — `/api/orders`

Bearer obrigatório.

### `POST /api/orders/checkout`

Cliente com itens no carrinho.

Sem cupom:

```json
{}
```

Com cupom:

```json
{
  "couponCode": "BEMVINDO10"
}
```

**Esperado:** `201` — array de pedidos (1 por loja).  
Status: `PENDING_PAYMENT`. Copie o `id` do pedido.

---

### `GET /api/orders`

Lista pedidos do usuário logado.

---

### `GET /api/orders/:id`

Detalhe do pedido (dono, seller da loja ou admin).

---

### `GET /api/orders/store/:storeId`

Bearer **SELLER**/ADMIN — pedidos da loja.

---

### `POST /api/orders/:id/cancel`

Sem body. Só se status for `PENDING_PAYMENT`.

**Esperado:** `200` — status `CANCELLED`, estoque devolvido.

---

## 8. Payments — `/api/payments`

### `POST /api/payments`

Bearer dono do pedido.  
Precisa de `STRIPE_SECRET_KEY=sk_test_...` válido no `.env`.

```json
{
  "orderId": "UUID_DO_PEDIDO"
}
```

**Esperado:** `201`

```json
{
  "id": "...",
  "orderId": "...",
  "providerPaymentId": "pi_...",
  "clientSecret": "pi_..._secret_...",
  "status": "PENDING",
  "amountInCents": 19990
}
```

Sem chave Stripe válida → erro da API Stripe.

### `POST /api/payments/webhook`

Não teste no Insomnia. Use Stripe CLI:

```bash
stripe listen --forward-to localhost:3333/api/payments/webhook
```

---

## 9. Reviews — `/api/reviews`

### `GET /api/reviews/product/:productId`

Sem auth. Lista avaliações do produto.

---

### `POST /api/reviews`

Bearer **CUSTOMER**.  
Só funciona se o pedido estiver `DELIVERED` e o produto estiver nesse pedido.

```json
{
  "productId": "UUID_DO_PRODUTO",
  "orderId": "UUID_DO_PEDIDO",
  "rating": 5,
  "comment": "Produto excelente"
}
```

**Esperado:** `201`  
Se o pedido ainda for `PENDING_PAYMENT` / `PAID` → erro de validação (regra: só `DELIVERED`).

Para testar review no MVP: atualize o status do pedido no banco para `DELIVERED` ou espere o fluxo completo.

---

## Ordem recomendada no Insomnia (passo a passo)

### A) Cliente compra

1. `POST /api/auth/login` → cliente1 → salve Bearer  
2. `GET /api/products` → copie `productId`  
3. `POST /api/cart/items` com esse productId  
4. `GET /api/cart` → confira  
5. `POST /api/orders/checkout` com `BEMVINDO10`  
6. `GET /api/orders` → confira pedido `PENDING_PAYMENT`

### B) Seller cadastra produto

1. `POST /api/auth/login` → seller1 → troque Bearer  
2. `GET /api/stores/mine` → copie `storeId`  
3. `GET /api/categories` → copie `categoryId`  
4. `POST /api/products` com JSON completo  
5. `GET /api/products` → veja o novo produto

### C) Admin cria categoria

1. Login admin  
2. `POST /api/categories` com name/slug novos

---

## Erros comuns

| Situação | Causa |
|----------|--------|
| `401` | Sem Bearer ou token expirado → faça login de novo |
| `403` | Role errada (ex.: CUSTOMER criando categoria) |
| `400` VALIDATION | JSON inválido / UUID errado / estoque / cupom |
| `404` | ID não existe |
| `409` | E-mail ou slug já cadastrado |
| Stripe error | `.env` ainda com `sk_test_replace_me` |

---

## Resumo de todos os endpoints

| Method | Path | Auth |
|--------|------|------|
| GET | `/health` | — |
| POST | `/api/auth/register` | — |
| POST | `/api/auth/login` | — |
| POST | `/api/auth/refresh` | — |
| POST | `/api/auth/logout` | Bearer |
| GET | `/api/auth/me` | Bearer |
| GET | `/api/categories` | — |
| GET | `/api/categories/:id` | — |
| POST | `/api/categories` | ADMIN |
| PATCH | `/api/categories/:id` | ADMIN |
| GET | `/api/stores/mine` | SELLER/ADMIN |
| GET | `/api/stores/slug/:slug` | — |
| GET | `/api/stores/:id` | — |
| POST | `/api/stores` | SELLER/ADMIN |
| PATCH | `/api/stores/:id` | SELLER/ADMIN |
| GET | `/api/products` | — |
| GET | `/api/products/:id` | — |
| POST | `/api/products` | SELLER/ADMIN |
| PATCH | `/api/products/:id` | SELLER/ADMIN |
| GET | `/api/cart` | Bearer |
| POST | `/api/cart/items` | Bearer |
| PATCH | `/api/cart/items/:itemId` | Bearer |
| DELETE | `/api/cart/items/:itemId` | Bearer |
| POST | `/api/orders/checkout` | Bearer |
| GET | `/api/orders` | Bearer |
| GET | `/api/orders/:id` | Bearer |
| GET | `/api/orders/store/:storeId` | SELLER/ADMIN |
| POST | `/api/orders/:id/cancel` | Bearer |
| POST | `/api/payments` | Bearer |
| POST | `/api/payments/webhook` | Stripe signature |
| POST | `/api/coupons` | SELLER/ADMIN |
| POST | `/api/coupons/validate` | Bearer |
| GET | `/api/coupons/store/:storeId` | SELLER/ADMIN |
| POST | `/api/reviews` | Bearer |
| GET | `/api/reviews/product/:productId` | — |
