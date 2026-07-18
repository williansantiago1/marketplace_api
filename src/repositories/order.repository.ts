import type { OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "../shared/prisma";

type Db = Prisma.TransactionClient | typeof prisma;

export const orderRepository = {
  createWithItems(
    data: {
      userId: string;
      storeId: string;
      couponId?: string | null;
      status?: OrderStatus;
      subtotalInCents: number;
      discountInCents: number;
      totalInCents: number;
      items: Array<{
        productId: string;
        productName: string;
        unitPriceInCents: number;
        quantity: number;
        lineTotalInCents: number;
      }>;
    },
    db: Db = prisma,
  ) {
    return db.order.create({
      data: {
        userId: data.userId,
        storeId: data.storeId,
        couponId: data.couponId,
        status: data.status ?? "PENDING_PAYMENT",
        subtotalInCents: data.subtotalInCents,
        discountInCents: data.discountInCents,
        totalInCents: data.totalInCents,
        items: { create: data.items },
      },
      include: { items: true, store: true, payment: true },
    });
  },

  findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        payment: true,
        store: true,
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });
  },

  findByUserId(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: { items: true, payment: true, store: true },
      orderBy: { createdAt: "desc" },
    });
  },

  findByStoreId(storeId: string) {
    return prisma.order.findMany({
      where: { storeId },
      include: { items: true, payment: true },
      orderBy: { createdAt: "desc" },
    });
  },

  updateStatus(id: string, status: OrderStatus, db: Db = prisma) {
    return db.order.update({
      where: { id },
      data: { status },
      include: { items: true, payment: true, store: true },
    });
  },
};
