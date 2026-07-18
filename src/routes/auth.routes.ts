import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  loginSchema,
  refreshSchema,
  registerSchema,
} from "../schemas/auth.schema";
import { asyncHandler } from "../shared/utils/async-handler";

export const authRoutes = Router();

authRoutes.post(
  "/register",
  validate({ body: registerSchema }),
  asyncHandler(authController.register),
);

authRoutes.post(
  "/login",
  validate({ body: loginSchema }),
  asyncHandler(authController.login),
);

authRoutes.post(
  "/refresh",
  validate({ body: refreshSchema }),
  asyncHandler(authController.refresh),
);

authRoutes.post(
  "/logout",
  authenticate,
  validate({ body: refreshSchema }),
  asyncHandler(authController.logout),
);

authRoutes.get("/me", authenticate, asyncHandler(authController.me));

authRoutes.post(
  "/become-seller",
  authenticate,
  asyncHandler(authController.becomeSeller),
);
