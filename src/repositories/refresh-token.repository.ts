import { prisma } from "../shared/prisma";

export const refreshTokenRepository = {
  create(data: { userId: string; token: string; expiresAt: Date }) {
    return prisma.refreshToken.create({ data });
  },

  findByToken(token: string) {
    return prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });
  },

  deleteByToken(token: string) {
    return prisma.refreshToken.deleteMany({ where: { token } });
  },

  deleteAllByUserId(userId: string) {
    return prisma.refreshToken.deleteMany({ where: { userId } });
  },
};
