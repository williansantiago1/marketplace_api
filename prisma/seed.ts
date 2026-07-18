import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

async function wipe() {
  await prisma.processedStripeEvent.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.store.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  await wipe();

  const passwordHash = await argon2.hash("Senha123!");

  const [admin, seller1, seller2, cliente1, cliente2] = await Promise.all([
    prisma.user.create({
      data: {
        name: "Admin",
        email: "admin@marketplace.com",
        passwordHash,
        role: "ADMIN",
      },
    }),
    prisma.user.create({
      data: {
        name: "Seller Um",
        email: "seller1@marketplace.com",
        passwordHash,
        role: "SELLER",
      },
    }),
    prisma.user.create({
      data: {
        name: "Seller Dois",
        email: "seller2@marketplace.com",
        passwordHash,
        role: "SELLER",
      },
    }),
    // CLIENTEs começam comprando; podem virar SELLER via POST /api/auth/become-seller
    prisma.user.create({
      data: {
        name: "Cliente Um",
        email: "cliente1@marketplace.com",
        passwordHash,
        role: "CUSTOMER",
      },
    }),
    prisma.user.create({
      data: {
        name: "Cliente Dois",
        email: "cliente2@marketplace.com",
        passwordHash,
        role: "CUSTOMER",
      },
    }),
  ]);

  for (const user of [admin, seller1, seller2, cliente1, cliente2]) {
    await prisma.cart.create({ data: { userId: user.id } });
  }

  const [eletronicos, casa, moda, livros] = await Promise.all([
    prisma.category.create({ data: { name: "Eletrônicos", slug: "eletronicos" } }),
    prisma.category.create({ data: { name: "Casa", slug: "casa" } }),
    prisma.category.create({ data: { name: "Moda", slug: "moda" } }),
    prisma.category.create({ data: { name: "Livros", slug: "livros" } }),
  ]);

  const techStore = await prisma.store.create({
    data: {
      name: "Tech Store",
      slug: "tech-store",
      description: "Eletrônicos e gadgets",
      ownerId: seller1.id,
    },
  });

  const casaStore = await prisma.store.create({
    data: {
      name: "Casa & Cia",
      slug: "casa-e-cia",
      description: "Tudo para o lar",
      ownerId: seller2.id,
    },
  });

  const products = await Promise.all([
    prisma.product.create({
      data: {
        storeId: techStore.id,
        categoryId: eletronicos.id,
        name: "Fone Bluetooth",
        description: "Fone sem fio com cancelamento de ruído",
        priceInCents: 19990,
        stock: 40,
      },
    }),
    prisma.product.create({
      data: {
        storeId: techStore.id,
        categoryId: eletronicos.id,
        name: "Teclado Mecânico",
        description: "Switch blue, RGB",
        priceInCents: 34990,
        stock: 25,
      },
    }),
    prisma.product.create({
      data: {
        storeId: techStore.id,
        categoryId: eletronicos.id,
        name: "Mouse Gamer",
        description: "16000 DPI",
        priceInCents: 12990,
        stock: 50,
      },
    }),
    prisma.product.create({
      data: {
        storeId: techStore.id,
        categoryId: eletronicos.id,
        name: "Webcam Full HD",
        description: "1080p com microfone",
        priceInCents: 24990,
        stock: 30,
      },
    }),
    prisma.product.create({
      data: {
        storeId: casaStore.id,
        categoryId: casa.id,
        name: "Jogo de Panelas",
        description: "5 peças antiaderente",
        priceInCents: 18990,
        stock: 20,
      },
    }),
    prisma.product.create({
      data: {
        storeId: casaStore.id,
        categoryId: casa.id,
        name: "Luminária de Mesa",
        description: "LED com braço articulado",
        priceInCents: 8990,
        stock: 35,
      },
    }),
    prisma.product.create({
      data: {
        storeId: casaStore.id,
        categoryId: moda.id,
        name: "Avental de Cozinha",
        description: "Algodão impermeável",
        priceInCents: 4990,
        stock: 60,
      },
    }),
    prisma.product.create({
      data: {
        storeId: casaStore.id,
        categoryId: livros.id,
        name: "Receitas do Dia a Dia",
        description: "Livro de culinária prática",
        priceInCents: 5990,
        stock: 45,
      },
    }),
    prisma.product.create({
      data: {
        storeId: techStore.id,
        categoryId: livros.id,
        name: "Clean Code",
        description: "Referência clássica de engenharia de software",
        priceInCents: 9990,
        stock: 15,
      },
    }),
    prisma.product.create({
      data: {
        storeId: casaStore.id,
        categoryId: casa.id,
        name: "Organizador de Gavetas",
        description: "Kit com 3 unidades",
        priceInCents: 3990,
        stock: 80,
      },
    }),
  ]);

  await Promise.all([
    prisma.coupon.create({
      data: {
        code: "BEMVINDO10",
        type: "PERCENT",
        value: 10,
        maxUses: 100,
      },
    }),
    prisma.coupon.create({
      data: {
        code: "TECH50",
        type: "FIXED",
        value: 5000,
        storeId: techStore.id,
        maxUses: 100,
      },
    }),
    prisma.coupon.create({
      data: {
        code: "FRETE0",
        type: "PERCENT",
        value: 5,
        maxUses: 100,
      },
    }),
  ]);

  const demoProduct = products[0];
  const qty = 1;
  const unitPrice = demoProduct.priceInCents;

  await prisma.product.update({
    where: { id: demoProduct.id },
    data: { stock: { decrement: qty } },
  });

  await prisma.order.create({
    data: {
      userId: cliente1.id,
      storeId: techStore.id,
      status: "PENDING_PAYMENT",
      subtotalInCents: unitPrice * qty,
      discountInCents: 0,
      totalInCents: unitPrice * qty,
      items: {
        create: [
          {
            productId: demoProduct.id,
            productName: demoProduct.name,
            unitPriceInCents: unitPrice,
            quantity: qty,
            lineTotalInCents: unitPrice * qty,
          },
        ],
      },
    },
  });

  console.log("Seed OK");
  console.log("Admin: admin@marketplace.com / Senha123!");
  console.log("Seller: seller1@marketplace.com / Senha123!");
  console.log("Cliente: cliente1@marketplace.com / Senha123!");
  console.log("Dica: cliente pode vender com POST /api/auth/become-seller (depois de logar)");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
