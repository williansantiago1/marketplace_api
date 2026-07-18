import { prisma } from "../shared/prisma";

export const categoryRepository = {
  create(data: { name: string; slug: string }) {
    return prisma.category.create({ data });
  },

  findById(id: string) {
    return prisma.category.findUnique({ where: { id } });
  },

  findBySlug(slug: string) {
    return prisma.category.findUnique({ where: { slug } });
  },

  list() {
    return prisma.category.findMany({ orderBy: { name: "asc" } });
  },

  update(id: string, data: Partial<{ name: string; slug: string }>) {
    return prisma.category.update({ where: { id }, data });
  },
};
