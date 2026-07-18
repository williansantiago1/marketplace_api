import type { Prisma } from "@prisma/client";
import { prisma } from "../shared/prisma";

type Db = Prisma.TransactionClient | typeof prisma;

export const productRepository = {
  create(data: {
    storeId: string;
    categoryId: string;
    name: string;
    description?: string;
    priceInCents: number;
    stock: number;
  }) {
    return prisma.product.create({ data });
  },

  findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: { store: true, category: true },
    });
  },

  async list(filters: {
    page: number;
    limit: number;
    categoryId?: string;
    storeId?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    onlyActive?: boolean;
  }) {
    const where: Prisma.ProductWhereInput = {};

    if (filters.onlyActive !== false) where.isActive = true;
    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.storeId) where.storeId = filters.storeId;
    if (filters.search) {
      where.name = { contains: filters.search, mode: "insensitive" };
    }
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.priceInCents = {};
      if (filters.minPrice !== undefined) where.priceInCents.gte = filters.minPrice;
      if (filters.maxPrice !== undefined) where.priceInCents.lte = filters.maxPrice;
    }

    const skip = (filters.page - 1) * filters.limit;

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: filters.limit,
        orderBy: { createdAt: "desc" },
        include: { store: true, category: true },
      }),
      prisma.product.count({ where }),
    ]);

    return { items, total, page: filters.page, limit: filters.limit };
  },

  update(
    id: string,
    data: Partial<{
      categoryId: string;
      name: string;
      description: string | null;
      priceInCents: number;
      stock: number;
      isActive: boolean;
    }>,
  ) {
    return prisma.product.update({ where: { id }, data });
  },

  decrementStock(productId: string, quantity: number, db: Db = prisma) {
    return db.product.update({
      where: { id: productId },
      data: { stock: { decrement: quantity } },
    });
  },

  incrementStock(productId: string, quantity: number, db: Db = prisma) {
    return db.product.update({
      where: { id: productId },
      data: { stock: { increment: quantity } },
    });
  },
};
