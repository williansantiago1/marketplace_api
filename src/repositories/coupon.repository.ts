import type { CouponType, Prisma } from "@prisma/client";
import { prisma } from "../shared/prisma";

type Db = Prisma.TransactionClient | typeof prisma;

export const couponRepository = {
  create(data: {
    code: string;
    type: CouponType;
    value: number;
    storeId?: string | null;
    minOrderInCents?: number | null;
    maxUses?: number | null;
    startsAt?: Date | null;
    expiresAt?: Date | null;
  }) {
    return prisma.coupon.create({ data });
  },

  findByCode(code: string) {
    return prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
  },

  incrementUsedCount(id: string, db: Db = prisma) {
    return db.coupon.update({
      where: { id },
      data: { usedCount: { increment: 1 } },
    });
  },

  listByStoreId(storeId: string) {
    return prisma.coupon.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
    });
  },
};
