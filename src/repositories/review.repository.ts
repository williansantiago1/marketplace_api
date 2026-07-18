import { prisma } from "../shared/prisma";

export const reviewRepository = {
  create(data: {
    userId: string;
    productId: string;
    orderId: string;
    rating: number;
    comment?: string;
  }) {
    return prisma.review.create({ data });
  },

  findByProductId(productId: string) {
    return prisma.review.findMany({
      where: { productId },
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  findExisting(userId: string, productId: string, orderId: string) {
    return prisma.review.findUnique({
      where: {
        userId_productId_orderId: { userId, productId, orderId },
      },
    });
  },
};
