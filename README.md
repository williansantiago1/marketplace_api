# Marketplace API

API REST de um marketplace no estilo Mercado Livre (versão simplificada).  
Backend em TypeScript com autenticação JWT, multi-loja, carrinho, pedidos, cupons, avaliações e pagamentos via Stripe (test mode).

---

## O que tem

| Módulo | Funcionalidades |
|--------|-----------------|
| **Auth** | Register, login, refresh token, roles (`CUSTOMER`, `SELLER`, `ADMIN`) |
| **Catálogo** | Lojas, produtos, categorias |
| **Compra** | Carrinho, checkout, pedidos, cancelamento |
| **Promoções** | Cupons percentuais e valor fixo |
| **Pagamentos** | Stripe PaymentIntent + webhook com idempotência |
| **Reviews** | Avaliação pós-entrega |

---

## Stack

- **Runtime:** Node.js 20+
- **HTTP:** Express
- **Linguagem:** TypeScript
- **ORM / DB:** Prisma + PostgreSQL
- **Auth:** JWT + refresh token opaco + Argon2
- **Validação:** Zod
- **Segurança:** Helmet, CORS, rate-limit
- **Pagamentos:** Stripe (test mode)

---

## Arquitetura

Camadas simples e previsíveis:

```text
routes → controller → service → repository → Prisma / PostgreSQL
                           ↘
                        providers (hash, jwt, stripe)
```

| Camada | Responsabilidade |
|--------|------------------|
| Controller | HTTP (`req` / `res`) |
| Service | Regras de negócio |
| Repository | Acesso a dados |
| Entity | Types e enums |
| Provider | Libs externas |

---

## Pré-requisitos

- Node.js 20+
- Docker (PostgreSQL)
- Conta Stripe (opcional, só para pagamento)

> **Nota:** o Postgres do projeto sobe na porta **5435** para não conflitar com um Postgres local na 5432.

---

## Subindo o projeto

```bash
# 1. Banco
docker compose up -d

# 2. Ambiente
cp .env.example .env

# 3. Dependências
npm install

# 4. Migrations + seed
npx prisma migrate dev
npm run seed

# 5. API
npm run dev
```

API em: `http://localhost:3333`  
Healthcheck: `GET http://localhost:3333/health`

---

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Dev com hot reload (`tsx watch`) |
| `npm run build` | Compila TypeScript |
| `npm start` | Roda `dist/` |
| `npm run seed` | Popula o banco |
| `npx prisma migrate dev` | Cria/aplica migrations |
| `npx prisma studio` | UI do banco |

---

## Variáveis de ambiente

Veja `.env.example`. Principais:

```env
DATABASE_URL=postgresql://marketplace:marketplace@127.0.0.1:5435/marketplace?schema=public
JWT_ACCESS_SECRET=sua-chave-com-pelo-menos-32-caracteres
CORS_ORIGIN=http://localhost:5173
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## Contas do seed

Senha de todas: `Senha123!`

| E-mail | Role |
|--------|------|
| `admin@marketplace.com` | ADMIN |
| `seller1@marketplace.com` | SELLER (Tech Store) |
| `seller2@marketplace.com` | SELLER (Casa & Cia) |
| `cliente1@marketplace.com` | CUSTOMER |
| `cliente2@marketplace.com` | CUSTOMER |

Cupons de exemplo: `BEMVINDO10`, `TECH50`, `FRETE0`

---

## Fluxo rápido de teste

1. `POST /api/auth/login` com `cliente1@marketplace.com`
2. `GET /api/products` → pegar um `productId`
3. `POST /api/cart/items` → `{ "productId", "quantity": 1 }`
4. `POST /api/orders/checkout` → `{ "couponCode": "BEMVINDO10" }`
5. `POST /api/payments` → `{ "orderId" }` (precisa Stripe test)

Documentação completa dos endpoints: [`ENDPOINTS.md`](ENDPOINTS.md)  
Collection Insomnia: [`insomnia-collection.json`](insomnia-collection.json)

---

## Stripe (test mode)

1. Configure `STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET` no `.env`
2. Cartão de teste: `4242 4242 4242 4242`
3. Webhook local:

```bash
stripe listen --forward-to localhost:3333/api/payments/webhook
```

O pedido só muda para `PAID` via webhook (`payment_intent.succeeded`), com proteção contra eventos duplicados.

---

## Estrutura

```text
src/
├── controllers/
├── services/
├── repositories/
├── entities/
├── schemas/          # Zod
├── middlewares/
├── providers/        # Argon2, JWT, Stripe
├── routes/
├── errors/
├── config/
└── shared/
prisma/
├── schema.prisma
├── seed.ts
└── migrations/
```

---

## Roles

| Role | Pode |
|------|------|
| `CUSTOMER` | Comprar, avaliar, gerenciar carrinho/pedidos |
| `SELLER` | Gerir loja, produtos, cupons e pedidos da loja |
| `ADMIN` | Tudo + categorias |

---

## Licença

Projeto de portfólio / estudo. Use e adapte como quiser.
