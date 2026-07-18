import { Router } from "express";
import { productController } from "../controllers/product.controller";
import { authenticate, requireRole } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createProductSchema,
  listProductsQuerySchema,
  updateProductSchema,
} from "../schemas/product.schema";
import { asyncHandler } from "../shared/utils/async-handler";

export const productRoutes = Router();

productRoutes.get(
  "/",
  validate({ query: listProductsQuerySchema }),
  asyncHandler(productController.list),
);

productRoutes.get("/:id", asyncHandler(productController.getById));

productRoutes.post(
  "/",
  authenticate,
  requireRole("SELLER", "ADMIN"),
  validate({ body: createProductSchema }),
  asyncHandler(productController.create),
);

productRoutes.patch(
  "/:id",
  authenticate,
  requireRole("SELLER", "ADMIN"),
  validate({ body: updateProductSchema }),
  asyncHandler(productController.update),
);
