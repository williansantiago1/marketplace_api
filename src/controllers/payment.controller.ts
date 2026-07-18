import type { Request, Response } from "express";
import { paymentService } from "../services/payment.service";

export const paymentController = {
  async create(req: Request, res: Response) {
    const payment = await paymentService.createPaymentForOrder(
      req.user!.id,
      req.body,
    );
    return res.status(201).json(payment);
  },

  async webhook(req: Request, res: Response) {
    const signature = req.headers["stripe-signature"];
    if (!signature || typeof signature !== "string") {
      return res.status(400).json({
        error: { code: "BAD_REQUEST", message: "Assinatura ausente" },
      });
    }

    const result = await paymentService.handleStripeWebhook(
      req.body as Buffer,
      signature,
    );
    return res.json(result);
  },
};
