import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_DAYS: z.coerce.number().default(7),
  STRIPE_SECRET_KEY: z.string().default("sk_test_replace_me"),
  STRIPE_WEBHOOK_SECRET: z.string().default("whsec_replace_me"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Env inválida:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
