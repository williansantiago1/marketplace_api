import { Router } from "express";
import { storeController } from "../controllers/store.controller";
import { authenticate, requireRole } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createStoreSchema, updateStoreSchema } from "../schemas/store.schema";
import { asyncHandler } from "../shared/utils/async-handler";

export const storeRoutes = Router();

storeRoutes.post(
  "/",
  authenticate,
  requireRole("SELLER", "ADMIN"),
  validate({ body: createStoreSchema }),
  asyncHandler(storeController.create),
);

storeRoutes.get(
  "/mine",
  authenticate,
  requireRole("SELLER", "ADMIN"),
  asyncHandler(storeController.listMine),
);

storeRoutes.get("/slug/:slug", asyncHandler(storeController.getBySlug));
storeRoutes.get("/:id", asyncHandler(storeController.getById));

storeRoutes.patch(
  "/:id",
  authenticate,
  requireRole("SELLER", "ADMIN"),
  validate({ body: updateStoreSchema }),
  asyncHandler(storeController.update),
);
