import { z } from "zod";

export const createCouponSchema = z.object({
  code: z.string().min(2).max(40).transform((v) => v.toUpperCase()),
  type: z.enum(["PERCENT", "FIXED"]),
  value: z.number().int().positive(),
  storeId: z.string().uuid().optional().nullable(),
  minOrderInCents: z.number().int().min(0).optional().nullable(),
  maxUses: z.number().int().positive().optional().nullable(),
  startsAt: z.coerce.date().optional().nullable(),
  expiresAt: z.coerce.date().optional().nullable(),
});

export const validateCouponSchema = z.object({
  code: z.string().min(1),
  storeId: z.string().uuid().optional(),
  subtotalInCents: z.number().int().min(0).optional(),
});

export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type ValidateCouponInput = z.infer<typeof validateCouponSchema>;
