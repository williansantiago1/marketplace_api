import { z } from "zod";

export const createProductSchema = z.object({
  storeId: z.string().uuid(),
  categoryId: z.string().uuid(),
  name: z.string().min(2).max(120),
  description: z.string().max(2000).optional(),
  priceInCents: z.number().int().positive(),
  stock: z.number().int().min(0),
});

export const updateProductSchema = z.object({
  categoryId: z.string().uuid().optional(),
  name: z.string().min(2).max(120).optional(),
  description: z.string().max(2000).optional().nullable(),
  priceInCents: z.number().int().positive().optional(),
  stock: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const listProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  categoryId: z.string().uuid().optional(),
  storeId: z.string().uuid().optional(),
  search: z.string().max(120).optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
