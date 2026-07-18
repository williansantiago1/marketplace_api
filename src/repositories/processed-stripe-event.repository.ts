import { prisma } from "../shared/prisma";

export const processedStripeEventRepository = {
  exists(eventId: string) {
    return prisma.processedStripeEvent.findUnique({ where: { id: eventId } });
  },

  create(eventId: string, type: string) {
    return prisma.processedStripeEvent.create({
      data: { id: eventId, type },
    });
  },
};
