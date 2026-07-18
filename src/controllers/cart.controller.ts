import type { Request, Response } from "express";
import { cartService } from "../services/cart.service";

export const cartController = {
  async get(req: Request, res: Response) {
    const cart = await cartService.getCart(req.user!.id);
    return res.json(cart);
  },

  async addItem(req: Request, res: Response) {
    const cart = await cartService.addItem(req.user!.id, req.body);
    return res.status(201).json(cart);
  },

  async updateItem(req: Request, res: Response) {
    const cart = await cartService.updateItem(
      req.user!.id,
      req.params.itemId,
      req.body,
    );
    return res.json(cart);
  },

  async removeItem(req: Request, res: Response) {
    const cart = await cartService.removeItem(req.user!.id, req.params.itemId);
    return res.json(cart);
  },
};
