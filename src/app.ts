import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { env } from "./config/env";
import { errorMiddleware } from "./middlewares/error.middleware";
import { apiRoutes } from "./routes";
import { paymentWebhookHandler } from "./routes/payment.routes";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
    }),
  );

  app.use(
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // raw body só no webhook do Stripe
  app.post(
    "/api/payments/webhook",
    express.raw({ type: "application/json" }),
    paymentWebhookHandler,
  );

  app.use(express.json());

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: {
      error: {
        code: "RATE_LIMIT",
        message: "Muitas tentativas, tente novamente mais tarde",
      },
    },
  });

  app.use("/api/auth/login", authLimiter);
  app.use("/api/auth/register", authLimiter);

  app.use("/api", apiRoutes);

  app.use(errorMiddleware);

  return app;
}
