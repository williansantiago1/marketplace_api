import type { NextFunction, Request, Response } from "express";
import type { Role } from "../entities/user.entity";
import { ForbiddenError, UnauthorizedError } from "../errors/app-error";
import { tokenProvider } from "../providers/token.provider";

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(new UnauthorizedError("Token ausente"));
  }

  const token = header.slice(7);
  const payload = tokenProvider.verifyAccessToken(token);
  req.user = { id: payload.sub, role: payload.role };
  return next();
}

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError("Token ausente"));
    }
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError("Permissão insuficiente"));
    }
    return next();
  };
}
