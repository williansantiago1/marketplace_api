import { z } from "zod";

export const checkoutSchema = z.object({
  couponCode: z.string().min(1).max(40).optional(),
});

export const orderIdParamSchema = z.object({
  id: z.string().uuid(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
