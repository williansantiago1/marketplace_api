import type { Prisma } from "@prisma/client";
import { prisma } from "../shared/prisma";

type Db = Prisma.TransactionClient | typeof prisma;

export const cartRepository = {
  findByUserId(userId: string) {
    return prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true },
          orderBy: { id: "asc" },
        },
      },
    });
  },

  createForUser(userId: string, db: Db = prisma) {
    return db.cart.create({
      data: { userId },
      include: { items: { include: { product: true } } },
    });
  },

  addItem(data: { cartId: string; productId: string; quantity: number }) {
    return prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: data.cartId,
          productId: data.productId,
        },
      },
      create: data,
      update: { quantity: { increment: data.quantity } },
      include: { product: true },
    });
  },

  updateItemQuantity(cartItemId: string, quantity: number) {
    return prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
      include: { product: true },
    });
  },

  removeItem(cartItemId: string) {
    return prisma.cartItem.delete({ where: { id: cartItemId } });
  },

  findItemById(cartItemId: string) {
    return prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true, product: true },
    });
  },

  clearCart(cartId: string, db: Db = prisma) {
    return db.cartItem.deleteMany({ where: { cartId } });
  },

  removeItemsByIds(ids: string[], db: Db = prisma) {
    return db.cartItem.deleteMany({ where: { id: { in: ids } } });
  },
};
