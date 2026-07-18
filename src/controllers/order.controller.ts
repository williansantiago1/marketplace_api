import type { Request, Response } from "express";
import { orderService } from "../services/order.service";

export const orderController = {
  async checkout(req: Request, res: Response) {
    const orders = await orderService.checkout(req.user!.id, req.body);
    return res.status(201).json(orders);
  },

  async getById(req: Request, res: Response) {
    const order = await orderService.getById(
      req.user!.id,
      req.user!.role,
      req.params.id,
    );
    return res.json(order);
  },

  async listMine(req: Request, res: Response) {
    const orders = await orderService.listMine(req.user!.id);
    return res.json(orders);
  },

  async listByStore(req: Request, res: Response) {
    const orders = await orderService.listByStore(
      req.user!.id,
      req.user!.role,
      req.params.storeId,
    );
    return res.json(orders);
  },

  async cancel(req: Request, res: Response) {
    const order = await orderService.cancel(
      req.user!.id,
      req.user!.role,
      req.params.id,
    );
    return res.json(order);
  },
};
