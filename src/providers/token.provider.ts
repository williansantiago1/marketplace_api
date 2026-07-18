import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import type { Role } from "../entities/user.entity";
import { UnauthorizedError } from "../errors/app-error";

export type AccessTokenPayload = {
  sub: string;
  role: Role;
};

export const tokenProvider = {
  signAccessToken(payload: AccessTokenPayload) {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    });
  },

  verifyAccessToken(token: string): AccessTokenPayload {
    try {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
      return { sub: decoded.sub, role: decoded.role };
    } catch {
      throw new UnauthorizedError("Token inválido ou expirado");
    }
  },

  generateRefreshToken() {
    return crypto.randomBytes(48).toString("hex");
  },
};
