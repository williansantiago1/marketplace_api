import { Router } from "express";
import { cartController } from "../controllers/cart.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { addCartItemSchema, updateCartItemSchema } from "../schemas/cart.schema";
import { asyncHandler } from "../shared/utils/async-handler";

export const cartRoutes = Router();

cartRoutes.use(authenticate);

cartRoutes.get("/", asyncHandler(cartController.get));

cartRoutes.post(
  "/items",
  validate({ body: addCartItemSchema }),
  asyncHandler(cartController.addItem),
);

cartRoutes.patch(
  "/items/:itemId",
  validate({ body: updateCartItemSchema }),
  asyncHandler(cartController.updateItem),
);

cartRoutes.delete("/items/:itemId", asyncHandler(cartController.removeItem));
