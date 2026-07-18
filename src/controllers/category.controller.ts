import type { Request, Response } from "express";
import { categoryService } from "../services/category.service";

export const categoryController = {
  async create(req: Request, res: Response) {
    const category = await categoryService.create(req.body);
    return res.status(201).json(category);
  },

  async update(req: Request, res: Response) {
    const category = await categoryService.update(req.params.id, req.body);
    return res.json(category);
  },

  async list(_req: Request, res: Response) {
    const categories = await categoryService.list();
    return res.json(categories);
  },

  async getById(req: Request, res: Response) {
    const category = await categoryService.getById(req.params.id);
    return res.json(category);
  },
};
