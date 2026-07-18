import { Router } from "express";
import { couponController } from "../controllers/coupon.controller";
import { authenticate, requireRole } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createCouponSchema,
  validateCouponSchema,
} from "../schemas/coupon.schema";
import { asyncHandler } from "../shared/utils/async-handler";

export const couponRoutes = Router();

couponRoutes.post(
  "/",
  authenticate,
  requireRole("SELLER", "ADMIN"),
  validate({ body: createCouponSchema }),
  asyncHandler(couponController.create),
);

couponRoutes.post(
  "/validate",
  authenticate,
  validate({ body: validateCouponSchema }),
  asyncHandler(couponController.validate),
);

couponRoutes.get(
  "/store/:storeId",
  authenticate,
  requireRole("SELLER", "ADMIN"),
  asyncHandler(couponController.listByStore),
);
