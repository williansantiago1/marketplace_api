import Stripe from "stripe";
import { env } from "../config/env";

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export const stripeProvider = {
  async createPaymentIntent(input: {
    orderId: string;
    amountInCents: number;
    currency?: "brl";
  }) {
    const intent = await stripe.paymentIntents.create({
      amount: input.amountInCents,
      currency: input.currency ?? "brl",
      metadata: { orderId: input.orderId },
      automatic_payment_methods: { enabled: true },
    });

    return {
      providerPaymentId: intent.id,
      clientSecret: intent.client_secret ?? "",
    };
  },

  constructWebhookEvent(rawBody: Buffer, signature: string) {
    return stripe.webhooks.constructEvent(
      rawBody,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  },
};
