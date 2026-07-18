import type { Request, Response } from "express";
import { storeService } from "../services/store.service";

export const storeController = {
  async create(req: Request, res: Response) {
    const store = await storeService.create(req.user!.id, req.user!.role, req.body);
    return res.status(201).json(store);
  },

  async update(req: Request, res: Response) {
    const store = await storeService.update(
      req.user!.id,
      req.user!.role,
      req.params.id,
      req.body,
    );
    return res.json(store);
  },

  async getById(req: Request, res: Response) {
    const store = await storeService.getById(
      req.params.id,
      req.user?.id,
      req.user?.role,
    );
    return res.json(store);
  },

  async getBySlug(req: Request, res: Response) {
    const store = await storeService.getBySlug(req.params.slug);
    return res.json(store);
  },

  async listMine(req: Request, res: Response) {
    const stores = await storeService.listMine(req.user!.id);
    return res.json(stores);
  },
};
