import { Router } from "express";
import { paymentController } from "../controllers/payment.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createPaymentSchema } from "../schemas/payment.schema";
import { asyncHandler } from "../shared/utils/async-handler";

export const paymentRoutes = Router();

paymentRoutes.post(
  "/",
  authenticate,
  validate({ body: createPaymentSchema }),
  asyncHandler(paymentController.create),
);

// webhook montado com raw body em app.ts
export const paymentWebhookHandler = asyncHandler(paymentController.webhook);
