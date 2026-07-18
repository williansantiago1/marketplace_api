import type { Request, Response } from "express";
import { reviewService } from "../services/review.service";

export const reviewController = {
  async create(req: Request, res: Response) {
    const review = await reviewService.create(req.user!.id, req.body);
    return res.status(201).json(review);
  },

  async listByProduct(req: Request, res: Response) {
    const reviews = await reviewService.listByProduct(req.params.productId);
    return res.json(reviews);
  },
};
