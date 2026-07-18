import { prisma } from "../shared/prisma";

export const storeRepository = {
  create(data: {
    name: string;
    slug: string;
    description?: string;
    ownerId: string;
  }) {
    return prisma.store.create({ data });
  },

  findById(id: string) {
    return prisma.store.findUnique({ where: { id } });
  },

  findBySlug(slug: string) {
    return prisma.store.findUnique({ where: { slug } });
  },

  findByOwnerId(ownerId: string) {
    return prisma.store.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" },
    });
  },

  update(
    id: string,
    data: Partial<{
      name: string;
      slug: string;
      description: string | null;
      isActive: boolean;
    }>,
  ) {
    return prisma.store.update({ where: { id }, data });
  },
};
