import type { Prisma, Role } from "@prisma/client";
import { prisma } from "../shared/prisma";

const publicSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export const userRepository = {
  create(data: {
    name: string;
    email: string;
    passwordHash: string;
    role: Role;
  }) {
    return prisma.user.create({ data });
  },

  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  findPublicById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: publicSelect,
    });
  },

  updateRole(id: string, role: Role) {
    return prisma.user.update({
      where: { id },
      data: { role },
    });
  },
};
