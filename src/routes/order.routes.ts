import { Router } from "express";
import { orderController } from "../controllers/order.controller";
import { authenticate, requireRole } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { checkoutSchema } from "../schemas/order.schema";
import { asyncHandler } from "../shared/utils/async-handler";

export const orderRoutes = Router();

orderRoutes.use(authenticate);

orderRoutes.post(
  "/checkout",
  validate({ body: checkoutSchema }),
  asyncHandler(orderController.checkout),
);

orderRoutes.get("/", asyncHandler(orderController.listMine));

orderRoutes.get(
  "/store/:storeId",
  requireRole("SELLER", "ADMIN"),
  asyncHandler(orderController.listByStore),
);

orderRoutes.get("/:id", asyncHandler(orderController.getById));
orderRoutes.post("/:id/cancel", asyncHandler(orderController.cancel));
