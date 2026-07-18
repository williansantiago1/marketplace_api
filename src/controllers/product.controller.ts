import type { Request, Response } from "express";
import { productService } from "../services/product.service";

export const productController = {
  async create(req: Request, res: Response) {
    const product = await productService.create(
      req.user!.id,
      req.user!.role,
      req.body,
    );
    return res.status(201).json(product);
  },

  async update(req: Request, res: Response) {
    const product = await productService.update(
      req.user!.id,
      req.user!.role,
      req.params.id,
      req.body,
    );
    return res.json(product);
  },

  async getById(req: Request, res: Response) {
    const product = await productService.getById(req.params.id);
    return res.json(product);
  },

  async list(req: Request, res: Response) {
    const result = await productService.list(req.query as never);
    return res.json(result);
  },
};
