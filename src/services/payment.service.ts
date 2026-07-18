import type Stripe from "stripe";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../errors/app-error";
import { stripeProvider } from "../providers/stripe.provider";
import { orderRepository } from "../repositories/order.repository";
import { paymentRepository } from "../repositories/payment.repository";
import { processedStripeEventRepository } from "../repositories/processed-stripe-event.repository";
import type { CreatePaymentInput } from "../schemas/payment.schema";
import { orderService } from "./order.service";

export const paymentService = {
  async createPaymentForOrder(userId: string, input: CreatePaymentInput) {
    const order = await orderRepository.findById(input.orderId);
    if (!order) {
      throw new NotFoundError("Pedido não encontrado");
    }
    if (order.userId !== userId) {
      throw new ForbiddenError("Pedido de outro usuário");
    }
    if (order.status !== "PENDING_PAYMENT") {
      throw new ValidationError("Pedido não está aguardando pagamento");
    }

    const existing = await paymentRepository.findByOrderId(order.id);
    if (existing && existing.status === "PENDING" && existing.clientSecret) {
      return existing;
    }

    const intent = await stripeProvider.createPaymentIntent({
      orderId: order.id,
      amountInCents: order.totalInCents,
    });

    if (existing) {
      // raro: payment sem clientSecret — cria novo registro não é possível por unique orderId
      // neste MVP, se já existe PENDING sem secret, atualizamos via delete+create não; retorna erro claro
      throw new ValidationError("Pagamento já iniciado para este pedido");
    }

    return paymentRepository.create({
      orderId: order.id,
      providerPaymentId: intent.providerPaymentId,
      amountInCents: order.totalInCents,
      clientSecret: intent.clientSecret,
    });
  },

  async handleStripeWebhook(rawBody: Buffer, signature: string) {
    let event: Stripe.Event;
    try {
      event = stripeProvider.constructWebhookEvent(rawBody, signature);
    } catch {
      throw new ValidationError("Assinatura Stripe inválida");
    }

    // Stripe pode reenviar o mesmo evento — ignore se já processamos
    const already = await processedStripeEventRepository.exists(event.id);
    if (already) {
      return { received: true, duplicate: true };
    }

    if (
      event.type === "payment_intent.succeeded" ||
      event.type === "payment_intent.payment_failed"
    ) {
      const intent = event.data.object as Stripe.PaymentIntent;
      const payment = await paymentRepository.findByProviderPaymentId(intent.id);

      if (payment) {
        if (event.type === "payment_intent.succeeded") {
          await paymentRepository.updateStatus(payment.id, "SUCCEEDED");
          await orderService.markPaid(payment.orderId);
        } else {
          await paymentRepository.updateStatus(payment.id, "FAILED");
          await orderService.markFailed(payment.orderId);
        }
      }
    }

    await processedStripeEventRepository.create(event.id, event.type);
    return { received: true, duplicate: false };
  },
};
