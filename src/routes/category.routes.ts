import { Router } from "express";
import { categoryController } from "../controllers/category.controller";
import { authenticate, requireRole } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../schemas/category.schema";
import { asyncHandler } from "../shared/utils/async-handler";

export const categoryRoutes = Router();

categoryRoutes.get("/", asyncHandler(categoryController.list));
categoryRoutes.get("/:id", asyncHandler(categoryController.getById));

categoryRoutes.post(
  "/",
  authenticate,
  requireRole("ADMIN"),
  validate({ body: createCategorySchema }),
  asyncHandler(categoryController.create),
);

categoryRoutes.patch(
  "/:id",
  authenticate,
  requireRole("ADMIN"),
  validate({ body: updateCategorySchema }),
  asyncHandler(categoryController.update),
);
