import { Router } from "express";
import { reviewController } from "../controllers/review.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createReviewSchema } from "../schemas/review.schema";
import { asyncHandler } from "../shared/utils/async-handler";

export const reviewRoutes = Router();

reviewRoutes.post(
  "/",
  authenticate,
  validate({ body: createReviewSchema }),
  asyncHandler(reviewController.create),
);

reviewRoutes.get(
  "/product/:productId",
  asyncHandler(reviewController.listByProduct),
);
