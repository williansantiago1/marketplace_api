import type { Request, Response } from "express";
import { couponService } from "../services/coupon.service";

export const couponController = {
  async create(req: Request, res: Response) {
    const coupon = await couponService.create(
      req.user!.id,
      req.user!.role,
      req.body,
    );
    return res.status(201).json(coupon);
  },

  async validate(req: Request, res: Response) {
    const result = await couponService.validate(req.body);
    return res.json(result);
  },

  async listByStore(req: Request, res: Response) {
    const coupons = await couponService.listByStore(req.params.storeId);
    return res.json(coupons);
  },
};
