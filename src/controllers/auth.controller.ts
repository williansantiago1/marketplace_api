import type { Request, Response } from "express";
import { authService } from "../services/auth.service";

export const authController = {
  async register(req: Request, res: Response) {
    const user = await authService.register(req.body);
    return res.status(201).json(user);
  },

  async login(req: Request, res: Response) {
    const result = await authService.login(req.body);
    return res.json(result);
  },

  async refresh(req: Request, res: Response) {
    const result = await authService.refresh(req.body);
    return res.json(result);
  },

  async logout(req: Request, res: Response) {
    await authService.logout(req.body.refreshToken ?? "");
    return res.status(204).send();
  },

  async me(req: Request, res: Response) {
    const user = await authService.me(req.user!.id);
    return res.json(user);
  },

  async becomeSeller(req: Request, res: Response) {
    const result = await authService.becomeSeller(req.user!.id);
    return res.json(result);
  },
};
