import type { PaymentStatus } from "@prisma/client";
import { prisma } from "../shared/prisma";

export const paymentRepository = {
  create(data: {
    orderId: string;
    providerPaymentId: string;
    amountInCents: number;
    clientSecret?: string;
    status?: PaymentStatus;
  }) {
    return prisma.payment.create({
      data: {
        orderId: data.orderId,
        providerPaymentId: data.providerPaymentId,
        amountInCents: data.amountInCents,
        clientSecret: data.clientSecret,
        status: data.status ?? "PENDING",
      },
    });
  },

  findByOrderId(orderId: string) {
    return prisma.payment.findUnique({ where: { orderId } });
  },

  findByProviderPaymentId(providerPaymentId: string) {
    return prisma.payment.findUnique({
      where: { providerPaymentId },
      include: { order: true },
    });
  },

  updateStatus(id: string, status: PaymentStatus) {
    return prisma.payment.update({
      where: { id },
      data: { status },
    });
  },
};
